import React from "react";
import Homepage from "@/views/Homepage";
import { Routes, Route } from "react-router-dom";
import VideoPlayer from "@/views/VideoPlayer";

function App() {
  return (
    <main className="h-screen">
      <section className="relative text-white py-8 px-8 w-fulls">
        <h1 className="text-2xl text-nRed font-bold">HomeFlix</h1>
      </section>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/watch/:title" element={<VideoPlayer />} />
      </Routes>
    </main>
  );
}

export default App;
