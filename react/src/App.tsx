import React from "react";
import Homepage from "@/views/Homepage";

const movies = [
  { id: 1, title: "Interstellar", year: 2014 },
  { id: 2, title: "Inception", year: 2010 },
  { id: 3, title: "The Dark Knight", year: 2008 },
  { id: 4, title: "Tenet", year: 2020 },
  { id: 5, title: "Dunkirk", year: 2017 },
];

function App() {
  return (
    <main>
      <section className="relative text-white py-8 px-8 w-full">
        <h1 className="text-2xl text-nRed font-bold">HomeFlix</h1>
      </section>
      <Homepage />
    </main>
  );
}

export default App;
