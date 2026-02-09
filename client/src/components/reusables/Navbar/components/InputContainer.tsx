"use client";
import { SearchIcon } from "@/assets/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export default function InputContainer() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = async () => {
    if (searchQuery.trim() === "") return;

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query: searchQuery.trim(),
        },
      });

      const firstMovie = response.data.results[0];
      if (firstMovie?.id) {
        router.push(`/films/${firstMovie.id}`);
        setSearchQuery("");
      } else {
        alert("No matching movie found.");
      }
    } catch (err) {
      console.error("Search error:", err);
      alert("Something went wrong while searching.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="nav-input-container">
      <input
        type="text"
        placeholder="Search..."
        className="nav-input"
        autoComplete="off"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        className="nav-input-button"
        onClick={handleSearch}
        aria-label="Search"
      >
        <SearchIcon />
      </button>
    </div>
  );
}
