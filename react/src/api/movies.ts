export interface Movie {
  title: string;
  posterPath: string;
  color: any;
  imdbData: any;
  progress: number;
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

interface SaveProgressResponse {
  success: boolean;
}

export async function saveProgress(
  title: string | undefined,
  position: number
): Promise<SaveProgressResponse | null> {
  if (!title) {
    return null;
  }
  try {
    const res = await fetch(
      process.env.REACT_APP_SERVER_URL + "/api/movies/save-progress",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, position }),
      }
    );

    if (!res.ok) throw new Error("Network response was not ok");

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to save progress:", err);
    return null;
  }
}

interface GetProgressResponse {
  position: number;
}

export async function getProgress(title: string | undefined): Promise<number> {
  if (!title) return 0;

  try {
    const res = await fetch(
      process.env.REACT_APP_SERVER_URL +
        `/api/movies/get-progress/${encodeURIComponent(title)}`
    );

    if (!res.ok) throw new Error("Network response was not ok");

    const data: GetProgressResponse = await res.json();
    console.log(data);
    return data.position || 0;
  } catch (err) {
    console.error("Failed to fetch progress:", err);
    return 0;
  }
}
