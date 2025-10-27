import React, { useEffect, useState } from "react";
import { getMovies, Movie } from "@/api/movies";
import MoviePoster from "@/components/MoviePoster";
import HeroPoster from "@/components/HeroPoster";

function Homepage() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    getMovies().then(setMovies);
  }, []);

  return (
    <div className="w-full">
      <HeroPoster movies={movies}></HeroPoster>

      <div className="relative pt-8 pb-0 px-8 text-3xl z-10 font-semibold">
        <h2>All movies</h2>
      </div>

      <section className="flex md:flex-wrap md:flex-row flex-col gap-8 py-8 px-8 w-full justify-start">
        {movies.map((movie) => (
          <MoviePoster key={movie.title} {...movie} />
        ))}
      </section>
    </div>
  );
}

export default Homepage;
