"use client";

import "./page.css";
import Footer from "@/components/reusables/Footer/Footer";
import Navbar from "@/components/reusables/Navbar/Navbar";
import { backendService } from "@/services/backendService";
import { useEffect, useState } from "react";
import Link from "next/link";

type Movie = {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
  poster_path: string;
  trailerKey?: string;
};

export default function Films() {
  // State for trending movies
  const [movies, setMovies] = useState<Movie[]>([]);

  const [comments, setComments] = useState<Record<number, string[]>>({});

  const [genres] = useState([
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 10770, name: "TV Movie" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" },
  ]);
  const [selectedGenreId, setSelectedGenreId] = useState<number | "">("");
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const rawMovies = await backendService.getTrendingMovies();

        const moviesWithTrailers = await Promise.all(
          rawMovies.map(async (movie: Movie) => {
            const trailerKey = await backendService.getMovieTrailer(movie.id);
            return { ...movie, trailerKey };
          })
        );

        setMovies(moviesWithTrailers);
      } catch (err) {
        console.error("Failed to load movies:", err);
      }
    };

    loadMovies();
  }, []);

  useEffect(() => {
    if (!selectedGenreId) {
      setGenreMovies([]);
      return;
    }

    const fetchByGenre = async () => {
      try {
        const moviesByGenre = await backendService.getMoviesByGenre(
          Number(selectedGenreId),
          1
        );

        const moviesWithTrailers = await Promise.all(
          moviesByGenre.map(async (movie: Movie) => {
            const trailerKey = await backendService.getMovieTrailer(movie.id);
            return { ...movie, trailerKey };
          })
        );

        setGenreMovies(moviesWithTrailers); // Update state
      } catch (error) {
        console.error("Error fetching movies by genre:", error);
      }
    };

    fetchByGenre();
  }, [selectedGenreId]);

  const handleComment = (movieId: number, comment: string) => {
    setComments((prev) => ({
      ...prev,
      [movieId]: [...(prev[movieId] || []), comment],
    }));
  };

  return (
    <>
      <Navbar />

      <div className="genre-selector my-6 p-4 rounded max-w-4xl mx-auto bg-black text-white">
        <h2 className="text-2xl font-semibold mb-3">Pick a Genre</h2>
        <label
          htmlFor="genre-select"
          className="block mb-1 font-semibold text-white text-sm"
        >
          Pick a Genre
        </label>
        <select
          id="genre-select"
          className="border p-2 rounded w-full max-w-xs bg-black text-white text-sm"
          value={selectedGenreId}
          onChange={(e) =>
            setSelectedGenreId(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">-- Select Genre --</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        {genreMovies.length > 0 && (
          <div className="genre-movies mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {genreMovies.map((movie) => (
              <Link href={`/films/${movie.id}`} key={movie.id}>
                <div className="movie-card cursor-pointer">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="poster rounded"
                    />
                  ) : (
                    <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center rounded">
                      <span className="text-gray-600">No Image</span>
                    </div>
                  )}
                  <h3>{movie.title}</h3>
                  <p className="overview">{movie.overview}</p>
                  <p className="rating">⭐ {movie.vote_average.toFixed(1)}</p>

                  {movie.trailerKey && (
                    <iframe
                      width="100%"
                      height="200"
                      src={`https://www.youtube.com/embed/${movie.trailerKey}`}
                      title={`${movie.title} Trailer`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="trailer"
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="movie-grid max-w-6xl mx-auto px-4">
        {movies.map((movie) => (
          <Link href={`/films/${movie.id}`} key={movie.id}>
            <div className="movie-card">
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                className="poster"
              />
              <h3>{movie.title}</h3>
              <p className="overview">{movie.overview}</p>
              <p className="rating">⭐ {movie.vote_average.toFixed(1)}</p>

              {/* Trailer */}
              {movie.trailerKey && (
                <iframe
                  width="100%"
                  height="200"
                  src={`https://www.youtube.com/embed/${movie.trailerKey}`}
                  title={`${movie.title} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="trailer"
                ></iframe>
              )}

              <textarea
                placeholder="Leave a comment and press Enter"
                className="comment-box"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const comment = e.currentTarget.value.trim();
                    if (!comment) return;
                    handleComment(movie.id, comment);
                    e.currentTarget.value = ""; // Clear textarea
                  }
                }}
              />

              <div className="comment-list">
                {(comments[movie.id] || []).map((cmt, idx) => (
                  <p key={idx} className="comment">
                    {cmt}
                  </p>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Footer />
    </>
  );
}
