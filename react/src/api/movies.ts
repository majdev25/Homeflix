export interface Movie {
  id: number;
  title: string;
}

export async function getMovies(): Promise<Movie[]> {
  try {
    const res = await fetch("http://localhost:3001/all-movies");
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    console.log(data);
    return data;
  } catch (err) {
    console.error("Failed to fetch movies:", err);
    return [];
  }
}
