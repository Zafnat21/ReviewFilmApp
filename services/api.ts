import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔗 URL DATABASE XANO KAMU
const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:zO4A15ca'; 

// ====================================================================
// 🆔 BAGIAN 1: SISTEM IDENTITAS (TANPA LOGIN RIBET)
// ====================================================================

// Fungsi buat bikin atau ambil ID unik HP ini
export const getDeviceId = async () => {
  try {
    // 1. Cek dulu di memori HP, udah pernah bikin ID belum?
    let id = await AsyncStorage.getItem('device_user_id');
    
    if (!id) {
      // 2. Kalau belum ada (baru install), kita bikin ID acak
      // Contoh hasil: "user_170988221_882"
      id = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      
      // 3. Simpan permanen di HP biar gak berubah-ubah
      await AsyncStorage.setItem('device_user_id', id);
    }
    return id;
  } catch (e) {
    console.error("Gagal ambil device id", e);
    return 'unknown_user'; // Jaga-jaga kalau error
  }
};

// ====================================================================
// 🎬 BAGIAN 2: URUSAN FILM (MOVIE)
// ====================================================================

// 1. Ambil Semua Film (GET)
export const getMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movies`);
    const json = await response.json();
    return json;
  } catch (error) {
    console.log("Error ambil movies:", error);
    return []; // Kalau error, kasih array kosong biar gak crash
  }
};

// 2. Ambil Detail 1 Film (GET ID)
export const getMovieDetail = async (id: number) => {
  try {
    const response = await fetch(`${BASE_URL}/movies/${id}`);
    const json = await response.json();
    return json;
  } catch (error) {
    return null;
  }
};

// 3. Tambah Film Baru (POST)
export const addMovie = async (data: any) => {
  try {
    // Ambil ID HP kita dulu (biar tau siapa yang upload)
    const myId = await getDeviceId();

    const response = await fetch(`${BASE_URL}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,       // Judul, tahun, poster, deskripsi
        owner_id: myId // 👈 Stempel kepemilikan
      }),
    });
    return response.ok; // Balikin true kalau sukses
  } catch (error) {
    return false; // Balikin false kalau gagal
  }
};

// 4. Hapus Film (DELETE)
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

// 5. Edit Film (PATCH)
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

// ====================================================================
// ⭐ BAGIAN 3: URUSAN REVIEW & KOMENTAR
// ====================================================================

// 6. Ambil Semua Review (GET)
export const getReviews = async () => {
  try {
    const response = await fetch(`${BASE_URL}/reviews`);
    const json = await response.json();
    return json;
  } catch (error) {
    return [];
  }
};

// 7. Tambah Review Baru (POST) - UPDATE PENTING DI SINI!
export const addReview = async (movieId: number, name: string, rating: number, comment: string) => {
  try {
    // 👇 INI YANG PENTING BROW!
    // Kita ambil ID HP dulu sebelum kirim ke database
    const myDeviceId = await getDeviceId(); 

    const response = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        movies_id: movieId,
        reviewer_name: name,
        rating: rating,
        comment: comment,
        device_id: myDeviceId, // 👈 ID HP dikirim ke Database Xano
      }),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// 8. Edit Review (PATCH) - FITUR BARU
export const updateReview = async (reviewId: number, name: string, rating: number, comment: string) => {
  try {
    const response = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
      method: 'PATCH', // Update data sebagian
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

