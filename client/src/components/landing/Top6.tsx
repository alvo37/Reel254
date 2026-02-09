import { Film } from "@/types/types";
import FilmCard from "./FilmCard";

export default function Top6({
  Top6,
  loading,
}: {
  Top6: Film[];
  loading?: boolean;
}) {
  const elements = Top6.map((film, idx) => (
    <FilmCard key={idx} film={film} hasOverlay loading={loading} />
  ));

  return (
    <section className='limited-width top-films'>
      <div className='film-grid'>{elements}</div>
    </section>
  );
}
