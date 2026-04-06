import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addArtistToProfileList } from "../../redux/actions/profileListActions";
import { resolveImageUrl } from "../../utils/imageUrl";
import { ArtistModal } from "../RapperList";
import styles from "./RankView.module.css";

const RankView = ({ artists, isLoggedIn }) => {
  const dispatch = useDispatch();
  const [selectedArtist, setSelectedArtist] = useState(null);
  const profileList = useSelector((state) => state.profileList.list);
  const inList = new Set(profileList.map((a) => a.artist_id));

  if (!artists || artists.length === 0) return null;

  return (
    <div className={styles.rankView}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headRow}>
            <th className={styles.thRank}>#</th>
            <th className={styles.thArtist}>Artist</th>
            <th className={styles.thFans}>Fans</th>
            <th className={styles.thMeta}>Genre</th>
            <th className={styles.thMeta}>Region</th>
            <th className={styles.thDelta}>Δ</th>
            {isLoggedIn && <th className={styles.thAction} />}
          </tr>
        </thead>
        <tbody>
          {artists.map((artist, index) => (
            <tr
              key={artist.artist_id}
              className={styles.row}
              onClick={() => setSelectedArtist(artist)}
            >
              <td className={styles.tdRank}>{index + 1}</td>
              <td className={styles.tdArtist}>
                <img
                  src={resolveImageUrl(artist.image_url, "https://via.placeholder.com/32?text=?")}
                  alt={artist.name || artist.artist_name}
                  className={styles.avatar}
                />
                <span className={styles.artistName}>{artist.name || artist.artist_name}</span>
              </td>
              <td className={styles.tdFans}>{(artist.count || 0).toLocaleString()}</td>
              <td className={styles.tdMeta}>{artist.genre || "—"}</td>
              <td className={styles.tdMeta}>{artist.region || "—"}</td>
              <td className={styles.tdDelta}>
                <span className={styles.deltaFlat}>—</span>
              </td>
              {isLoggedIn && (
                <td className={styles.tdAction} onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`${styles.addBtn} ${inList.has(artist.artist_id) ? styles.inList : ""}`}
                    disabled={inList.has(artist.artist_id)}
                    onClick={() => dispatch(addArtistToProfileList(artist))}
                  >
                    {inList.has(artist.artist_id) ? "✓" : "+"}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedArtist && (
        <ArtistModal
          artist={selectedArtist}
          onClose={() => setSelectedArtist(null)}
        />
      )}
    </div>
  );
};

export default RankView;
