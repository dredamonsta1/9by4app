import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/authSlice";
import axiosInstance from "../../utils/axiosInstance";
import styles from "../../AuthLayout.module.css";
import stanboxLogo from "../../assets/stanbox-logo.png";

const RESEND_COOLDOWN_SECONDS = 30;

function Signup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Step 1 details that ride through to verify.
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [username, setUsername] = useState("");
  const [inviteCode, setInviteCode] = useState(searchParams.get("code") || "");

  const [step, setStep] = useState("details"); // 'details' | 'code'
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const normalizedEmail = () => email.trim().toLowerCase();

  const sendCode = async (silent = false) => {
    setMessage({ text: "", type: "" });
    setSending(true);
    try {
      await axiosInstance.post("/auth/send-code", { email: normalizedEmail() });
      setStep("code");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      if (!silent) {
        setMessage({
          text: "We sent a 6-digit code to your email.",
          type: "success",
        });
      } else {
        setMessage({
          text: "Code resent. Check your inbox.",
          type: "success",
        });
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to send code.",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim() || !username.trim() || !inviteCode.trim()) {
      setMessage({ text: "All fields are required.", type: "error" });
      return;
    }
    await sendCode(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || sending) return;
    await sendCode(true);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    if (!/^\d{6}$/.test(code.trim())) {
      setMessage({
        text: "Enter the 6-digit code from your email.",
        type: "error",
      });
      return;
    }
    setVerifying(true);
    try {
      const res = await axiosInstance.post("/auth/verify-code", {
        email: normalizedEmail(),
        code: code.trim(),
        username: username.trim(),
        invite_code: inviteCode.trim().toUpperCase(),
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      dispatch(setCredentials({ user, token }));
      navigate("/");
    } catch (err) {
      setMessage({
        text:
          err.response?.data?.message ||
          "Could not activate your account. Check your invite + code.",
        type: "error",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <img src={stanboxLogo} alt="StanBox" className={styles.authLogo} />
        <h1 className={styles.title}>
          {step === "details" ? "Creator Registration" : "Confirm your email"}
        </h1>
        <p className={styles.subtitle}>
          {step === "details"
            ? "Enter your details — we'll email you a 6-digit code to activate."
            : `We sent a 6-digit code to ${email}. Enter it below to finish.`}
        </p>

        {message.text && (
          <div
            className={
              message.type === "success" ? styles.successBox : styles.errorBox
            }
          >
            {message.text}
          </div>
        )}

        {step === "details" ? (
          <form onSubmit={handleSendCode}>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!!searchParams.get("email")}
                placeholder="email@example.com"
                autoComplete="email"
                required
                disabled={sending}
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label>Invite Code</label>
              <input
                type="text"
                className={styles.input}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="ENTER-CODE"
                required
                readOnly={!!searchParams.get("code")}
                disabled={sending}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Choose Username</label>
              <input
                type="text"
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoComplete="username"
                required
                disabled={sending}
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={
                sending ||
                !email.trim() ||
                !username.trim() ||
                !inviteCode.trim()
              }
            >
              {sending ? "Sending code…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className={styles.formGroup}>
              <label htmlFor="code">Sign-up code</label>
              <input
                id="code"
                className={styles.input}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                required
                autoFocus
                disabled={verifying}
              />
            </div>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={verifying || code.length !== 6}
            >
              {verifying ? "Activating…" : "Activate account"}
            </button>

            <div
              style={{
                marginTop: "0.85rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || sending || verifying}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#b3b3b3",
                  cursor: resendCooldown > 0 ? "default" : "pointer",
                  fontSize: "0.85rem",
                  padding: 0,
                }}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("details");
                  setCode("");
                  setMessage({ text: "", type: "" });
                }}
                disabled={verifying || sending}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  padding: 0,
                }}
              >
                Edit your details
              </button>
            </div>
          </form>
        )}

        <div className={styles.authFooter}>
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
