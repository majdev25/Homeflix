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
    <div className="w-full">
      {movies.length > 0 && (
        <img
          src={`${process.env.REACT_APP_SERVER_URL}/movies/${movies[0].posterPath}`}
          alt={movies[0].title}
          className="absolute w-full h-full object-cover z-0 blur-3xl"
        />
      )}
      {movies.length > 0 && (
        <section className="relative py-8 px-8 w-full h-full flex justify-center">
          <Link
            to={"/watch/" + encodeURIComponent(movies[0].title)}
            className="relative w-full h-[40vh] group shadow-2xl overflow-hidden"
          >
            {/* Featured image with stronger glow */}
            <img
              src={`${process.env.REACT_APP_SERVER_URL}/movies/${movies[0].posterPath}`}
              alt={movies[0].title}
              className="rounded-3xl w-full h-full object-cover"
            />

            {/* Dark gradient overlay for text */}
            <div
              className="absolute inset-0 z-2 rounded-3xl pointer-events-none"
              style={{
                background: `linear-gradient(to top, ${movies[0].color.hex} 0%, ${movies[0].color.hex}99 30%, transparent 100%)`,
              }}
            ></div>
            {/* Overlay text */}
            <div className="absolute bottom-10 left-10 text-white z-10">
              <h2 className="text-4xl font-bold">{movies[0].title}</h2>
            </div>
          </Link>
        </section>
      )}

      <section className="flex md:flex-wrap md:flex-row flex-col gap-8 py-8 px-8 w-full justify-start">
        {movies.slice(1).map((movie) => {
          const [r, g, b] = movie.color.value; // ignore alpha
          const shadowAlpha = movie.color.isDark ? 0.7 : 0.2; // preset opacity

          return (
            <Link
              to={"/watch/" + encodeURIComponent(movie.title)}
              key={movie.title}
              className="md:w-[220px] h-[300px] w-100 relative rounded-xl overflow-hidden group shadow-2xl"
            >
              <img
                src={`${process.env.REACT_APP_SERVER_URL}/movies/${movie.posterPath}`}
                alt={movie.title}
                className="w-full h-full object-cover z-1"
              />
              <div
                className="absolute inset-0 z-2 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, ${movie.color.hex} 0%, ${movie.color.hex}99 30%, transparent 100%)`,
                }}
              ></div>
              <div className="absolute bottom-0 left-0 text-white z-10 text-4xl md:text-2xl font-bold text-center w-full p-3">
                {movie.title}
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

export default Homepage;
