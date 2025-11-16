import React, { useState } from "react";
import "../../styles/CommentSection.css";

export default function Comment() {
  const [comment, setComment] = useState("");
  const [focused, setFocused] = useState(false);

  const handlePost = () => {
    if (comment.trim()) {
      alert(`Your comment: "${comment}"`);
      setComment("");
      setFocused(false);
    }
  };

  return (
    <div className="comment-input-container no-avatar">
      <div className={`comment-input-box ${focused ? "active" : ""}`}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => !comment && setFocused(false)}
        />
        <button
          className={`post-btn ${comment.trim() ? "enabled" : ""}`}
          onClick={handlePost}
          disabled={!comment.trim()}
        >
          Post
        </button>
      </div>
    </div>
  );
}
