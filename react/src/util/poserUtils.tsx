// utils/format.ts
import { Movie } from "@/api/movies";

export function formatRuntime(seconds?: number): string | null {
  if (!seconds) return null;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}min` : `${minutes}min`;
}

export function getPosterUrl(movie: Movie): string {
  if (movie.posterPath) {
    return `${process.env.REACT_APP_SERVER_URL}/static/movies/${movie.posterPath}`;
  } else if (movie.imdbData?.primaryImage?.url) {
    return movie.imdbData.primaryImage.url;
  }
  return "";
}

export function getBackgorundOverlayGradient(movie: Movie): string {
  if (movie.posterPath) {
    return `linear-gradient(to top, ${movie.color.hex} 0%, ${movie.color.hex}99 50%, transparent 100%)`;
  } else if (movie.imdbData?.primaryImage?.url) {
    console.log();
    return `linear-gradient(to top, #000000 0%, #00000099 50%, transparent 100%)`;
  }
  return `linear-gradient(to top, #000000 0%, #000000 100%, transparent 100%)`;
}
