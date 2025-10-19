// VideoPlayer.tsx
import React from "react";
import { useParams } from "react-router-dom";

function VideoPlayer() {
  const { title } = useParams<{ title: string }>();
  return (
    <div className="w-100 h-full flex items-center justify-center">
      <video controls className="w-100 flex-1">
        <source
          src={process.env.REACT_APP_SERVER_URL + "/movie/" + title}
          type="video/mp4"
        />
        <track
          src="/subtitles"
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
