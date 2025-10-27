export interface Movie {
  title: string;
  posterPath: string;
  color: any;
  imdbData: any;
}

export async function getMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(
      process.env.REACT_APP_SERVER_URL + "/api/movies/all-movies"
    );
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    console.log(data);
    return data;
  } catch (err) {
    console.error("Failed to fetch movies:", err);
    return [];
  }
}
