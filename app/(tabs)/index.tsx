import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getMovies } from '@/services/api';
import { Movie } from '@/types';

export default function HomeScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const ambilData = async () => {
    const data = await getMovies();
    setMovies(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await ambilData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      ambilData();
    }, [])
  );

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'}}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{marginTop: 10, color: '#666'}}>Memuat Film...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header dengan warna Biru Logo ReFilm */}
      <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>🍿 ReFilm</Text>
          <Text style={styles.headerSubtitle}>Koleksi & Review Film</Text>
      </View>
      
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />
        }
        renderItem={({ item }) => (
          <Link href={`/${item.id}`} asChild>
            <TouchableOpacity style={styles.card}>
               <Image 
                  source={{ uri: item.poster ? item.poster : 'https://via.placeholder.com/150' }} 
                  style={styles.poster} 
                  resizeMode="cover"
               />
               <View style={styles.cardInfo}>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.year}>{item.release_year}</Text>
               </View>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 50, color: '#666'}}>Belum ada film brow.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, paddingTop: 10, backgroundColor: '#FFFFFF' },
  
  headerContainer: { marginTop: 10, marginBottom: 20, alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#007AFF', letterSpacing: 1 },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 2 },

  card: { width: '48%', marginBottom: 20, backgroundColor: '#fff', borderRadius: 12, elevation: 4, shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.1, shadowRadius: 4 },
  poster: { width: '100%', height: 220, borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: '#f0f0f0' },
  cardInfo: { padding: 10 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  year: { fontSize: 14, color: '#888' }
});