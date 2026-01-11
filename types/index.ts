export interface Movie {
  id: number;
  title: string;
  description: string;
  release_year: number;
  poster: string;
  owner_id?: string; // Optional, buat cek owner
}

export interface NewMoviePayload {
  title: string;
  description: string;
  release_year: number;
  poster: string;
  owner_id?: string;
}

export interface Review {
  id: number;
  movies_id: number;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: number;
  device_id?: string; // ID device user
}