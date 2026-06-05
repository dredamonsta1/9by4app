import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./AlbumBuyButton.module.css";

const centsToDollars = (cents) =>
  cents == null ? "" : (cents / 100).toFixed(2);

// Per-album buy CTA in the ArtistModal. Reads purchases from the auth slice
// to detect ownership; receives isFollowing + onFollowed from the parent
// ArtistModal so a single follow-status fetch covers all of the artist's
// albums in one modal session.
const AlbumBuyButton = ({ album, artistId, artistName, isFollowing, onFollowed }) => {
  const { user } = useSelector((state) => state.auth);
  const purchases = useSelector((state) => state.auth.purchases);
  const [following, setFollowing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Caller already gates rendering on album.download_enabled and
  // artist.commerce_enabled, but defend here too — defensive renders
  // beat a broken CTA.
  if (!album?.price_cents || !album?.download_enabled) {
    return null;
  }

  const owned = (purchases ?? []).some((p) => p.album_id === album.album_id);
  const price = `$${centsToDollars(album.price_cents)}`;

  // Sign-in path.
  if (!user) {
    return (
      <Link to="/login" className={styles.btn}>
        Sign in to buy {price}
      </Link>
    );
  }

  // Already owned.
  if (owned) {
    return (
      <Link to="/library" className={`${styles.btn} ${styles.owned}`}>
        Download
      </Link>
    );
  }

  // Follow-gate: not following yet.
  if (!isFollowing) {
    const handleFollow = async () => {
      setFollowing(true);
      try {
        await axiosInstance.post(`/artists/${artistId}/follow`);
        onFollowed?.();
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to follow."
        );
      } finally {
        setFollowing(false);
      }
    };
    return (
      <button
        type="button"
        className={`${styles.btn} ${styles.follow}`}
        onClick={handleFollow}
        disabled={following}
      >
        {following ? "Following…" : `Follow to unlock ${price}`}
      </button>
    );
  }

  // Following — show the actual Buy button.
  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await axiosInstance.post(`/albums/${album.album_id}/checkout`);
      const url = res.data?.checkout_url;
      if (!url) throw new Error("No checkout URL returned.");
      window.location.href = url;
    } catch (err) {
      const reason = err.response?.data?.reason;
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to start checkout.";
      if (reason === "follow_required") {
        // Race: somehow we lost the follow between fetch and click. Refetch.
        toast.info("Follow this artist first.");
        onFollowed?.(false);
      } else {
        toast.error(msg);
      }
      setCheckingOut(false);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.btn} ${styles.buy}`}
      onClick={handleCheckout}
      disabled={checkingOut}
    >
      {checkingOut ? "Opening Stripe…" : `Buy ${price}`}
    </button>
  );
};

export default AlbumBuyButton;
