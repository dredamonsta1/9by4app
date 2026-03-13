// src/components/Rooms/Room.jsx — Live room page
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LiveKitRoom,
  useParticipants,
  useLocalParticipant,
  useDataChannel,
  useTracks,
  AudioTrack,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { Track, DataPacket_Kind } from "livekit-client";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./Room.module.css";

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || "wss://placeholder.livekit.cloud";

// ─── Data message types (sent over LiveKit data channel) ────────────────────
const MSG = {
  RAISE_HAND: "raise_hand",
  LOWER_HAND: "lower_hand",
  CHAT: "chat",
  HAND_APPROVED: "hand_approved",
  HAND_DENIED: "hand_denied",
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function parseMeta(metaStr) {
  try { return JSON.parse(metaStr || "{}"); } catch { return {}; }
}

function getRole(participant) {
  return parseMeta(participant?.metadata)?.role || "listener";
}

// ─── Individual speaker audio track ─────────────────────────────────────────
function ParticipantAudio({ participant }) {
  const tracks = useTracks(
    [{ source: Track.Source.Microphone, withPlaceholder: false }],
    { participant }
  );
  return tracks.map((t) => <AudioTrack key={t.publication.trackSid} trackRef={t} />);
}

// ─── Participant tile ────────────────────────────────────────────────────────
function ParticipantTile({ participant, isLocalHost, roomId, onPromote, handsUp }) {
  const role = getRole(participant);
  const meta = parseMeta(participant?.metadata);
  const isSpeaking = participant?.isSpeaking;
  const name = participant?.name || `User ${meta.userId}`;
  const hasHandUp = handsUp.has(participant?.identity);

  return (
    <div className={`${styles.participantTile} ${isSpeaking ? styles.speaking : ""}`}>
      <div className={styles.avatar}>{name[0]?.toUpperCase()}</div>
      <span className={styles.participantName}>{name}</span>
      <span className={`${styles.roleBadge} ${styles[role]}`}>{role}</span>
      {hasHandUp && <span className={styles.handIcon}>✋</span>}
      {isLocalHost && role === "listener" && !hasHandUp && (
        <button
          className={styles.promoteBtn}
          onClick={() => onPromote(participant.identity)}
        >
          Invite to speak
        </button>
      )}
      {isLocalHost && hasHandUp && (
        <div className={styles.handActions}>
          <button className={styles.approveBtn} onClick={() => onPromote(participant.identity)}>
            Approve
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main inner room UI (rendered inside <LiveKitRoom>) ──────────────────────
function RoomInner({ room, currentUser, onEnd }) {
  const navigate = useNavigate();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const [muted, setMuted] = useState(true);
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [handsUp, setHandsUp] = useState(new Set());
  const [myHandUp, setMyHandUp] = useState(false);
  const chatEndRef = useRef(null);

  const myRole = getRole(localParticipant);
  const isHost = myRole === "host";
  const isSpeaker = myRole === "speaker" || myRole === "host";

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Handle incoming data messages
  const handleDataReceived = useCallback((msg) => {
    try {
      const { type, payload, from } = JSON.parse(new TextDecoder().decode(msg.payload));

      if (type === MSG.CHAT) {
        setChat((prev) => [...prev, { from: payload.username, text: payload.text, ts: Date.now() }]);
      } else if (type === MSG.RAISE_HAND) {
        setHandsUp((prev) => new Set([...prev, msg.from?.identity]));
      } else if (type === MSG.LOWER_HAND) {
        setHandsUp((prev) => { const s = new Set(prev); s.delete(msg.from?.identity); return s; });
      } else if (type === MSG.HAND_APPROVED) {
        // Host approved our raise — re-fetch token with speaker role (handled via LiveKit permission update)
        setMyHandUp(false);
      }
    } catch { /* ignore malformed messages */ }
  }, []);

  useDataChannel(handleDataReceived);

  const sendData = useCallback((payload) => {
    if (!localParticipant) return;
    const encoded = new TextEncoder().encode(JSON.stringify(payload));
    localParticipant.publishData(encoded, DataPacket_Kind.RELIABLE);
  }, [localParticipant]);

  const toggleMute = () => {
    if (!localParticipant) return;
    localParticipant.setMicrophoneEnabled(muted);
    setMuted(!muted);
  };

  const handleRaiseHand = () => {
    const next = !myHandUp;
    setMyHandUp(next);
    sendData({ type: next ? MSG.RAISE_HAND : MSG.LOWER_HAND });
  };

  const handlePromote = async (identity) => {
    try {
      await axiosInstance.post(`/rooms/${room.room_id}/promote/${identity}`);
      setHandsUp((prev) => { const s = new Set(prev); s.delete(identity); return s; });
      // Notify the promoted participant
      sendData({ type: MSG.HAND_APPROVED, payload: { identity } });
    } catch (err) {
      console.error("Promote failed:", err);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    sendData({ type: MSG.CHAT, payload: { username: currentUser.username, text } });
    setChat((prev) => [...prev, { from: currentUser.username, text, ts: Date.now(), isMe: true }]);
    setChatInput("");
  };

  const handleEndOrLeave = async () => {
    if (isHost) {
      if (!window.confirm("End the room for everyone?")) return;
      try { await axiosInstance.post(`/rooms/${room.room_id}/end`); } catch { /* ignore */ }
    }
    onEnd();
    navigate("/rooms");
  };

  // Partition participants
  const speakers = participants.filter((p) => ["host", "speaker"].includes(getRole(p)));
  const listeners = participants.filter((p) => getRole(p) === "listener");

  return (
    <div className={styles.roomLayout}>
      {/* Render all audio tracks */}
      <RoomAudioRenderer />

      {/* Left panel — room info + participants */}
      <div className={styles.leftPanel}>
        <div className={styles.roomInfo}>
          <div className={styles.liveChip}><span className={styles.liveDot} />LIVE</div>
          <h2 className={styles.roomTitle}>{room.title}</h2>
          {room.description && <p className={styles.roomDesc}>{room.description}</p>}
          <p className={styles.hostLine}>Hosted by {room.host_username}</p>
        </div>

        <div className={styles.participantsSection}>
          <h3 className={styles.sectionLabel}>On stage ({speakers.length})</h3>
          <div className={styles.speakerGrid}>
            {speakers.map((p) => (
              <ParticipantTile
                key={p.identity}
                participant={p}
                isLocalHost={isHost}
                roomId={room.room_id}
                onPromote={handlePromote}
                handsUp={handsUp}
              />
            ))}
          </div>

          {listeners.length > 0 && (
            <>
              <h3 className={styles.sectionLabel}>Audience ({listeners.length})</h3>
              <div className={styles.listenerGrid}>
                {listeners.map((p) => (
                  <ParticipantTile
                    key={p.identity}
                    participant={p}
                    isLocalHost={isHost}
                    roomId={room.room_id}
                    onPromote={handlePromote}
                    handsUp={handsUp}
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
                <span className={styles.chatFrom}>{msg.from}</span>
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
          <button type="submit" className={styles.chatSendBtn} disabled={!chatInput.trim()}>
            Send
          </button>
        </form>
      </div>

      {/* Bottom controls bar */}
      <div className={styles.controlsBar}>
        {isSpeaker && (
          <button
            className={`${styles.controlBtn} ${muted ? styles.mutedBtn : styles.unmutedBtn}`}
            onClick={toggleMute}
          >
            {muted ? "🎤 Unmute" : "🔇 Mute"}
          </button>
        )}
        {!isSpeaker && (
          <button
            className={`${styles.controlBtn} ${myHandUp ? styles.handActiveBtn : styles.handBtn}`}
            onClick={handleRaiseHand}
          >
            {myHandUp ? "✋ Lower hand" : "✋ Raise hand"}
          </button>
        )}
        <button className={styles.leaveBtn} onClick={handleEndOrLeave}>
          {isHost ? "End Room" : "Leave"}
        </button>
      </div>
    </div>
  );
}

// ─── Room page — fetches token then connects ─────────────────────────────────
function Room() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [token, setToken] = useState(location.state?.token || null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Always fetch room details
        const roomRes = await axiosInstance.get(`/rooms/${id}`);
        setRoom(roomRes.data);

        // If we don't already have a token (came from lobby, not from creation)
        if (!token) {
          const tokenRes = await axiosInstance.post(`/rooms/${id}/token`);
          setToken(tokenRes.data.token);
        }
      } catch (err) {
        const msg = err.response?.status === 410
          ? "This room has ended."
          : err.response?.data?.message || "Failed to join room.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div className={styles.centerState}>Joining room...</div>;
  }

  if (error) {
    return (
      <div className={styles.centerState}>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.backBtn} onClick={() => navigate("/rooms")}>
          Back to Rooms
        </button>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={LIVEKIT_URL}
      token={token}
      connect={true}
      audio={true}
      video={false}
      onConnected={() => setConnected(true)}
      onDisconnected={() => navigate("/rooms")}
      className={styles.lkRoom}
    >
      {connected && room && (
        <RoomInner
          room={room}
          currentUser={user}
          onEnd={() => {}}
        />
      )}
      {!connected && <div className={styles.centerState}>Connecting...</div>}
    </LiveKitRoom>
  );
}

export default Room;
