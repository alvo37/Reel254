// types for landing page data
export interface Film {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  poster_url: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  backdrop_url: string | null;
  backdrop_path: string | null;
  popularity: number;
}

export interface AuthorDetails {
  avatar_path: string | null;
  name: string;
  rating: number | null;
  username: string;
}

export interface Review {
  id: number;
  author: string;
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
  author_details: AuthorDetails;
}

export interface LandingDataType {
  trending_film: Film | null;
  top_6_recent_films: Film[];
  recent_films: Film[];
  recent_reviews: Review[];
}
// types for landing page data
