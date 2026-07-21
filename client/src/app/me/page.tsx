'use client';

import './page.css';
import Footer from '@/components/reusables/Footer/Footer';
import Navbar from '@/components/reusables/Navbar/Navbar';
import { backendService } from '@/services/backendService';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Me() {
  // Get current authenticated user
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [tab, setTab] = useState('watchlist');
  const [detailedMovies, setDetailedMovies] = useState<any[]>([]);
  const [userRatings, setUserRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    const fetchData = async () => {
      const userId = user.id;
      if (!userId) {
        setDetailedMovies([]);
        setUserRatings([]);
        return;
      }

      setLoading(true);
      try {
        const watchlistMovieIds = await backendService.getWatchlistMovieIds(userId);
        const detailed = await Promise.all(
          watchlistMovieIds.map(async (movie_id: number) => {
            try {
              const media = await backendService.getMediaDetails(
                movie_id.toString(),
                movie_id < 0 ? 'tv' : 'movie',
              );
              return { ...media, watchlist_id: movie_id };
            } catch (err) {
              console.warn('Skipping unavailable watchlist item:', movie_id, err);
              return null;
            }
          }),
        );
        setDetailedMovies(detailed.filter(Boolean));

        const ratings = await backendService.getUserRatings(userId);
        const ratingsWithDetails = await Promise.all(
          ratings.map(async (entry: any) => {
            try {
              const movie = await backendService.getMediaDetails(
                entry.movie_id.toString(),
                entry.movie_id < 0 ? 'tv' : 'movie',
              );
              return { ...entry, movie };
            } catch (err) {
              console.warn('Skipping unavailable rating item:', entry.movie_id, err);
              return { ...entry, movie: null };
            }
          }),
        );
        setUserRatings(
          ratingsWithDetails.filter((entry: any) => entry.movie || entry.rating !== null),
        );
      } catch (error) {
        console.error('Failed to load profile data:', error);
        setDetailedMovies([]);
        setUserRatings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isLoaded, router]);

  const handleRemove = async (movieId: number) => {
    try {
      if (!user?.id) return;
      await backendService.removeFromWatchlist(user.id, movieId);
      setDetailedMovies((prev) => prev.filter((m) => m.watchlist_id !== movieId));
    } catch (err) {
      console.error('Remove failed:', err);
    }
  };

  const handleRemoveRating = async (movieId: number) => {
    try {
      if (!user?.id) return;
      await backendService.removeUserRating(user.id, movieId);
      setUserRatings((prev) => prev.filter((entry) => entry.movie_id !== movieId));
    } catch (err) {
      console.error('Rating removal failed:', err);
    }
  };

  return (
    <div className="me-page">
      <Navbar />

      <div className="main-content">
        <div className="profile-header">
          {user?.imageUrl && <img src={user.imageUrl} alt="avatar" className="avatar" />}
          <div className="profile-meta">
            <h2>Welcome, {user?.fullName || user?.username}</h2>
            <p className="subtitle">
              Member since{' '}
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'unknown'}
            </p>
          </div>
        </div>

        <div className="tabs">
          <button
            onClick={() => setTab('watchlist')}
            className={tab === 'watchlist' ? 'active' : ''}
          >
            Watchlist
          </button>
          <button onClick={() => setTab('ratings')} className={tab === 'ratings' ? 'active' : ''}>
            Ratings
          </button>
          <button onClick={() => setTab('account')} className={tab === 'account' ? 'active' : ''}>
            Account
          </button>
        </div>

        {tab === 'watchlist' && (
          <div className="movie-grid">
            {loading ? (
              <p className="empty-text">Loading your watchlist...</p>
            ) : detailedMovies.length === 0 ? (
              <p className="empty-text">No movies in your watchlist yet.</p>
            ) : (
              detailedMovies.map((movie) => {
                const title = movie?.title || movie?.name || 'Untitled item';
                const overview = movie?.overview || 'No overview available';
                const rating = movie?.vote_average ?? 'N/A';

                return (
                  <div className="movie-card" key={movie.watchlist_id ?? movie.id}>
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : '/placeholder.png'
                      }
                      alt={title}
                    />
                    <div className="info">
                      <h3>{title}</h3>
                      <p>
                        {overview.slice(0, 100)}
                        {overview.length > 100 ? '...' : ''}
                      </p>
                      <span>⭐ {rating}</span>
                      <button onClick={() => handleRemove(movie.watchlist_id ?? movie.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'ratings' && (
          <div className="ratings-tab">
            {loading ? (
              <p>Loading your ratings...</p>
            ) : userRatings.length === 0 ? (
              <p>You have not rated any movies yet.</p>
            ) : (
              userRatings.map((entry) => {
                const title = entry.movie?.title || entry.movie?.name || 'Rated item';

                return (
                  <div className="movie-card" key={`${entry.movie_id}-${entry.rating}`}>
                    <img
                      src={
                        entry.movie?.poster_path
                          ? `https://image.tmdb.org/t/p/w500${entry.movie.poster_path}`
                          : '/placeholder.png'
                      }
                      alt={title}
                    />
                    <div className="info">
                      <h3>{title}</h3>
                      <p>Your rating: ⭐ {entry.rating}/10</p>
                      <button onClick={() => handleRemoveRating(entry.movie_id)}>
                        Remove rating
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'account' && (
          <div className="account-info">
            <p>Email: {user?.primaryEmailAddress?.emailAddress}</p>
            <p>User ID: {user?.id}</p>
            <p>You’ve reviewed 23 movies since joining!</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
