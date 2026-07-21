'use client';

import './page.css';
import Footer from '@/components/reusables/Footer/Footer';
import Navbar from '@/components/reusables/Navbar/Navbar';
import { backendService } from '@/services/backendService';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Show = {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  poster_path: string;
  trailerKey?: string;
};

export default function TVShows() {
  // State for popular TV shows
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [genres] = useState([
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' },
  ]);
  const [selectedGenreId, setSelectedGenreId] = useState<number | ''>('');
  const [genreShows, setGenreShows] = useState<Show[]>([]);

  // Load popular TV shows on mount
  useEffect(() => {
    const loadShows = async () => {
      try {
        const rawShows = await backendService.getPopularTVShows();
        const showsWithTrailers = await Promise.all(
          rawShows.map(async (show: any) => {
            const trailerKey = await backendService.getTVTrailer(show.id);
            return { ...show, trailerKey };
          }),
        );
        setShows(showsWithTrailers);
      } catch (err) {
        console.error('Failed to load TV shows:', err);
        setError('Failed to load TV shows. Please check your TMDB API key.');
      } finally {
        setLoading(false);
      }
    };
    loadShows();
  }, []);

  // Load shows by selected genre
  useEffect(() => {
    if (!selectedGenreId) {
      setGenreShows([]);
      return;
    }
    const fetchByGenre = async () => {
      try {
        const showsByGenre = await backendService.getAllMoviesOrShows('tv', 1);
        const filtered = showsByGenre.filter((s: any) =>
          s.genre_ids?.includes(Number(selectedGenreId)),
        );
        const showsWithTrailers = await Promise.all(
          filtered.map(async (show: any) => {
            const trailerKey = await backendService.getTVTrailer(show.id);
            return { ...show, trailerKey };
          }),
        );
        setGenreShows(showsWithTrailers);
      } catch (error) {
        console.error('Error fetching TV shows by genre:', error);
      }
    };
    fetchByGenre();
  }, [selectedGenreId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-64 text-white">Loading TV shows…</div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-64 text-red-500">{error}</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="genre-selector my-6 p-4 rounded max-w-4xl mx-auto bg-black text-white">
        <h2 className="text-2xl font-semibold mb-3">Pick a TV Genre</h2>
        <label htmlFor="genre-select" className="block mb-1 font-semibold text-white text-sm">
          Pick a Genre
        </label>
        <select
          id="genre-select"
          className="border p-2 rounded w-full max-w-xs bg-black text-white text-sm"
          value={selectedGenreId}
          onChange={(e) => setSelectedGenreId(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">-- Select Genre --</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        {genreShows.length > 0 && (
          <div className="genre-shows mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {genreShows.map((show) => (
              <Link href={`/tvshows/${show.id}`} key={show.id}>
                <div className="show-card cursor-pointer">
                  {show.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
                      alt={show.name}
                      className="poster rounded"
                    />
                  ) : (
                    <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center rounded">
                      <span className="text-gray-600">No Image</span>
                    </div>
                  )}
                  <h3>{show.name}</h3>
                  <p className="overview">{show.overview}</p>
                  <p className="rating">⭐ {show.vote_average.toFixed(1)}</p>
                  {show.trailerKey && (
                    <iframe
                      width="100%"
                      height="200"
                      src={`https://www.youtube.com/embed/${show.trailerKey}`}
                      title={`${show.name} Trailer`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="trailer"
                    ></iframe>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="show-grid max-w-6xl mx-auto px-4">
        {shows.map((show) => (
          <Link href={`/tvshows/${show.id}`} key={show.id}>
            <div className="show-card">
              <img
                src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
                alt={show.name}
                className="poster"
              />
              <h3>{show.name}</h3>
              <p className="overview">{show.overview}</p>
              <p className="rating">⭐ {show.vote_average.toFixed(1)}</p>
              {show.trailerKey && (
                <iframe
                  width="100%"
                  height="200"
                  src={`https://www.youtube.com/embed/${show.trailerKey}`}
                  title={`${show.name} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="trailer"
                ></iframe>
              )}
            </div>
          </Link>
        ))}
      </div>

      <Footer />
    </>
  );
}
