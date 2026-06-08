import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import {
  addArtistToProfileList,
  MAX_FAVORITE_ARTISTS,
} from "../../redux/actions/profileListActions";
import styles from "./AlbumBuyButton.module.css";

const centsToDollars = (cents) =>
  cents == null ? "" : (cents / 100).toFixed(2);

// Per-album buy CTA in the ArtistModal. Reads purchases + profileList from
// Redux to detect ownership and Top-20 membership. The "follow-gate" was
// pivoted to a Top-20 gate after thin-slice validation (see backend PR for
// rationale): buying an artist's music means committing them to your stanbox.
//
// onListFull is invoked when the buyer wants to add the artist but all 20
// slots are full — the parent ArtistModal then opens the existing
// PositionSelector so the buyer can manage the list.
const AlbumBuyButton = ({ album, artist, onListFull }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const purchases = useSelector((state) => state.auth.purchases);
  const profileList = useSelector((state) => state.profileList.list);
  const [adding, setAdding] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  if (!album?.price_cents || !album?.download_enabled) {
    return null;
  }

  const owned = (purchases ?? []).some((p) => p.album_id === album.album_id);
  const inTop20 = (profileList ?? []).some(
    (a) => a.artist_id === artist?.artist_id
  );
  const listFull = (profileList ?? []).length >= MAX_FAVORITE_ARTISTS;
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

  // Not in Top 20 → add-to-Top-20 CTA (auto-appends, or opens
  // PositionSelector via onListFull if the list is at the cap).
  if (!inTop20) {
    const handleAddOrManage = async () => {
      if (listFull) {
        onListFull?.();
        return;
      }
      setAdding(true);
      try {
        await dispatch(addArtistToProfileList(artist));
        // profileList Redux state updates optimistically inside the action;
        // re-render flips this component into the "Buy" state.
      } catch (err) {
        toast.error("Failed to add to your Top 20.");
      } finally {
        setAdding(false);
      }
    };

    const label = listFull
      ? `Top 20 full — manage to unlock ${price}`
      : `Add to your Top 20 to unlock ${price}`;

    return (
      <button
        type="button"
        className={`${styles.btn} ${styles.follow}`}
        onClick={handleAddOrManage}
        disabled={adding}
      >
        {adding ? "Adding…" : label}
      </button>
    );
  }

  // In Top 20 — show the actual Buy button.
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
      if (reason === "top20_required") {
        // Race: somehow the artist left the Top 20 between Redux state and
        // the backend check. Surface gracefully — the component will
        // re-render once profileList catches up on the next fetch.
        toast.info(msg);
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
