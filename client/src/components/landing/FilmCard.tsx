import { FavouriteSvg, ThumbsUpDownSvg } from "@/assets/icons";
import { Film } from "@/types/types";
import Link from "next/link";

interface FilmCardProps {
  film: Film;
  hasOverlay?: boolean;
  loading?: boolean;
}

export default function FilmCard({ film, hasOverlay, loading }: FilmCardProps) {
  return (
    <Link href={`/films/${film.id}`} className="film-card">
      {!loading && (
        <>
          {hasOverlay && (
            <div className="overlay">
              <span className="film-score overlay-content">
                <FavouriteSvg />
                {Math.round(film.vote_average ?? 0)} / 10
              </span>
              <span className="film-count overlay-content">
                <ThumbsUpDownSvg />
                {film.vote_count}
              </span>
            </div>
          )}
          <span className="film-title">{film.title}</span>
          <img
            src={film.poster_url ?? "/images/loading.jpg"}
            alt={film.title}
          />
        </>
      )}
    </Link>
  );
}
