import { Movie } from "@/api/movies";
import { Link } from "react-router-dom";
import { formatRuntime } from "@/util/format";
import Rating from "./Rating";

function MoviePoster(movie: Movie) {
  return (
    <Link
      to={"/watch/" + encodeURIComponent(movie.title)}
      key={movie.title}
      className="md:w-[390px] h-[230px] w-full relative rounded-2xl overflow-hidden group border border-white/10"
    >
      <img
        src={`${process.env.REACT_APP_SERVER_URL}/static/movies/${movie.posterPath}`}
        alt={movie.title}
        className="w-full h-full object-cover z-1 transform transition-transform duration-500 group-hover:scale-110"
      />
      <div
        className="absolute inset-0 z-2 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${movie.color.hex} 0%, ${movie.color.hex}99 50%, transparent 100%)`,
        }}
      ></div>
      <div className="absolute bottom-0 left-0 text-white z-10 text-start w-full p-4">
        <div className="text-4xl md:text-2xl font-semibold">{movie.title}</div>
        {movie.imdbData && (
          <div className="flex gap-x-2 items-center text-sm flex-wrap">
            <Rating rating={movie.imdbData?.rating?.aggregateRating}></Rating> |{" "}
            {movie.imdbData?.genres[0]} |{" "}
            <span className="font-semibold">{movie.imdbData?.startYear}</span> |{" "}
            {formatRuntime(movie.imdbData?.runtimeSeconds)}
          </div>
        )}
        {movie.progress > 0 && (
          <div className="w-full mt-2 bg-gray-300 h-1">
            <div
              className="bg-nRed h-1 rounded-full"
              style={{ width: `${movie.progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </Link>
  );
}

export default MoviePoster;
