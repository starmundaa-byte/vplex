// src/components/WatchPage/VideoDetails.jsx
import React, { useState, useEffect } from "react";
import "../../styles/VideoDetails.css";
import { fetchChannelDetails } from "../../api/youtubeAPI";

const formatViews = (num) => {
  if (!num) return "0";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
};

const timeAgo = (dateString) => {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const seconds = diff / 1000;
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (let i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

export default function VideoDetails({ video }) {
  const [subscribed, setSubscribed] = useState(false);
  const [channelInfo, setChannelInfo] = useState(null);

  useEffect(() => {
    if (video?.channelId) {
      fetchChannelDetails(video.channelId).then((data) => {
        if (data) setChannelInfo(data);
      });
    }
  }, [video?.channelId]);

  if (!video) return null;

  const { title, channelTitle, publishedAt, views } = video;
  const channelLogo = channelInfo?.logo;
  const subscribers = channelInfo?.subscribers;

  return (
    <div className="video-details">
      <h3 className="video-title">{title}</h3>
      <p className="video-meta">
        {formatViews(views)} views • {timeAgo(publishedAt)}
      </p>

      <div className="channel-row">
        <div className="channel-info">
          <img
            src={
              channelLogo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                channelTitle
              )}`
            }
            alt={channelTitle}
            className="channel-logo"
          />
          <div className="channel-text">
            <p className="channel-name">{channelTitle}</p>
            <p className="channel-subs">
              {subscribers ? `${formatViews(subscribers)} subscribers` : ""}
            </p>
          </div>
        </div>

        <button
          className={`subscribe-btn ${subscribed ? "subscribed" : ""}`}
          onClick={() => setSubscribed((p) => !p)}
        >
          {subscribed ? "Subscribed" : "Subscribe"}
        </button>
      </div>
    </div>
  );
}
