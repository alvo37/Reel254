"use client";

import "./page.css";
import Footer from "@/components/reusables/Footer/Footer";
import Navbar from "@/components/reusables/Navbar/Navbar";
import { backendService } from "@/services/backendService";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Me() {
  // Get current authenticated user
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [tab, setTab] = useState("watchlist");

  const [detailedMovies, setDetailedMovies] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (isLoaded && !user) router.push("/auth/sign-in");

    const fetchWatchlist = async () => {
      const { data: watchlistData, error } = await supabase
        .from("watchlist")
        .select("movie_id")
        .eq("user_id", "demo-user");

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      if (!watchlistData || watchlistData.length === 0) {
        setDetailedMovies([]);
        return;
      }

      // Fetch detailed info for each movie in watchlist
      const detailed = await Promise.all(
        watchlistData.map(async ({ movie_id }) => {
          try {
            return await backendService.getMovieDetails(movie_id);
          } catch (err) {
            console.error("Fetch error for movie_id:", movie_id, err);
            return null;
          }
        })
      );

      setDetailedMovies(detailed.filter(Boolean));
    };

    fetchWatchlist();
  }, [user, isLoaded, router]);

  const handleRemove = async (movieId: number) => {
    try {
      if (!user?.id) return;
      await backendService.removeFromWatchlist(user.id, movieId);
      setDetailedMovies((prev) => prev.filter((m) => m.id !== movieId));
    } catch (err) {
      console.error("Remove failed:", err);
    }
  };

  return (
    <div className="me-page">
      <Navbar />

      <div className="main-content">
        <div className="profile-header">
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="avatar" className="avatar" />
          )}
          <h2>Welcome, {user?.fullName || user?.username}</h2>
          <p className="subtitle">
            Member since{" "}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "unknown"}
          </p>
        </div>

        <div className="tabs">
          <button
            onClick={() => setTab("watchlist")}
            className={tab === "watchlist" ? "active" : ""}
          >
            Watchlist
          </button>
          <button
            onClick={() => setTab("ratings")}
            className={tab === "ratings" ? "active" : ""}
          >
            Ratings
          </button>
          <button
            onClick={() => setTab("account")}
            className={tab === "account" ? "active" : ""}
          >
            Account
          </button>
        </div>

        {tab === "watchlist" && (
          <div className="movie-grid">
            {detailedMovies.length === 0 ? (
              <p className="empty-text">No movies in your watchlist yet.</p>
            ) : (
              detailedMovies.map((movie) => (
                <div className="movie-card" key={movie.id}>
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "/placeholder.png"
                    }
                    alt={movie.title || "Untitled Movie"}
                  />
                  <div className="info">
                    <h3>{movie.title}</h3>
                    <p>
                      {movie.overview?.slice(0, 100) || "No overview available"}
                      ...
                    </p>
                    <span>⭐ {movie.vote_average || "N/A"}</span>
                    <button onClick={() => handleRemove(movie.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "ratings" && (
          <div className="ratings-tab">
            <p>Coming soon: Your movie ratings and reviews.</p>
          </div>
        )}

        {tab === "account" && (
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
