import React, { useEffect, useRef, useState } from "react";
import { Movie } from "@/api/movies";
import { Link } from "react-router-dom";
import { formatRuntime } from "@/util/format";

interface HeroPosterProps {
  movies: Movie[];
  intervalMs?: number;
  transitionMs?: number;
}

function HeroPoster({
  movies,
  intervalMs = 10000,
  transitionMs = 700,
}: HeroPosterProps) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  // ref to clear the prevIndex timeout
  const clearPrevTimeoutRef = useRef<number | null>(null);

  // helper to clear timeout
  function clearPrevClearTimeout() {
    if (clearPrevTimeoutRef.current) {
      window.clearTimeout(clearPrevTimeoutRef.current);
      clearPrevTimeoutRef.current = null;
    }
  }

  // Auto-cycle using functional updater so we don't capture a stale index
  useEffect(() => {
    if (!movies || movies.length <= 1) return;

    const tick = () => {
      // Use functional update to access latest index
      setIndex((cur) => {
        const next = (cur + 1) % movies.length;
        setDirection("next");
        setPrevIndex(cur);

        // schedule clearing prevIndex after animation finishes
        clearPrevClearTimeout();
        clearPrevTimeoutRef.current = window.setTimeout(() => {
          setPrevIndex(null);
        }, transitionMs + 50);

        return next;
      });
    };

    const timer = window.setInterval(tick, intervalMs);
    return () => {
      window.clearInterval(timer);
      clearPrevClearTimeout();
    };
  }, [movies, intervalMs, transitionMs]);

  // Manual dot click
  function handleDotClick(i: number) {
    if (!movies || i === index) return;
    const dir = i > index ? "next" : "prev";
    setDirection(dir);
    setPrevIndex(index);
    setIndex(i);

    // clear any previous scheduled clear and schedule one now
    clearPrevClearTimeout();
    clearPrevTimeoutRef.current = window.setTimeout(() => {
      setPrevIndex(null);
    }, transitionMs + 50);
  }

  const movie = movies?.[index];
  const prevMovie = prevIndex !== null ? movies?.[prevIndex] : null;

  if (!movies || movies.length === 0 || !movie || !movie.color) return null;

  return (
    <div>
      {/* Blurred background */}
      <img
        src={`${process.env.REACT_APP_SERVER_URL}/static/movies/${movie.posterPath}`}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover z-0 blur-3xl transition-opacity duration-700"
      />

      <section className="relative pt-8 px-8 w-full h-full flex justify-center z-10 overflow-hidden">
        <Link
          to={`/watch/${encodeURIComponent(movie.title)}`}
          className="relative w-full h-[40vh] group overflow-hidden border border-white/10 rounded-3xl"
        >
          {/* Previous image (slides out) */}
          {prevMovie && (
            <img
              key={prevMovie.title + "-prev"}
              src={`${process.env.REACT_APP_SERVER_URL}/static/movies/${prevMovie.posterPath}`}
              alt={prevMovie.title}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[${transitionMs}ms] ease-in-out ${
                direction === "next"
                  ? "-translate-x-full animate-slideOutLeft"
                  : "translate-x-full animate-slideOutRight"
              }`}
            />
          )}

          {/* Current image (slides in) */}
          <img
            key={movie.title + "-current"}
            src={`${process.env.REACT_APP_SERVER_URL}/static/movies/${movie.posterPath}`}
            alt={movie.title}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[${transitionMs}ms] ease-in-out ${
              prevIndex === null
                ? "translate-x-0" // first render or after prev cleared
                : direction === "next"
                ? "translate-x-0 animate-slideInFromRight"
                : "translate-x-0 animate-slideInFromLeft"
            }`}
          />

          {/* Gradient overlay (static) */}
          <div
            className="absolute inset-0 z-2 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${movie.color.hex} 0%, ${movie.color.hex}99 50%, transparent 100%)`,
            }}
          />

          {/* Static overlay text */}
          <div className="absolute bottom-10 left-10 text-white z-10 transition-opacity duration-700">
            <h2 className="text-4xl font-bold mb-1">{movie.title}</h2>
            {movie.imdbData && (
              <div className="text-sm mb-2">
                <span className="font-semibold">
                  {movie.imdbData?.startYear}
                </span>{" "}
                {" • " +
                  movie.imdbData?.genres[0] +
                  " • " +
                  formatRuntime(movie.imdbData?.runtimeSeconds)}
              </div>
            )}
            <div className="text-sm max-w-[400px] mb-4">
              {movie.imdbData?.plot}
            </div>
            <div className="px-5 py-4 bg-nRed hover:bg-nRed-dark transition w-fit rounded-2xl text-sm">
              Watch
            </div>
          </div>
        </Link>
      </section>

      {/* Dots */}
      <div className="relative flex gap-2 z-20 justify-center mt-4">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === index ? "bg-white" : "bg-white/30"
            }`}
            aria-label={`slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroPoster;
