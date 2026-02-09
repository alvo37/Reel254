import { Film } from "@/types/types";
import FilmCard from "./FilmCard";

interface RecentFilmsProps {
  recent_films: Film[];
  loading?: boolean;
}

export function RecentFilms({ recent_films, loading }: RecentFilmsProps) {
  const elements = recent_films.map((film, idx) => (
    <FilmCard key={idx} film={film} loading={loading} />
  ));
  return (
    <section className='limited-width recent-films'>
      <div
        className='section-top-row with-border'
        style={{ "--section-translate-y": "30px" } as React.CSSProperties}
      >
        <h4>Recent Films</h4>
        <p>See what others are watching right now</p>
      </div>
      <div className='film-grid'>{elements}</div>
    </section>
  );
}
