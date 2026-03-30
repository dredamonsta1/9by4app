// src/components/Feed/VirtualFeed.tsx
// Variable-height virtual list for the main feed using react-window v2.
// Heights come from textMeasurement service — no DOM reads on render.

import React, { useCallback, useEffect, CSSProperties } from "react";
import { List, useListRef } from "react-window";
import { getTextHeight, FEED_LINE_HEIGHT } from "../../services/textMeasurement";
import type { Post } from "../../types/api";

// Base heights for non-text post types (px)
const BASE_HEIGHTS: Record<string, number> = {
  image: 370,
  video: 400,
  music: 190,
  text:  110,
};

const COMMENTS_OPEN_EXTRA = 280;
const COMMENT_ROW_HEIGHT  = 58;

// User-supplied props — react-window injects ariaAttributes/index/style at runtime
interface RowSharedProps {
  posts: Post[];
  renderItem: (post: Post, index: number) => React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Row(props: any) {
  const { ariaAttributes, index, style, posts, renderItem } = props as RowSharedProps & {
    ariaAttributes: React.AriaAttributes;
    index: number;
    style: CSSProperties;
  };
  const post = posts[index];
  if (!post) return null;
  return (
    <div style={style} {...ariaAttributes}>
      {renderItem(post, index)}
    </div>
  );
}

interface VirtualFeedProps {
  posts: Post[];
  openCommentIds: Set<string | number>;
  commentCounts: Record<string | number, number>;
  containerWidth: number;
  height: number;
  renderItem: (post: Post, index: number) => React.ReactNode;
}

export default function VirtualFeed({
  posts,
  openCommentIds,
  commentCounts,
  containerWidth,
  height,
  renderItem,
}: VirtualFeedProps) {
  const listRef = useListRef(null);

  const getRowHeight = useCallback(
    (index: number): number => {
      const post = posts[index];
      if (!post) return BASE_HEIGHTS.text;

      let base: number;

      if (post.post_type === "text" && post.content) {
        const measured = getTextHeight(
          `text-${post.id}`,
          containerWidth - 32,
          FEED_LINE_HEIGHT
        );
        base = measured ? measured.height + 116 : BASE_HEIGHTS.text;
      } else {
        base = BASE_HEIGHTS[post.post_type] ?? BASE_HEIGHTS.text;
      }

      const key = post.id;
      if (openCommentIds.has(key)) {
        const count = commentCounts[key] ?? 0;
        base += COMMENTS_OPEN_EXTRA + count * COMMENT_ROW_HEIGHT;
      }

      return base;
    },
    [posts, containerWidth, openCommentIds, commentCounts]
  );

  // When open comments or container width change, heights need to recalculate.
  // react-window v2 recalculates automatically when rowHeight reference changes,
  // but we force a re-render by depending on key values in getRowHeight above.
  useEffect(() => {
    // No-op: rowHeight callback reference changes trigger recalculation in v2
  }, [openCommentIds, containerWidth]);

  const rowProps: RowSharedProps = { posts, renderItem };

  return (
    <List
      listRef={listRef}
      rowCount={posts.length}
      rowHeight={getRowHeight}
      rowComponent={Row}
      rowProps={rowProps}
      defaultHeight={height}
      overscanCount={4}
      style={{ width: "100%" }}
    />
  );
}
