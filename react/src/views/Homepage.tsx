import React, { useEffect, useState } from "react";
import MoviePoster from "@/assets/movie_poster.jpeg";
import { getMovies, Movie } from "@/api/movies";
import { Link } from "react-router-dom";

function Homepage() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    getMovies().then(setMovies);
  }, []);

  return (
    <main>
      {movies.length > 0 && (
        <section className="relative py-8 px-8 w-full flex justify-center">
          <Link
            to={"/watch/" + encodeURIComponent(movies[0].title)}
            className="relative w-full h-[40vh] group"
          >
            {/* Featured image with stronger glow */}
            <img
              src={`${process.env.REACT_APP_SERVER_URL}/movies/${movies[0].posterPath}`}
              alt={movies[0].title}
              className="rounded-3xl w-full h-full object-cover"
              style={{
                boxShadow: movies[0].color
                  ? `0 0 40px 20px ${movies[0].color.hex || "rgba(0,0,0,0.2)"}`
                  : "0 0 40px 20px rgba(0,0,0,0.2)",
              }}
            />

            {/* Full dark overlay */}
            <div className="absolute inset-0 rounded-3xl bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>

            {/* Dark gradient overlay for text */}
            {!movies[0].color.isDark && (
              <div className="absolute inset-0 z-2 rounded-3xl pointer-events-none bg-gradient-to-t from-black via-black/60 to-transparent"></div>
            )}
            {/* Overlay text */}
            <div className="absolute bottom-10 left-10 text-white z-10">
              <h2 className="text-4xl font-bold">{movies[0].title}</h2>
            </div>
          </Link>
        </section>
      )}

      <section className="flex flex-wrap gap-8 py-8 px-8 w-full justify-start">
        {movies.slice(1).map((movie) => {
          const [r, g, b] = movie.color.value; // ignore alpha
          const shadowAlpha = movie.color.isDark ? 0.7 : 0.2; // preset opacity

          return (
            <Link
              to={"/watch/" + encodeURIComponent(movie.title)}
              key={movie.title}
              className="w-[220px] h-[300px] relative rounded-xl overflow-hidden group"
              style={{
                boxShadow: `0 0 20px 20px rgba(${r},${g},${b},${shadowAlpha})`,
              }}
            >
              <img
                src={`${process.env.REACT_APP_SERVER_URL}/movies/${movie.posterPath}`}
                alt={movie.title}
                className="w-full h-full object-cover z-1"
              />
              {!movie.color.isDark && (
                <div className="absolute inset-0 z-2 pointer-events-none bg-gradient-to-t from-black via-black/60 to-transparent"></div>
              )}
              <div className="absolute bottom-3 left-3 text-white z-10 text-md font-semibold">
                {movie.title}
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}

export default Homepage;
