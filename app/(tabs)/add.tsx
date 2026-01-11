import { addMovie } from '@/services/api';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TambahScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State buat nampung input user
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [desc, setDesc] = useState('');
  const [poster, setPoster] = useState('');

  const handleSimpan = async () => {
    // Validasi input kosong
    if (!title || !year || !desc || !poster) {
      Alert.alert("Eits!", "Semua kolom wajib diisi ya brow.");
      return;
    }

    setLoading(true); // Disable tombol pas loading

    const success = await addMovie({
      title: title,
      release_year: parseInt(year),
      description: desc,
      poster: poster
    });

    setLoading(false);

    if (success) {
      Alert.alert("Berhasil!", "Film baru udah masuk database.");
      setTitle(''); setYear(''); setDesc(''); setPoster('');
      router.push('/(tabs)'); 
    } else {
      Alert.alert("Gagal", "Cek koneksi internet atau API Xano kamu.");
    }
  };

  return (
    // Handle keyboard biar ga nutupin input
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#fff' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.header}>🎬 Tambah Film Baru</Text>

        <Text style={styles.label}>Judul Film</Text>
        <TextInput style={styles.input} placeholder="Contoh: Avengers Endgame" placeholderTextColor="#999" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Tahun Rilis</Text>
        <TextInput style={styles.input} placeholder="Contoh: 2019" placeholderTextColor="#999" keyboardType="numeric" value={year} onChangeText={setYear} />

        <Text style={styles.label}>Link Poster (URL)</Text>
        <TextInput style={styles.input} placeholder="https://..." placeholderTextColor="#999" value={poster} onChangeText={setPoster} autoCapitalize="none" />
        <Text style={styles.hint}>*Tips: Cari gambar di Google, Klik Kanan/Tahan, pilih 'Copy Image Address'</Text>

        <Text style={styles.label}>Sinopsis</Text>
        <TextInput 
            style={[styles.input, { height: 120 }]} 
            placeholder="Ceritakan sedikit tentang filmnya..." 
            placeholderTextColor="#999"
            multiline 
            textAlignVertical="top" 
            value={desc} 
            onChangeText={setDesc} 
        />

        <View style={{ marginTop: 30 }}>
          {/* Tombol disable pas loading biar ga double submit */}
          <TouchableOpacity 
            style={[styles.btnSimpan, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleSimpan}
            disabled={loading}
          >
             {loading ? (
                <ActivityIndicator color="#fff" />
             ) : (
                <Text style={styles.btnText}>SIMPAN FILM</Text>
             )}
          </TouchableOpacity>
        </View>
        
        <View style={{height: 100}} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: '#fff' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 25, textAlign: 'center', marginTop: 10, color: '#007AFF' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 15, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, fontSize: 16, backgroundColor: '#f9f9f9', color: '#000' },
  hint: { fontSize: 13, color: '#666', marginBottom: 5, fontStyle: 'italic', marginTop: 5 },
  
  btnSimpan: { backgroundColor: '#007AFF', padding: 16, borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});