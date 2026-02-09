import { LandingDataType } from "@/types/types";
import axios, { AxiosResponse } from "axios";
import { supabase } from "@/lib/supabaseclient";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8888";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const axiosInstance = axios.create({
  baseURL: backendUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const backendService = {
  // 🔹 Fetch backend landing/me/film data
  landingData: async () => {
    const response: AxiosResponse<LandingDataType> = await axiosInstance.get(
      "/landing/all"
    );
    if (!response || response.status !== 200)
      throw new Error("Network response was not ok");
    return response.data;
  },

  meData: async (user_id: string) => {
    const response = await axiosInstance.get("/me/all?user_id=" + user_id);
    if (!response || response.status !== 200)
      throw new Error("Network response was not ok");
    return response.data;
  },

  filmsData: async () => {
    const response = await axiosInstance.get("/films/all");
    if (!response || response.status !== 200)
      throw new Error("Network response was not ok");
    return response.data;
  },

  filmData: async (query: string, user_id?: string) => {
    const response = await axiosInstance.get(
      "/film/all?query=" + query + "&user_id=" + user_id
    );
    if (!response || response.status !== 200)
      throw new Error("Network response was not ok");
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
      console.error("Error fetching popular movies:", error);
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
      console.error("Error fetching popular TV shows:", error);
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
      console.error("Error searching movies and shows:", error);
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
      console.error("Error fetching movie details:", error);
      throw error;
    }
  },

  getMovieTrailer: async (movieId: number) => {
    const res = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
      params: { api_key: TMDB_API_KEY },
    });
    const trailer = res.data.results.find(
      (vid: any) => vid.type === "Trailer" && vid.site === "YouTube"
    );
    return trailer ? trailer.key : null;
  },

  getMovieCast: async (movieId: number) => {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
        params: { api_key: TMDB_API_KEY },
      });
      return res.data.cast.slice(0, 10);
    } catch (error) {
      console.error("Error fetching cast:", error);
      throw error;
    }
  },

  addToWatchlist: async (userId: string, movieId: number) => {
    const { data, error } = await supabase
      .from("watchlist")
      .insert([{ user_id: userId, movie_id: movieId }])
      .select();

    if (error) {
      if (error.code === "23505") {
        console.warn("Movie already in watchlist");
      } else {
        throw error;
      }
    }

    return data;
  },

  getMovieComments: async (movieId: number) => {
    const { data, error } = await supabase
      .from("comments")
      .select("name, text, created_at")
      .eq("movie_id", movieId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }

    return data;
  },

  addMovieComment: async (
    movieId: number,
    comment: { name: string; text: string }
  ) => {
    const { data, error } = await supabase.from("comments").insert([
      {
        movie_id: movieId,
        name: comment.name,
        text: comment.text,
      },
    ]);

    if (error) {
      console.error("Error adding comment:", error);
      throw error;
    }

    return data;
  },
  getTrendingMovies: async () => {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
        params: { api_key: TMDB_API_KEY },
      });
      return res.data.results;
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      throw error;
    }
  },
  removeFromWatchlist: async (userId: string, movieId: number) => {
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .delete()
        .match({ user_id: userId, movie_id: movieId });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      throw error;
    }
  },
  getAllMoviesOrShows: async (
    type: "movie" | "tv" = "movie",
    page: number = 1
  ) => {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/discover/${type}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: "en-US",
          sort_by: "popularity.desc",
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
      console.error("Error fetching movies by genre:", error);
      throw error;
    }
  },
};
