import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import styles from "./CheckoutReturn.module.css";

// Bounce page for iOS Stripe Checkout. The iOS app uses
// ASWebAuthenticationSession with `stanbox` as the callback scheme;
// on completion Stripe redirects here (via the backend's iOS-specific
// success_url), and this component hands control back to the app by
// navigating to `stanbox://checkout/return?...`. iOS catches the scheme,
// auto-dismisses the auth session, and refreshes purchases in-app.
//
// Users who somehow land here from a plain browser (no app installed,
// wrong platform) see a fallback UI that lets them jump to the web
// library instead.
const CheckoutReturn = () => {
  const [params] = useSearchParams();
  const [bounced, setBounced] = useState(false);

  const albumId = params.get("album_id") || "";
  const status = params.get("status") || "success";

  const appUrl = `stanbox://checkout/return?album_id=${encodeURIComponent(
    albumId,
  )}&status=${encodeURIComponent(status)}`;

  useEffect(() => {
    // Fire once. window.location.replace triggers the custom URL scheme;
    // if the app is installed, ASWebAuthenticationSession catches it and
    // this page never renders more than a flash. If nothing catches, the
    // browser stays here and shows the fallback UI.
    window.location.replace(appUrl);
    const timer = setTimeout(() => setBounced(true), 1500);
    return () => clearTimeout(timer);
  }, [appUrl]);

  const isCancel = status === "canceled";

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {isCancel ? "Returning to the app…" : "Thanks for the support"}
        </h1>
        <p className={styles.body}>
          {isCancel
            ? "Bringing you back to your artist page."
            : "Your download is unlocking in the app."}
        </p>
        {bounced && (
          <div className={styles.fallback}>
            <p className={styles.fallbackHint}>
              If the app didn&rsquo;t open automatically:
            </p>
            <a href={appUrl} className={styles.appLink}>
              Return to stanbox
            </a>
            <Link to="/library" className={styles.webLink}>
              Or open the web library
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutReturn;
