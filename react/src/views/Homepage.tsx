import React, { useEffect, useState } from "react";
import MoviePoster from "@/assets/movie_poster.jpeg";
import { getMovies, Movie } from "@/api/movies";

function Homepage() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    getMovies().then(setMovies);
  }, []);

  return (
    <main>
      <section className="relative py-8 px-8 w-full flex justify-center">
        <div className="relative w-full h-[40vh] group">
          {/* Featured image with stronger glow */}
          <img
            src={MoviePoster}
            alt="Featured Movie"
            className="rounded-3xl w-full h-full object-cover shadow-[0_0_40px_20px_rgba(229,9,20,0.2)]"
          />

          {/* Full dark overlay */}
          <div className="absolute inset-0 rounded-3xl bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>

          {/* Dark gradient overlay for text */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black via-transparent to-transparent"></div>

          {/* Overlay text */}
          <div className="absolute bottom-10 left-10 text-white z-10">
            <h2 className="text-4xl font-bold">Oppenhaimer</h2>
            <p className="mt-2 text-md text-gray-200 max-w-md font-thin">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              euismod, nisl eget consectetur.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Homepage;
