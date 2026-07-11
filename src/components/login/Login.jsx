import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { setCredentials } from "../../store/authSlice";
import axiosInstance from "../../utils/axiosInstance";
import styles from "../../AuthLayout.module.css";
import stanboxLogo from "../../assets/stanbox-logo.png";

const RESEND_COOLDOWN_SECONDS = 30;

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // 'email' | 'code'
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Tick down the resend cooldown once per second.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const sendCode = async (silent = false) => {
    setError("");
    if (!silent) setInfo("");
    setSending(true);
    try {
      await axiosInstance.post("/auth/send-code", { email: email.trim().toLowerCase() });
      setStep("code");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      if (!silent) setInfo("We sent a 6-digit code to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send code.");
    } finally {
      setSending(false);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    await sendCode(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || sending) return;
    setInfo("");
    await sendCode(true);
    setInfo("Code resent. Check your inbox.");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setVerifying(true);
    try {
      const res = await axiosInstance.post("/auth/verify-code", {
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      dispatch(setCredentials({ user, token }));
      navigate("/");
    } catch (err) {
      if (err.response?.data?.reason === "signup_required") {
        setError("No account for that email. Sign up first.");
      } else {
        setError(err.response?.data?.message || "Invalid or expired code.");
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <img src={stanboxLogo} alt="StanBox" className={styles.authLogo} />
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          {step === "email"
            ? "Enter your email — we'll send you a sign-in code."
            : `We sent a 6-digit code to ${email}. Enter it below.`}
        </p>

        {error && <div className={styles.errorBox}>{error}</div>}
        {info && !error && <div className={styles.successBox}>{info}</div>}

        {step === "email" ? (
          <form onSubmit={handleSendCode}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className={styles.input}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={sending}
              />
            </div>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={sending || !email.trim()}
            >
              {sending ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className={styles.formGroup}>
              <label htmlFor="code">Sign-in code</label>
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
              {verifying ? "Verifying…" : "Sign in"}
            </button>

            <div style={{ marginTop: "0.85rem", display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "center" }}>
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
                  setStep("email");
                  setCode("");
                  setError("");
                  setInfo("");
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
                Use a different email
              </button>
            </div>
          </form>
        )}

        <div className={styles.authFooter}>
          <p>
            No invite yet? <Link to="/signup">Join the Waitlist</Link>
          </p>
          <p>
            Have an invite code? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
