'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/reusables/Navbar/Navbar';
import Footer from '@/components/reusables/Footer/Footer';
import { backendService } from '@/services/backendService';
import { supabase } from '@/lib/supabaseClient';
import CommentsSection from '@/components/CommentsSection';

type MovieDetails = {
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  poster_path: string;
  trailerKey?: string;
};

type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string;
};

type Comment = {
  name: string;
  text: string;
};

export default function MoviePage() {
  const params = useParams();
  const { user, isLoaded } = useUser();
  const id = Array.isArray(params.movieid) ? params.movieid[0] : params.movieid || '';

  const numericId = parseInt(id || '0'); // Convert ID to number
  if (!numericId) return <p>Invalid movie ID.</p>; // Guard clause for invalid ID

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  const userId = user?.id;

  useEffect(() => {
    if (!numericId) return;

    const fetchDetails = async () => {
      try {
        // Fetch movie details and trailer
        const details = await backendService.getMovieDetails(numericId.toString());
        const trailerKey = await backendService.getMovieTrailer(numericId);
        const castList = await backendService.getMovieCast(numericId);

        setMovie({ ...details, trailerKey });
        setCast(castList);

        await fetchUserRating();
        await fetchAverageRating();
      } catch (err) {
        console.error('Error loading movie page:', err);
      }
    };

    const fetchUserRating = async () => {
      const { data } = await supabase
        .from('ratings')
        .select('rating')
        .eq('user_id', userId)
        .eq('movie_id', numericId)
        .single();

      if (data) setUserRating(data.rating);
    };

    const fetchAverageRating = async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('movie_id', numericId);

      if (error) {
        console.error('Failed to fetch average rating:', error);
        return;
      }

      if (data.length === 0) {
        setAverageRating(null);
      } else {
        const total = data.reduce((sum, r) => sum + r.rating, 0);
        const avg = total / data.length;
        setAverageRating(parseFloat(avg.toFixed(1)));
      }
    };

    fetchDetails();
  }, [numericId]);

  useEffect(() => {
    const loadData = async () => {
      const allMovies = await backendService.getAllMoviesOrShows('movie', 1);
      console.log('All movies:', allMovies);

      const allSeries = await backendService.getAllMoviesOrShows('tv', 1);
      console.log('All TV shows:', allSeries);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (movie?.title) {
      document.title = `${movie.title} | Movie Details`;
    }
  }, [movie]);

  const handleAddToWatchlist = async () => {
    if (!isLoaded) return;

    if (!userId) {
      alert('Please sign in to add movies to your watchlist.');
      return;
    }

    try {
      const result = await backendService.addToWatchlist(userId, numericId, numericId);

      if (result.source === 'supabase') {
        alert('Added to watchlist.');
      } else {
        alert('Could not save to watchlist right now.');
      }
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
      alert('Could not save to watchlist right now.');
    }
  };

  const handleRateMovie = async (rating: number) => {
    if (!userId) {
      alert('Please sign in to rate movies.');
      return;
    }

    try {
      const { error } = await supabase
        .from('ratings')
        .upsert({ user_id: userId, movie_id: numericId, rating });

      if (error) throw error;
      setUserRating(rating);
      await fetchAverageRating();
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('Could not save your rating right now.');
    }
  };

  const fetchAverageRating = async () => {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('movie_id', numericId);

    if (error) {
      console.error('Failed to fetch average rating:', error);
      return;
    }

    if (data.length === 0) {
      setAverageRating(null);
    } else {
      const total = data.reduce((sum, r) => sum + r.rating, 0);
      const avg = total / data.length;
      setAverageRating(parseFloat(avg.toFixed(1)));
    }
  };

  if (!movie) return <p>Loading movie details...</p>;

  return (
    <div className="movie-detail-page">
      <Navbar />

      <div className="movie-detail-content p-4 max-w-4xl mx-auto">
        {movie.poster_path ? (
          <div className="relative w-full max-w-md mx-auto shadow-2xl rounded-xl overflow-hidden mb-6">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent mix-blend-multiply pointer-events-none"></div>
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none"></div>
          </div>
        ) : (
          <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center rounded">
            <span className="text-gray-600">No poster available</span>
          </div>
        )}

        <div className="details mt-4">
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          <p>
            <strong>Release Date:</strong> {movie.release_date}
          </p>
          <p>
            <strong>TMDB Rating:</strong> ⭐ {movie.vote_average.toFixed(1)}
          </p>
          {averageRating !== null && (
            <p className="text-sm text-gray-500">
              <strong>Average User Rating:</strong> ⭐ {averageRating}/10
            </p>
          )}
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-1">Your Rating</h2>
            <div className="flex gap-1 flex-wrap">
              {[...Array(10)].map((_, i) => {
                const value = i + 1;
                return (
                  <button
                    key={value}
                    onClick={() => handleRateMovie(value)}
                    className={`text-sm px-3 py-1 rounded ${userRating === value ? 'bg-yellow-400 text-black' : 'bg-gray-300'
                      }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="overview mt-4">{movie.overview}</p>

          <button
            onClick={handleAddToWatchlist}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700"
            type="button"
          >
            ➕ Add to Watchlist
          </button>

          {movie.trailerKey ? (
            <iframe
              width="100%"
              height="300"
              src={`https://www.youtube.com/embed/${movie.trailerKey}`}
              title={`${movie.title} Trailer`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="mt-6"
            ></iframe>
          ) : (
            <p className="mt-4 text-gray-500 italic">No trailer available</p>
          )}

          <h2 className="text-2xl font-semibold mt-8">Cast</h2>
          <div className="cast-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            {cast.map((actor) => (
              <div key={actor.id} className="actor-card text-center">
                {actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                    alt={actor.name}
                    className="rounded"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-300 flex items-center justify-center rounded">
                    <span className="text-gray-600">No image</span>
                  </div>
                )}
                <p>
                  <strong>{actor.name}</strong> as {actor.character}
                </p>
              </div>
            ))}
          </div>

          <CommentsSection itemId={numericId.toString()} itemType="movie" />
        </div>
      </div>
      <Footer />
    </div>
  );
}
