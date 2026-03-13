/**
 * src/components/Rooms/Room.jsx — Live room (raw WebRTC + Socket.io)
 *
 * Mesh topology:
 *   • Each SPEAKER creates peer connections to every other speaker
 *   • LISTENERS create receive-only connections to each speaker
 *   • All signaling (offer / answer / ICE) goes through Socket.io
 *   • Chat + raise-hand + host-controls also use Socket.io
 *
 * Peer connection map:  peerConnections = { [remoteSocketId]: RTCPeerConnection }
 * Remote audio streams: remoteStreams   = { [remoteSocketId]: MediaStream }
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./Room.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "https://ninebyfourapi.herokuapp.com";
const SOCKET_URL = API_BASE.replace("/api", ""); // strip /api suffix for socket connection

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

// ─── Small audio element component ──────────────────────────────────────────
function RemoteAudio({ stream }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
  return <audio ref={ref} autoPlay playsInline />;
}

// ─── Participant tile ────────────────────────────────────────────────────────
function ParticipantTile({ participant, isLocalHost, onPromote, onMute, isSelf }) {
  const { socketId, username, role, hasHandUp } = participant;
  return (
    <div className={`${styles.participantTile} ${isSelf ? styles.self : ""}`}>
      <div className={styles.avatar}>{username?.[0]?.toUpperCase()}</div>
      <span className={styles.participantName}>{username}{isSelf ? " (you)" : ""}</span>
      <span className={`${styles.roleBadge} ${styles[role]}`}>{role}</span>
      {hasHandUp && <span className={styles.handIcon}>✋</span>}
      {isLocalHost && !isSelf && role === "listener" && !hasHandUp && (
        <button className={styles.promoteBtn} onClick={() => onPromote(socketId)}>
          Invite to speak
        </button>
      )}
      {isLocalHost && !isSelf && hasHandUp && (
        <div className={styles.handActions}>
          <button className={styles.approveBtn} onClick={() => onPromote(socketId)}>Approve</button>
        </div>
      )}
      {isLocalHost && !isSelf && (role === "speaker" || role === "host") && (
        <button className={styles.muteBtn} onClick={() => onMute(socketId)}>Mute</button>
      )}
    </div>
  );
}

// ─── Main Room component ─────────────────────────────────────────────────────
function Room() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Participant state (socketId → participant object)
  const [participants, setParticipants] = useState(new Map());
  const [mySocketId, setMySocketId] = useState(null);
  const [myRole, setMyRole] = useState("listener");

  // Audio state
  const [muted, setMuted] = useState(true);
  const [remoteStreams, setRemoteStreams] = useState({}); // { socketId: MediaStream }

  // UI state
  const [myHandUp, setMyHandUp] = useState(false);
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  // Refs (stable across renders)
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnections = useRef({}); // { socketId: RTCPeerConnection }
  const myRoleRef = useRef("listener");

  // Keep myRoleRef in sync
  useEffect(() => { myRoleRef.current = myRole; }, [myRole]);

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getLocalStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      // Start muted
      stream.getAudioTracks().forEach((t) => { t.enabled = false; });
      return stream;
    } catch (err) {
      console.warn("getUserMedia failed:", err.message);
      return null;
    }
  }, []);

  const createPeerConnection = useCallback((remoteSocketId, isInitiator) => {
    if (peerConnections.current[remoteSocketId]) return peerConnections.current[remoteSocketId];

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnections.current[remoteSocketId] = pc;

    // Send ICE candidates to the remote peer
    pc.onicecandidate = ({ candidate }) => {
      if (candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", { targetSocketId: remoteSocketId, candidate });
      }
    };

    // Receive remote audio track
    pc.ontrack = ({ streams }) => {
      if (streams?.[0]) {
        setRemoteStreams((prev) => ({ ...prev, [remoteSocketId]: streams[0] }));
      }
    };

    // If I'm a speaker/host, add my local audio track
    if (localStreamRef.current && (myRoleRef.current === "speaker" || myRoleRef.current === "host")) {
      localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current));
    }

    if (isInitiator) {
      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current?.emit("offer", { targetSocketId: remoteSocketId, sdp: pc.localDescription });
        } catch (err) {
          console.error("createOffer error:", err);
        }
      };
    }

    return pc;
  }, []);

  const closePeerConnection = useCallback((remoteSocketId) => {
    peerConnections.current[remoteSocketId]?.close();
    delete peerConnections.current[remoteSocketId];
    setRemoteStreams((prev) => {
      const next = { ...prev };
      delete next[remoteSocketId];
      return next;
    });
  }, []);

  // ── Socket.io setup ───────────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      // Fetch room details
      try {
        const res = await axiosInstance.get(`/rooms/${roomId}`);
        if (!mounted) return;
        if (res.data.status === "ended") { setError("This room has ended."); setLoading(false); return; }
        setRoom(res.data);
      } catch {
        if (mounted) { setError("Room not found."); setLoading(false); }
        return;
      }

      // Connect Socket.io with JWT
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
      });
      socketRef.current = socket;

      socket.on("connect_error", (err) => {
        if (mounted) setError(`Connection failed: ${err.message}`);
      });

      // ── room-joined: we just connected, received full participant list
      socket.on("room-joined", async ({ participants: list, mySocketId: sid, myRole: role }) => {
        if (!mounted) return;
        setMySocketId(sid);
        setMyRole(role);
        myRoleRef.current = role;

        const map = new Map(list.map((p) => [p.socketId, p]));
        setParticipants(map);
        setLoading(false);

        // If I'm a speaker/host, get the mic and create offers to all existing speakers
        if (role === "host" || role === "speaker") {
          await getLocalStream();
          const speakers = list.filter((p) => p.socketId !== sid && (p.role === "host" || p.role === "speaker"));
          for (const p of speakers) {
            createPeerConnection(p.socketId, true);
          }
        } else {
          // Listener: create receive-only connections to all existing speakers
          const speakers = list.filter((p) => p.role === "host" || p.role === "speaker");
          for (const sp of speakers) {
            const pc = createPeerConnection(sp.socketId, false);
            // Add receive-only transceivers so the speaker knows to send us audio
            pc.addTransceiver("audio", { direction: "recvonly" });
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.emit("offer", { targetSocketId: sp.socketId, sdp: pc.localDescription });
            } catch (err) {
              console.error("listener offer error:", err);
            }
          }
        }
      });

      // ── New participant joined
      socket.on("participant-joined", async (participant) => {
        if (!mounted) return;
        setParticipants((prev) => new Map(prev).set(participant.socketId, participant));

        const isSpeaker = participant.role === "host" || participant.role === "speaker";
        if (isSpeaker) {
          // If I'm also a speaker, create a connection (the new speaker will send the offer)
          // If I'm a listener, wait for the new speaker to send me an offer
        }
      });

      // ── Participant left
      socket.on("participant-left", ({ socketId }) => {
        if (!mounted) return;
        setParticipants((prev) => { const m = new Map(prev); m.delete(socketId); return m; });
        closePeerConnection(socketId);
      });

      // ── Signaling: offer received
      socket.on("offer", async ({ fromSocketId, sdp }) => {
        if (!mounted) return;
        const isNewSpeaker = participants.get(fromSocketId)?.role !== "listener";
        const pc = createPeerConnection(fromSocketId, false);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { targetSocketId: fromSocketId, sdp: pc.localDescription });
        } catch (err) {
          console.error("handle offer error:", err);
        }
      });

      // ── Signaling: answer received
      socket.on("answer", async ({ fromSocketId, sdp }) => {
        if (!mounted) return;
        const pc = peerConnections.current[fromSocketId];
        if (pc) {
          try { await pc.setRemoteDescription(new RTCSessionDescription(sdp)); }
          catch (err) { console.error("handle answer error:", err); }
        }
      });

      // ── Signaling: ICE candidate
      socket.on("ice-candidate", async ({ fromSocketId, candidate }) => {
        if (!mounted) return;
        const pc = peerConnections.current[fromSocketId];
        if (pc && candidate) {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
          catch (err) { console.warn("addIceCandidate error:", err); }
        }
      });

      // ── Role changes
      socket.on("promoted", async ({ role }) => {
        if (!mounted) return;
        setMyRole(role);
        myRoleRef.current = role;
        setMyHandUp(false);
        // Get mic and create offers to all current speakers
        await getLocalStream();
        setParticipants((prev) => {
          const speakers = [...prev.values()].filter(
            (p) => p.socketId !== socket.id && (p.role === "host" || p.role === "speaker")
          );
          for (const sp of speakers) {
            // Add local track to existing PC or create new one
            const pc = peerConnections.current[sp.socketId];
            if (pc && localStreamRef.current) {
              localStreamRef.current.getTracks().forEach((t) => {
                try { pc.addTrack(t, localStreamRef.current); } catch { /* already added */ }
              });
            } else {
              createPeerConnection(sp.socketId, true);
            }
          }
          return prev;
        });
      });

      socket.on("demoted", ({ role }) => {
        if (!mounted) return;
        setMyRole(role);
        myRoleRef.current = role;
        // Stop sending audio
        localStreamRef.current?.getTracks().forEach((t) => { t.enabled = false; });
        setMuted(true);
      });

      socket.on("role-changed", ({ socketId, role }) => {
        if (!mounted) return;
        setParticipants((prev) => {
          const m = new Map(prev);
          const p = m.get(socketId);
          if (p) m.set(socketId, { ...p, role });
          return m;
        });
      });

      // ── Host controls
      socket.on("force-muted", () => {
        if (!mounted) return;
        localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = false; });
        setMuted(true);
      });

      // ── Raise hand events (host receives these)
      socket.on("hand-raised", ({ socketId }) => {
        if (!mounted) return;
        setParticipants((prev) => {
          const m = new Map(prev);
          const p = m.get(socketId);
          if (p) m.set(socketId, { ...p, hasHandUp: true });
          return m;
        });
      });

      socket.on("hand-lowered", ({ socketId }) => {
        if (!mounted) return;
        setParticipants((prev) => {
          const m = new Map(prev);
          const p = m.get(socketId);
          if (p) m.set(socketId, { ...p, hasHandUp: false });
          return m;
        });
      });

      // ── Chat
      socket.on("chat-message", (msg) => {
        if (!mounted) return;
        setChat((prev) => [...prev, { ...msg, isMe: msg.userId === user?.id }]);
      });

      // ── Room ended
      socket.on("room-ended", () => {
        if (!mounted) return;
        navigate("/rooms");
      });

      // Join the room
      socket.emit("join-room", { roomId: parseInt(roomId) });
    };

    setup();

    return () => {
      mounted = false;
      // Close all peer connections
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      // Stop local tracks
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      // Disconnect socket
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Controls ──────────────────────────────────────────────────────────────

  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !muted;
    stream.getAudioTracks().forEach((t) => { t.enabled = next; });
    setMuted(!next);
  };

  const handleRaiseHand = () => {
    const next = !myHandUp;
    setMyHandUp(next);
    socketRef.current?.emit(next ? "raise-hand" : "lower-hand");
  };

  const handlePromote = (targetSocketId) => {
    socketRef.current?.emit("promote", { targetSocketId });
  };

  const handleMute = (targetSocketId) => {
    socketRef.current?.emit("mute-participant", { targetSocketId });
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socketRef.current?.emit("chat-message", { text: chatInput.trim() });
    setChatInput("");
  };

  const handleLeaveOrEnd = async () => {
    if (myRole === "host") {
      if (!window.confirm("End the room for everyone?")) return;
      socketRef.current?.emit("end-room");
    }
    navigate("/rooms");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <div className={styles.centerState}>Joining room...</div>;
  if (error) return (
    <div className={styles.centerState}>
      <p className={styles.errorText}>{error}</p>
      <button className={styles.backBtn} onClick={() => navigate("/rooms")}>Back to Rooms</button>
    </div>
  );

  const isHost = myRole === "host";
  const isSpeaker = myRole === "speaker" || myRole === "host";
  const allParticipants = [...participants.values()];
  const onStage = allParticipants.filter((p) => p.role === "host" || p.role === "speaker");
  const audience = allParticipants.filter((p) => p.role === "listener");

  return (
    <div className={styles.roomLayout}>
      {/* Hidden audio elements for remote streams */}
      {Object.entries(remoteStreams).map(([sid, stream]) => (
        <RemoteAudio key={sid} stream={stream} />
      ))}

      {/* Left panel */}
      <div className={styles.leftPanel}>
        <div className={styles.roomInfo}>
          <div className={styles.liveChip}><span className={styles.liveDot} />LIVE</div>
          <h2 className={styles.roomTitle}>{room?.title}</h2>
          {room?.description && <p className={styles.roomDesc}>{room.description}</p>}
          <p className={styles.hostLine}>Hosted by {room?.host_username}</p>
        </div>

        <div className={styles.participantsSection}>
          <h3 className={styles.sectionLabel}>On stage ({onStage.length})</h3>
          <div className={styles.speakerGrid}>
            {onStage.map((p) => (
              <ParticipantTile
                key={p.socketId}
                participant={p}
                isLocalHost={isHost}
                onPromote={handlePromote}
                onMute={handleMute}
                isSelf={p.socketId === mySocketId}
              />
            ))}
          </div>

          {audience.length > 0 && (
            <>
              <h3 className={styles.sectionLabel}>Audience ({audience.length})</h3>
              <div className={styles.listenerGrid}>
                {audience.map((p) => (
                  <ParticipantTile
                    key={p.socketId}
                    participant={p}
                    isLocalHost={isHost}
                    onPromote={handlePromote}
                    onMute={handleMute}
                    isSelf={p.socketId === mySocketId}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right panel — chat */}
      <div className={styles.rightPanel}>
        <div className={styles.chatHeader}>Room Chat</div>
        <div className={styles.chatMessages}>
          {chat.length === 0 ? (
            <p className={styles.noChat}>No messages yet.</p>
          ) : (
            chat.map((msg, i) => (
              <div key={i} className={`${styles.chatMsg} ${msg.isMe ? styles.chatMine : ""}`}>
                <span className={styles.chatFrom}>{msg.username}</span>
                <span className={styles.chatText}>{msg.text}</span>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
        <form className={styles.chatForm} onSubmit={handleSendChat}>
          <input
            className={styles.chatInput}
            type="text"
            placeholder="Send a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            maxLength={300}
          />
          <button type="submit" className={styles.chatSendBtn} disabled={!chatInput.trim()}>Send</button>
        </form>
      </div>

      {/* Controls bar */}
      <div className={styles.controlsBar}>
        {isSpeaker ? (
          <button
            className={`${styles.controlBtn} ${muted ? styles.mutedBtn : styles.unmutedBtn}`}
            onClick={toggleMute}
          >
            {muted ? "🎤 Unmute" : "🔇 Mute"}
          </button>
        ) : (
          <button
            className={`${styles.controlBtn} ${myHandUp ? styles.handActiveBtn : styles.handBtn}`}
            onClick={handleRaiseHand}
          >
            {myHandUp ? "✋ Lower hand" : "✋ Raise hand"}
          </button>
        )}
        <button className={styles.leaveBtn} onClick={handleLeaveOrEnd}>
          {isHost ? "End Room" : "Leave"}
        </button>
      </div>
    </div>
  );
}

export default Room;
