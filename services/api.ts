import AsyncStorage from '@react-native-async-storage/async-storage';

// Endpoint API Xano
const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:zO4A15ca'; 

// Function buat generate ID unik HP (gantiin sistem login)
export const getDeviceId = async () => {
  try {
    let id = await AsyncStorage.getItem('device_user_id');
    
    if (!id) {
      // Kalau belum ada ID, bikin random string baru
      id = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      await AsyncStorage.setItem('device_user_id', id);
    }
    return id;
  } catch (e) {
    console.error("Error get device id", e);
    return 'unknown_user';
  }
};

// Ambil list semua film
export const getMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movies`);
    const json = await response.json();
    return json;
  } catch (error) {
    console.log("Gagal fetch movies:", error);
    return []; 
  }
};

// Ambil detail satu film
export const getMovieDetail = async (id: number) => {
  try {
    const response = await fetch(`${BASE_URL}/movies/${id}`);
    const json = await response.json();
    return json;
  } catch (error) {
    return null;
  }
};

// Post film baru + ID owner
export const addMovie = async (data: any) => {
  try {
    const myId = await getDeviceId();

    const response = await fetch(`${BASE_URL}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        owner_id: myId 
      }),
    });
    return response.ok; 
  } catch (error) {
    return false;
  }
};

// Hapus film
export const deleteMovie = async (id: number) => {
  try {
    const response = await fetch(`${BASE_URL}/movies/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Update data film
export const updateMovie = async (id: number, data: any) => {
  try {
    const response = await fetch(`${BASE_URL}/movies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Ambil list reviews
export const getReviews = async () => {
  try {
    const response = await fetch(`${BASE_URL}/reviews`);
    const json = await response.json();
    return json;
  } catch (error) {
    return [];
  }
};

// Post review baru
export const addReview = async (movieId: number, name: string, rating: number, comment: string) => {
  try {
    const myDeviceId = await getDeviceId(); 

    const response = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        movies_id: movieId,
        reviewer_name: name,
        rating: rating,
        comment: comment,
        device_id: myDeviceId, // Kirim ID device buat validasi nanti
      }),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Update review sendiri
export const updateReview = async (reviewId: number, name: string, rating: number, comment: string) => {
  try {
    const response = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        reviewer_name: name, 
        rating: rating, 
        comment: comment 
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Gagal update review:", error);
    return false;
  }
};