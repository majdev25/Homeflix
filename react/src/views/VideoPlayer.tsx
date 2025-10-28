// VideoPlayer.tsx
import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { saveProgress, getProgress } from "@/api/movies";

function VideoPlayer() {
  const { title } = useParams<{ title: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // --- Load last saved progress ---
    getProgress(title).then((position) => {
      video.currentTime = position;
      console.log(position);
    });

    // Save progress every 10 seconds
    const interval = setInterval(() => {
      saveProgress(title, video.currentTime);
    }, 30000);

    // Save progress on pause
    const handlePause = () => saveProgress(title, video.currentTime);
    video.addEventListener("pause", handlePause);

    // Save progress on page unload
    const handleUnload = () => saveProgress(title, video.currentTime);
    window.addEventListener("beforeunload", handleUnload);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      video.removeEventListener("pause", handlePause);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [title]);

  return (
    <div className="w-100 h-full flex items-center justify-center">
      <video ref={videoRef} controls className="w-100 flex-1">
        <source
          src={
            process.env.REACT_APP_SERVER_URL +
            "/api/stream/getMovieChunk/" +
            title
          }
          type="video/mp4"
        />
        <track
          src={
            process.env.REACT_APP_SERVER_URL +
            "/api/stream/getSubtitle/" +
            title
          }
          kind="subtitles"
          srcLang="en"
          label="English"
          default
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default VideoPlayer;
