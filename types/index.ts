// types/index.ts

export interface Movie {
  id: number;
  title: string;
  description: string;
  release_year: number;
  poster: string;     // URL Poster
  owner_id?: string;  // 🆕 ID Pemilik (Opsional karena film lama mungkin ga punya)
}

export interface NewMoviePayload {
  title: string;
  description: string;
  release_year: number;
  poster: string;
  owner_id?: string; // 🆕 Kita kirim ini pas bikin film
}

export interface Review {
  id: number;
  movies_id: number;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: number;
  // 👇 TAMBAHIN INI
  device_id?: string; // Tanda tanya (?) artinya opsional, jaga-jaga kalau data lama belum punya ID
}