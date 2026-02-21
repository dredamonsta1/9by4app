import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { checkCanDM, createConversation } from "../redux/actions/messagesActions";
import { setActiveConversation } from "../redux/messagesSlice";
import styles from "./Messages/MessagesPanel.module.css";

const MessageButton = ({ targetUserId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [canDM, setCanDM] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingConvId, setExistingConvId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const result = await checkCanDM(targetUserId);
      if (!cancelled) {
        setCanDM(result.canDM);
        setExistingConvId(result.conversationId || null);
        setLoading(false);
      }
    };
    check();
    return () => { cancelled = true; };
  }, [targetUserId]);

  const handleClick = async () => {
    setLoading(true);
    let convId = existingConvId;
    if (!convId) {
      convId = await dispatch(createConversation(targetUserId));
    }
    if (convId) {
      dispatch(setActiveConversation(convId));
      navigate("/profile");
    }
    setLoading(false);
  };

  if (!canDM && !loading) return null;

  return (
    <button
      className={styles.messageBtn}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "..." : "Message"}
    </button>
  );
};

export default MessageButton;
