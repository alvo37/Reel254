// @ts-nocheck
'use client';

import './page.css';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/reusables/Navbar/Navbar';
import Footer from '@/components/reusables/Footer/Footer';
import { backendService } from '@/services/backendService';
import { supabase } from '@/lib/supabaseclient';
import CommentsSection from '@/components/CommentsSection';

type TVDetails = {
  name: string;
  overview: string;
  first_air_date: string;
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

export default function TVShowPage() {
  const params = useParams();
  const { user, isLoaded } = useUser();
  const showId = Array.isArray(params.showid) ? params.showid[0] : params.showid || '';
  const numericId = parseInt(showId || '0');
  if (!numericId) return <p>Invalid TV show ID.</p>;

  const [show, setShow] = useState<TVDetails | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  const userId = user?.id;

  const fetchUserRating = async () => {
    if (!userId || !numericId) {
      setUserRating(null);
      return;
    }

    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('user_id', userId)
      .eq('show_id', numericId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch user rating:', error);
      setUserRating(null);
      return;
    }

    setUserRating(data?.rating ?? null);
  };

  const fetchAverageRating = async () => {
    if (!numericId) {
      setAverageRating(null);
      return;
    }

    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('show_id', numericId);

    if (error) {
      console.error('Failed to fetch avg rating:', error);
      setAverageRating(null);
      return;
    }

    if (!data || data.length === 0) {
      setAverageRating(null);
      return;
    }

    const total = data.reduce((sum: number, r: any) => sum + (r.rating ?? 0), 0);
    setAverageRating(parseFloat((total / data.length).toFixed(1)));
  };

  useEffect(() => {
    if (!numericId) return;

    const fetchDetails = async () => {
      try {
        const details = await backendService.getTVDetails(numericId.toString());
        const trailerKey = await backendService.getTVTrailer(numericId);
        const castList = await backendService.getTVCast(numericId);
        setShow({ ...details, trailerKey });
        setCast(castList);
        await fetchUserRating();
        await fetchAverageRating();
      } catch (err) {
        console.error('Error loading TV page:', err);
      }
    };

    fetchDetails();
  }, [numericId, userId]);

  const handleAddToWatchlist = async () => {
    if (!isLoaded) return;
    if (!userId) {
      alert('Please sign in to add to watchlist.');
      return;
    }
    try {
      const result = await backendService.addTVToWatchlist(userId, numericId);
      if (result?.source === 'fallback') alert('Added locally; Supabase unavailable.');
      else alert('Added to watchlist!');
    } catch (err) {
      console.warn('Failed to add to watchlist:', err);
      alert('Could not save to watchlist.');
    }
  };

  const handleRateShow = async (rating: number) => {
    if (!userId) {
      alert('Please sign in to rate.');
      return;
    }

    try {
      await backendService.addTVRating(userId, numericId, rating);
      setUserRating(rating);
      await fetchAverageRating();
    } catch (err) {
      console.error('Error rating:', err);
      alert(err instanceof Error ? err.message : 'Could not save rating.');
    }
  };

  if (!show) return <p>Loading TV show details...</p>;

  return (
    <div className="tvshow-detail-page">
      <Navbar />
      <div className="tvshow-detail-content">
        <div className="hero-card">
          {show.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
              alt={show.name}
              className="poster-image"
            />
          ) : (
            <div className="poster-placeholder">
              <span>No poster available</span>
            </div>
          )}

          <div className="details">
            <h1>{show.name}</h1>
            <div className="detail-list">
              <p>
                <strong>First Air Date:</strong> {show.first_air_date}
              </p>
              <p>
                <strong>TMDB Rating:</strong> ⭐ {show.vote_average.toFixed(1)}
              </p>
              {averageRating !== null && (
                <p>
                  <strong>Average User Rating:</strong> ⭐ {averageRating}/10
                </p>
              )}
            </div>

            <div className="rating-block">
              <h2>Your Rating</h2>
              <div className="rating-buttons">
                {[...Array(10)].map((_, i) => {
                  const value = i + 1;
                  return (
                    <button
                      key={value}
                      onClick={() => handleRateShow(value)}
                      className={`rating-button ${userRating === value ? 'active' : ''}`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="overview">{show.overview}</p>

            <div className="action-row">
              <button
                onClick={handleAddToWatchlist}
                className="action-button primary"
                type="button"
              >
                ➕ Add to Watchlist
              </button>
            </div>

            {show.trailerKey ? (
              <iframe
                src={`https://www.youtube.com/embed/${show.trailerKey}`}
                title={`${show.name} Trailer`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="trailer-frame"
              ></iframe>
            ) : (
              <p className="empty-state">No trailer available</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="section-title">Cast</h2>
          <div className="cast-grid">
            {cast.map((actor) => (
              <div key={actor.id} className="actor-card">
                {actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                    alt={actor.name}
                  />
                ) : (
                  <div className="poster-placeholder">
                    <span>No image</span>
                  </div>
                )}
                <p>
                  <strong>{actor.name}</strong> as {actor.character}
                </p>
              </div>
            ))}
          </div>
        </div>

          <CommentsSection itemId={numericId.toString()} itemType="tvshow" />
      </div>
      <Footer />
    </div>
  );
}
