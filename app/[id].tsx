import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// 👇 Import AsyncStorage buat syarat Local Storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import fungsi API 
import { addReview, deleteMovie, getDeviceId, getMovieDetail, getReviews, updateMovie, updateReview } from '../services/api';
import { Movie } from '../types';

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Logika Kepemilikan
  const [isOwner, setIsOwner] = useState(false); 
  const [myReview, setMyReview] = useState<any>(null); 
  
  const [refreshing, setRefreshing] = useState(false);

  // Form Input Review
  const [name, setName] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  // State Loading khusus tombol kirim review
  const [loadingReview, setLoadingReview] = useState(false);

  // Modal Edit FILM
  const [modalFilmVisible, setModalFilmVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPoster, setEditPoster] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Modal Edit REVIEW
  const [modalReviewVisible, setModalReviewVisible] = useState(false);
  const [editReviewName, setEditReviewName] = useState('');
  const [editReviewRating, setEditReviewRating] = useState('');
  const [editReviewComment, setEditReviewComment] = useState('');

  const refreshData = async () => {
    if (id) {
      const myId = await getDeviceId();
      const movieData = await getMovieDetail(Number(id));
      setMovie(movieData);

      // Cek Pemilik Film
      if (movieData && movieData.owner_id === myId) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }

      // Ambil Review
      const allReviews = await getReviews();
      const filter = allReviews.filter((r: any) => r.movies_id === Number(id));
      setReviews(filter);

      // Cek Review Saya
      const myRev = filter.find((r: any) => r.device_id === myId);
      setMyReview(myRev || null);
      
      // 👇 LOGIKA LOCAL STORAGE: Ambil nama yang tersimpan di HP
      try {
        const savedName = await AsyncStorage.getItem('user_name');
        if (savedName) {
          setName(savedName); // Otomatis isi kolom nama
        }
      } catch (e) {
        console.log("Gagal ambil nama", e);
      }
      
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [id]);

  // --- LOGIC FILM (HAPUS & EDIT) ---
  const handleHapus = () => {
      Alert.alert("Hapus Film?", "Yakin?", [{ text: "Batal" }, { text: "Hapus", style: 'destructive', onPress: async () => {
          await deleteMovie(Number(id)); router.replace('/(tabs)');
      }}]);
  };
  
  const bukaModalEditFilm = () => {
    if (movie) {
      setEditTitle(movie.title); setEditYear(movie.release_year.toString()); setEditDesc(movie.description); setEditPoster(movie.poster || ''); 
      setModalFilmVisible(true);
    }
  };

  const handleSimpanEditFilm = async () => {
    setLoadingEdit(true); // Mulai Buffering
    const success = await updateMovie(Number(id), { title: editTitle, release_year: parseInt(editYear), description: editDesc, poster: editPoster });
    setLoadingEdit(false); // Stop Buffering
    
    if (success) { setModalFilmVisible(false); refreshData(); Alert.alert("Sukses", "Film diupdate!"); }
  };

  // --- LOGIC REVIEW (KIRIM & EDIT) ---
  const handleKirimReview = async () => {
    const angkaRating = parseFloat(rating);
    if (angkaRating < 1 || angkaRating > 10 || isNaN(angkaRating)) return Alert.alert("Error", "Rating 1-10 woy!");
    if (!name || !comment) return Alert.alert("Error", "Isi semua data!");

    setLoadingReview(true); // 👇 Mulai Buffering Tombol Review

    const sukses = await addReview(Number(id), name, angkaRating, comment);
    
    setLoadingReview(false); // 👇 Stop Buffering

    if (sukses) {
      // 👇 LOGIKA LOCAL STORAGE: Simpan nama ke HP biar diingat
      await AsyncStorage.setItem('user_name', name);

      // Reset form kecuali nama (biar UX enak)
      setRating(''); 
      setComment('');
      
      refreshData();
      Alert.alert("Mantap", "Review terkirim!");
    } else {
      Alert.alert("Gagal", "Gagal kirim review. Cek koneksi/API.");
    }
  };

  const bukaModalEditReview = () => {
    if (myReview) {
      setEditReviewName(myReview.reviewer_name);
      setEditReviewRating(myReview.rating.toString());
      setEditReviewComment(myReview.comment);
      setModalReviewVisible(true);
    }
  };

  const handleSimpanEditReview = async () => {
    const angkaRating = parseFloat(editReviewRating);
    if (angkaRating < 1 || angkaRating > 10) return Alert.alert("Error", "Rating 1-10!");
    
    setLoadingEdit(true);
    const success = await updateReview(myReview.id, editReviewName, angkaRating, editReviewComment);
    setLoadingEdit(false);

    if (success) {
      setModalReviewVisible(false);
      refreshData();
      Alert.alert("Sukses", "Review diedit!");
    } else {
      Alert.alert("Gagal", "Gagal edit review.");
    }
  };

  // 👇 Handle Loading Screen AGAR TIDAK MUNCUL [id]
  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'}}>
        {/* Paksa judul jadi 'Sedang Memuat...' saat loading */}
        <Stack.Screen options={{ 
            title: 'Sedang Memuat...', 
            headerTintColor: '#000',
            headerStyle: { backgroundColor: '#fff' }
        }} />
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Jika film tidak ditemukan setelah loading selesai
  if (!movie) {
     return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
           <Stack.Screen options={{ title: 'Film Tidak Ditemukan' }} />
           <Text>Film ga ketemu</Text>
        </View>
     );
  }

  // --- RENDER UTAMA (SETELAH DATA ADA) ---
  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      
      {/* Header Judul Film Asli */}
      <Stack.Screen options={{ 
          title: movie.title, 
          headerTintColor: '#000',
          headerStyle: { backgroundColor: '#fff' }
      }} />

      {movie && (
        <>
          {/* 👇 Ganti resizeMode jadi COVER biar full screen cantik */}
          <Image source={{ uri: movie.poster }} style={styles.poster} resizeMode="cover" />
          
          <View style={styles.sectionFilm}>
            <Text style={styles.judul}>{movie.title}</Text>
            <Text style={{color: '#666', marginBottom: 10, fontSize: 16}}>Tahun: {movie.release_year}</Text>
            <Text style={{lineHeight: 22}}>{movie.description}</Text>

            {/* Tombol Edit/Hapus Film (Owner Only) */}
            {isOwner && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={bukaModalEditFilm} style={[styles.btnAction, {backgroundColor: '#FFA500'}]}>
                        <Text style={styles.btnText}>Edit Film</Text>
                    </TouchableOpacity>
                    <View style={{width: 10}} /> 
                    <TouchableOpacity onPress={handleHapus} style={[styles.btnAction, {backgroundColor: '#FF3B30'}]}>
                        <Text style={styles.btnText}>Hapus Film</Text>
                    </TouchableOpacity>
                </View>
            )}
          </View>
        </>
      )}

      <View style={styles.sectionForm}>
        <Text style={styles.header}>✍️ ULASAN KAMU</Text>
        
        {myReview ? (
          <View style={styles.myReviewCard}>
             <Text style={{textAlign: 'center', marginBottom: 10, color: '#007AFF', fontWeight: 'bold'}}>
                ✅ Kamu sudah mereview film ini
             </Text>
             <Text style={{fontWeight: 'bold'}}>Nama: {myReview.reviewer_name}</Text>
             <Text>Rating: {myReview.rating}/10 ⭐</Text>
             <Text style={{fontStyle: 'italic', marginVertical: 5}}>"{myReview.comment}"</Text>
             
             <TouchableOpacity onPress={bukaModalEditReview} style={styles.btnEditReview}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>EDIT REVIEW SAYA</Text>
             </TouchableOpacity>
          </View>
        ) : (
          /* Form Input Review */
          <>
            <TextInput placeholder="Nama Kamu" placeholderTextColor="#999" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="Rating (1-10)" placeholderTextColor="#999" keyboardType="numeric" maxLength={2} style={styles.input} value={rating} onChangeText={setRating} />
            <TextInput placeholder="Komentar kamu..." placeholderTextColor="#999" style={[styles.input, {height: 80}]} multiline value={comment} onChangeText={setComment} textAlignVertical="top" />
            
            {/* 👇 TOMBOL KIRIM DENGAN BUFFERING */}
            <TouchableOpacity 
                style={[styles.btnPrimary, { opacity: loadingReview ? 0.7 : 1 }]} 
                onPress={handleKirimReview}
                disabled={loadingReview} // Matikan tombol saat loading
            >
                {loadingReview ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.btnText}>KIRIM REVIEW</Text>
                )}
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.sectionList}>
        <Text style={styles.header}>💬 KOMENTAR ORANG LAIN</Text>
        {reviews.length === 0 ? <Text style={{textAlign: 'center', color: '#666', marginTop: 10}}>Belum ada review.</Text> : 
            reviews.map((rev, i) => (
            <View key={i} style={styles.cardReview}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5}}>
                    <Text style={{fontWeight: 'bold', fontSize: 16}}>{rev.reviewer_name}</Text>
                    {rev.device_id === myReview?.device_id && rev.id === myReview?.id && <Text style={{color: '#007AFF', fontSize: 12, fontWeight:'bold'}}>(Saya)</Text>}
                </View>
                <View style={{flexDirection:'row', marginBottom: 5}}>
                     <Text style={{color: '#F1C40F', fontWeight:'bold'}}>⭐ {rev.rating}/10</Text>
                </View>
                <Text style={{fontStyle: 'italic', color: '#333'}}>"{rev.comment}"</Text>
            </View>
            ))
        }
      </View>
      <View style={{height: 50}} />

      {/* --- MODAL EDIT FILM --- */}
      <Modal animationType="slide" transparent={true} visible={modalFilmVisible} onRequestClose={() => setModalFilmVisible(false)}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.header}>Edit Film</Text>
                <Text style={styles.label}>Judul</Text>
                <TextInput style={styles.input} value={editTitle} onChangeText={setEditTitle} placeholderTextColor="#888" />
                <Text style={styles.label}>Tahun</Text>
                <TextInput style={styles.input} value={editYear} onChangeText={setEditYear} keyboardType='numeric' placeholderTextColor="#888" />
                <Text style={styles.label}>URL Poster</Text>
                <TextInput style={styles.input} value={editPoster} onChangeText={setEditPoster} placeholderTextColor="#888" />
                <Text style={styles.label}>Sinopsis</Text>
                <TextInput style={[styles.input, {height: 80}]} multiline value={editDesc} onChangeText={setEditDesc} placeholderTextColor="#888" />
                
                <View style={{marginTop: 10}}>
                    {loadingEdit ? (
                        <ActivityIndicator size="large" color="#007AFF" />
                    ) : (
                        <Button title="SIMPAN PERUBAHAN" onPress={handleSimpanEditFilm} color="#007AFF"/>
                    )}
                    <View style={{height: 10}} />
                    <Button title="BATAL" color="#FF3B30" onPress={() => setModalFilmVisible(false)} />
                </View>
            </View>
         </View>
      </Modal>

      {/* --- MODAL EDIT REVIEW --- */}
      <Modal animationType="slide" transparent={true} visible={modalReviewVisible} onRequestClose={() => setModalReviewVisible(false)}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.header}>✏️ Edit Review Kamu</Text>
                <Text style={styles.label}>Nama</Text>
                <TextInput style={styles.input} value={editReviewName} onChangeText={setEditReviewName} placeholderTextColor="#888" />
                <Text style={styles.label}>Rating (1-10)</Text>
                <TextInput style={styles.input} value={editReviewRating} onChangeText={setEditReviewRating} keyboardType='numeric' placeholderTextColor="#888" />
                <Text style={styles.label}>Komentar</Text>
                <TextInput style={[styles.input, {height: 60}]} multiline value={editReviewComment} onChangeText={setEditReviewComment} placeholderTextColor="#888" />
                
                <View style={{marginTop: 10}}>
                   {loadingEdit ? <ActivityIndicator color="#007AFF" /> : <Button title="UPDATE REVIEW" onPress={handleSimpanEditReview} color="#007AFF" />}
                   <View style={{height: 10}} />
                   <Button title="BATAL" color="#FF3B30" onPress={() => setModalReviewVisible(false)} />
                </View>
            </View>
         </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  // 👇 Ganti jadi COVER biar rapi full width
  poster: { width: '100%', height: 450, resizeMode: 'cover', backgroundColor: '#eee' },
  sectionFilm: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  judul: { fontSize: 26, fontWeight: 'bold', color: '#000', marginBottom: 5 },
  
  actionButtons: { flexDirection: 'row', marginTop: 20 },
  btnAction: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  
  sectionForm: { padding: 20, backgroundColor: '#F0F8FF', margin: 15, borderRadius: 12 }, // AliceBlue background
  myReviewCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#007AFF' },
  btnEditReview: { marginTop: 15, backgroundColor: '#FFA500', padding: 10, borderRadius: 5, alignItems: 'center' },
  
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#007AFF' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd', color: '#000', fontSize: 16 },
  
  btnPrimary: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  sectionList: { padding: 20 },
  cardReview: { backgroundColor: '#fff', padding: 15, marginBottom: 15, borderRadius: 10, elevation: 2, shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.1, shadowRadius: 4 },
  
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 25, borderRadius: 15, elevation: 5 },
  label: { fontWeight: 'bold', marginTop: 5, marginBottom: 5, color: '#333' }
});