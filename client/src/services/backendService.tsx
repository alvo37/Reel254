import { LandingDataType } from '@/types/types';
import axios, { AxiosResponse } from 'axios';
import { supabase } from '@/lib/supabaseclient';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8888';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const axiosInstance = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const WATCHLIST_STORAGE_KEY = 'reel254_watchlist';

const readLocalWatchlist = (userId?: string) => {
  if (typeof window === 'undefined') return [];

  const storageKey = `${WATCHLIST_STORAGE_KEY}_${userId || 'guest'}`;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalWatchlist = (userId: string | undefined, movieIds: number[]) => {
  if (typeof window === 'undefined') return;

  const storageKey = `${WATCHLIST_STORAGE_KEY}_${userId || 'guest'}`;
  window.localStorage.setItem(storageKey, JSON.stringify(movieIds));
};

export const backendService = {
  // 🔹 Fetch backend landing/me/film data
  landingData: async () => {
    const response: AxiosResponse<LandingDataType> = await axiosInstance.get('/landing/all');
    if (!response || response.status !== 200) throw new Error('Network response was not ok');
    return response.data;
  },

  meData: async (user_id: string) => {
    const response = await axiosInstance.get('/me/all?user_id=' + user_id);
    if (!response || response.status !== 200) throw new Error('Network response was not ok');
    return response.data;
  },

  filmsData: async () => {
    const response = await axiosInstance.get('/films/all');
    if (!response || response.status !== 200) throw new Error('Network response was not ok');
    return response.data;
  },

  filmData: async (query: string, user_id?: string) => {
    const response = await axiosInstance.get('/film/all?query=' + query + '&user_id=' + user_id);
    if (!response || response.status !== 200) throw new Error('Network response was not ok');
    return response.data;
  },

  // 🔥 TMDB API: MOVIES / SERIES
  getPopularMovies: async () => {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: { api_key: TMDB_API_KEY, page: 1 },
      });
      return res.data.results;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
  },

  getPopularTVShows: async () => {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
        params: { api_key: TMDB_API_KEY, page: 1 },
      });
      return res.data.results;
    } catch (error) {
      console.error('Error fetching popular TV shows:', error);
      throw error;
    }
  },

  searchMoviesAndShows: async (query: string) => {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
        params: { api_key: TMDB_API_KEY, query, include_adult: false },
      });
      return res.data.results;
    } catch (error) {
      console.error('Error searching movies and shows:', error);
      throw error;
    }
  },

  getMovieDetails: async (movieId: string) => {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
        params: { api_key: TMDB_API_KEY },
      });
      return res.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  },

  getMediaDetails: async (mediaId: string, preferredType?: 'movie' | 'tv') => {
    const trimmedId = mediaId?.trim();
    if (!trimmedId) throw new Error('Media ID is required');

    const normalizedId = trimmedId.replace(/^[+-]/, '');
    const isTvEncoded = trimmedId.startsWith('-');
    const targetType = preferredType ?? (isTvEncoded ? 'tv' : 'movie');

    try {
      if (targetType === 'tv') {
        const res = await axios.get(`${TMDB_BASE_URL}/tv/${normalizedId}`, {
          params: { api_key: TMDB_API_KEY },
        });
        return { ...res.data, media_type: 'tv' };
      }

      const res = await axios.get(`${TMDB_BASE_URL}/movie/${normalizedId}`, {
        params: { api_key: TMDB_API_KEY },
      });
      return { ...res.data, media_type: 'movie' };
    } catch (primaryError: any) {
      const isNotFound = axios.isAxiosError(primaryError) && primaryError.response?.status === 404;

      if (!isNotFound) {
        throw primaryError;
      }

      const fallbackType = targetType === 'tv' ? 'movie' : 'tv';
      try {
        const res = await axios.get(`${TMDB_BASE_URL}/${fallbackType}/${normalizedId}`, {
          params: { api_key: TMDB_API_KEY },
        });
        return { ...res.data, media_type: fallbackType };
      } catch (fallbackError: any) {
        if (axios.isAxiosError(fallbackError) && fallbackError.response?.status === 404) {
          throw new Error(`No ${targetType} or ${fallbackType} entry found for ID ${normalizedId}`);
        }
        throw fallbackError;
      }
    }
  },

  getMovieTrailer: async (movieId: number) => {
    const res = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
      params: { api_key: TMDB_API_KEY },
    });
    const trailer = res.data.results.find(
      (vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube',
    );
    return trailer ? trailer.key : null;
  },

  // 🎭 Movie Cast
  getMovieCast: async (movieId: number) => {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
        params: { api_key: TMDB_API_KEY },
      });
      return res.data.cast.slice(0, 10);
    } catch (error) {
      console.error('Error fetching movie cast:', error);
      throw error;
    }
  },

  // TV Cast
  getTVCast: async (tvId: number) => {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/tv/${tvId}/credits`, {
        params: { api_key: TMDB_API_KEY },
      });
      return res.data.cast.slice(0, 10);
    } catch (error) {
      console.error('Error fetching TV cast:', error);
      throw error;
    }
  },

  addToWatchlist: async (userId: string | undefined, movieId: number, showId: number) => {
    if (!userId) {
      return { data: [], source: 'guest' };
    }

    try {
      const { data: existingRows, error: existingError } = await supabase
        .from('watchlist')
        .select('movie_id')
        .eq('user_id', userId)
        .eq('movie_id', movieId)
        .maybeSingle();

      if (existingError) {
        console.warn('Watchlist check unavailable:', existingError.message);
        return { data: [], source: 'fallback' };
      }

      if (existingRows) {
        return { data: [existingRows], source: 'supabase' };
      }

      const { data, error } = await supabase
        .from('watchlist')
        .insert([{ user_id: userId, movie_id: movieId }])
        .select();

      if (error) {
        console.warn('Watchlist save unavailable:', error.message);
        return { data: [], source: 'fallback' };
      }

      return { data, source: 'supabase' };
    } catch (error) {
      console.warn('Watchlist save failed silently:', error);
      return { data: [], source: 'fallback' };
    }
  },

  getMovieComments: async (movieId: number) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, user_id, name, text, created_at, movie_id')
        .eq('movie_id', movieId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Comments unavailable, using empty list:', error.message);
        return [];
      }

      return data ?? [];
    } catch (error) {
      console.warn('Comments query failed, using empty list:', error);
      return [];
    }
  },

  addMovieComment: async (
    movieId: number,
    comment: { name: string; text: string },
    userId?: string,
  ) => {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          movie_id: movieId,
          name: comment.name,
          text: comment.text,
          user_id: userId ?? null,
        },
      ])
      .select();

    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }

    return data;
  },
  getTrendingMovies: async (page = 1) => {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
        params: { api_key: TMDB_API_KEY, page },
      });
      return res.data.results;
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      throw error;
    }
  },

  getTrendingTVShows: async (page = 1) => {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/trending/tv/week`, {
        params: { api_key: TMDB_API_KEY, page },
      });
      return res.data.results;
    } catch (error) {
      console.error('Error fetching trending TV shows:', error);
      throw error;
    }
  },
  removeFromWatchlist: async (userId: string | undefined, movieId: number) => {
    if (!userId) {
      return { data: [], source: 'guest' };
    }

    try {
      const { data, error } = await supabase
        .from('watchlist')
        .delete()
        .match({ user_id: userId, movie_id: movieId })
        .select();

      if (error) throw error;
      return { data, source: 'supabase' };
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  },

  getWatchlistMovieIds: async (userId?: string) => {
    if (!userId) return [];

    const { data, error } = await supabase
      .from('watchlist')
      .select('movie_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row: any) => row.movie_id);
  },

  getUserRatings: async (userId?: string) => {
    if (!userId) return [];

    const { data, error } = await supabase
      .from('ratings')
      .select('movie_id, rating, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  // 🎬 TV Rating – store rating for a TV show
  addTVRating: async (userId: string | undefined, showId: number, rating: number) => {
    if (!userId) throw new Error('User required');

    const { data: existingRows, error: fetchError } = await supabase
      .from('ratings')
      .select('id')
      .eq('user_id', userId)
      .or(`movie_id.eq.${showId},show_id.eq.${showId}`)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingRows) {
      const { data, error } = await supabase
        .from('ratings')
        .update({ rating, movie_id: showId, show_id: showId })
        .eq('id', existingRows.id)
        .select();

      if (error) throw error;
      return data ?? [];
    }

    const { data, error } = await supabase
      .from('ratings')
      .insert([{ user_id: userId, movie_id: showId, show_id: showId, rating }])
      .select();

    if (error) throw error;
    return data ?? [];
  },
  // 🎬 Movie Rating – store rating for a movie
  addUserRating: async (userId: string | undefined, movieId: number, rating: number) => {
    if (!userId) throw new Error('User required');

    const { data: existingRows, error: fetchError } = await supabase
      .from('ratings')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingRows) {
      const { data, error } = await supabase
        .from('ratings')
        .update({ rating })
        .eq('id', existingRows.id)
        .select();

      if (error) throw error;
      return data ?? [];
    }

    const { data, error } = await supabase
      .from('ratings')
      .insert([{ user_id: userId, movie_id: movieId, rating }])
      .select();

    if (error) throw error;
    return data ?? [];
  },
  removeUserRating: async (userId: string | undefined, movieId: number) => {
    if (!userId) return;

    const { error } = await supabase
      .from('ratings')
      .delete()
      .match({ user_id: userId, movie_id: movieId });
    if (error) throw error;
  },
  getAllMoviesOrShows: async (type: 'movie' | 'tv' = 'movie', page: number = 1) => {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/discover/${type}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US',
          sort_by: 'popularity.desc',
          page,
          include_adult: false,
        },
      });
      return res.data.results;
    } catch (error) {
      console.error(`Error fetching all ${type}s:`, error);
      throw error;
    }
  },
  getMoviesByGenre: async (genreId: number, page = 1) => {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          with_genres: genreId,
          page,
        },
      });
      return res.data.results;
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      throw error;
    }
  },

  getTVShowsByGenre: async (genreId: number, page = 1) => {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/discover/tv`, {
        params: {
          api_key: TMDB_API_KEY,
          with_genres: genreId,
          page,
          include_adult: false,
        },
      });
      return res.data.results;
    } catch (error) {
      console.error('Error fetching TV shows by genre:', error);
      throw error;
    }
  },
  // 📺 TV Watchlist – add TV show to watchlist
  addTVToWatchlist: async (userId: string | undefined, tvId: number) => {
    if (!userId) {
      return { data: [], source: 'guest' };
    }

    const encodedId = -Math.abs(tvId);

    try {
      const { data: existingRows, error: fetchError } = await supabase
        .from('watchlist')
        .select('id, movie_id')
        .eq('user_id', userId)
        .in('movie_id', [tvId, encodedId])
        .maybeSingle();

      if (fetchError) {
        console.warn('Watchlist TV lookup unavailable:', fetchError.message);
        return { data: [], source: 'fallback' };
      }

      if (existingRows) {
        if (existingRows.movie_id !== encodedId) {
          const { data: updatedRows, error: updateError } = await supabase
            .from('watchlist')
            .update({ movie_id: encodedId })
            .eq('id', existingRows.id)
            .select();

          if (updateError) {
            console.warn('Watchlist TV update unavailable:', updateError.message);
            return { data: [], source: 'fallback' };
          }

          return { data: updatedRows ?? [], source: 'supabase' };
        }

        return { data: [existingRows], source: 'supabase' };
      }

      const { data, error } = await supabase
        .from('watchlist')
        .insert([{ user_id: userId, movie_id: encodedId }])
        .select();

      if (error) {
        console.warn('Watchlist TV save unavailable:', error.message);
        return { data: [], source: 'fallback' };
      }

      return { data, source: 'supabase' };
    } catch (err) {
      console.warn('Watchlist TV save failed:', err);
      return { data: [], source: 'fallback' };
    }
  },
  // 📺 Get TV watchlist IDs for a user
  getWatchlistTVIds: async (userId?: string) => {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('watchlist')
      .select('movie_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: any) => Math.abs(row.movie_id));
  },
  // TV Details
  getTVDetails: async (tvId: string) => {
    const res = await axios.get(`${TMDB_BASE_URL}/tv/${tvId}`, {
      params: { api_key: TMDB_API_KEY },
    });
    return res.data;
  },
  // TV Trailer
  getTVTrailer: async (tvId: number) => {
    const res = await axios.get(`${TMDB_BASE_URL}/tv/${tvId}/videos`, {
      params: { api_key: TMDB_API_KEY },
    });
    const trailer = res.data.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
    return trailer ? trailer.key : null;
  },
};
