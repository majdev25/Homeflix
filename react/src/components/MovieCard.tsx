type MovieCardProps = {
  title: string;
  year: number;
};

export default function MovieCard({ title, year }: MovieCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#1f1f1f",
        color: "white",
        padding: "16px",
        borderRadius: "12px",
        margin: "8px",
      }}
    >
      <h2>{title}</h2>
      <p>{year}</p>
    </div>
  );
}
