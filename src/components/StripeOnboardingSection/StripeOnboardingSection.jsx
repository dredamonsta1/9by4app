import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./StripeOnboardingSection.module.css";

// Verified-artist Stripe Connect onboarding + commerce kill switch.
// Renders inside ArtistSettings above the world-fields editor.
const StripeOnboardingSection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onboarding, setOnboarding] = useState(false);
  const [togglingCommerce, setTogglingCommerce] = useState(false);
  const [toggleError, setToggleError] = useState(null);

  const fetchStatus = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `/artists/me/stripe/status${refresh ? "?refresh=1" : ""}`
      );
      setStatus(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load Stripe status.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + handle return-from-onboarding URL params.
  useEffect(() => {
    const stripeStatusParam = searchParams.get("stripe_status");
    if (stripeStatusParam === "return") {
      fetchStatus(true);
      // Clear the param so a hard refresh doesn't re-trigger the live sync.
      const next = new URLSearchParams(searchParams);
      next.delete("stripe_status");
      setSearchParams(next, { replace: true });
    } else {
      fetchStatus(false);
      if (stripeStatusParam === "refresh") {
        const next = new URLSearchParams(searchParams);
        next.delete("stripe_status");
        setSearchParams(next, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartOnboarding = async () => {
    setOnboarding(true);
    setError(null);
    try {
      const res = await axiosInstance.post("/artists/me/stripe/onboard");
      const url = res.data?.onboarding_url;
      if (!url) throw new Error("No onboarding URL returned.");
      window.location.href = url;
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to start onboarding.");
      setOnboarding(false);
    }
  };

  const handleCommerceToggle = async (nextValue) => {
    setTogglingCommerce(true);
    setToggleError(null);
    const prevValue = status?.commerce_enabled;
    setStatus((s) => (s ? { ...s, commerce_enabled: nextValue } : s));
    try {
      const res = await axiosInstance.patch("/artists/me/commerce", {
        commerce_enabled: nextValue,
      });
      setStatus((s) => (s ? { ...s, commerce_enabled: !!res.data?.commerce_enabled } : s));
    } catch (err) {
      // Revert optimistic update.
      setStatus((s) => (s ? { ...s, commerce_enabled: prevValue } : s));
      setToggleError(
        err.response?.data?.message ||
          (err.response?.data?.reason === "stripe_not_ready"
            ? "Finish Stripe setup first."
            : "Failed to update toggle.")
      );
    } finally {
      setTogglingCommerce(false);
    }
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Payouts</h2>
        <p className={styles.muted}>Loading…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Payouts</h2>
        <p className={styles.error}>{error}</p>
        <button type="button" className={styles.linkBtn} onClick={() => fetchStatus(false)}>
          Try again
        </button>
      </section>
    );
  }

  const verified = !!(status?.charges_enabled && status?.payouts_enabled);
  const hasAccount = !!status?.has_account;
  const commerceOn = !!status?.commerce_enabled;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Payouts</h2>

      {!verified ? (
        <>
          <div className={`${styles.badge} ${hasAccount ? styles.badgePending : styles.badgeNeutral}`}>
            <span className={styles.dot} aria-hidden="true" />
            {hasAccount ? "Onboarding incomplete" : "Not set up"}
          </div>
          <p className={styles.help}>
            {hasAccount
              ? "Stripe still needs a few details from you. Continue setup to finish — once you're verified, you can enable downloads on your albums."
              : "Connect a Stripe account to start accepting payments. We use Stripe Connect so payouts go directly to you (we take 10%)."}
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleStartOnboarding}
            disabled={onboarding}
          >
            {onboarding
              ? "Opening Stripe…"
              : hasAccount
              ? "Continue setup →"
              : "Set up payouts →"}
          </button>
        </>
      ) : (
        <>
          <div className={`${styles.badge} ${styles.badgeOk}`}>
            <span className={styles.checkmark} aria-hidden="true">✓</span>
            Verified — accepting payments
          </div>

          <div className={styles.toggleRow}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={commerceOn}
                onChange={(e) => handleCommerceToggle(e.target.checked)}
                disabled={togglingCommerce}
              />
              <span className={styles.toggleTrack}>
                <span className={styles.toggleThumb} />
              </span>
            </label>
            <div className={styles.toggleCopy}>
              <span className={styles.toggleLabel}>Accept payments on stanbox</span>
              <span className={styles.toggleHelp}>
                Buy buttons render on your albums that have prices set.
              </span>
            </div>
          </div>
          {toggleError && <p className={styles.toggleError}>{toggleError}</p>}

          <button
            type="button"
            className={styles.linkBtn}
            onClick={handleStartOnboarding}
            disabled={onboarding}
          >
            {onboarding ? "Opening Stripe…" : "Edit Stripe account →"}
          </button>
        </>
      )}
    </section>
  );
};

export default StripeOnboardingSection;
