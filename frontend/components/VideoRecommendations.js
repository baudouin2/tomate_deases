import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { fetchVideoRecommendations } from '../services/api';
import { useAppContext } from '../contexts/AppContext';
import { lightTheme, darkTheme } from '../util/theme';

const VideoRecommendations = () => {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const { theme, setIsLoading, isLoading } = useAppContext();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const loadVideos = async () => {
    setIsLoading(true);
    const newVideos = await fetchVideoRecommendations('tomates', page);  // Exemple avec 'tomates'
    setVideos((prev) => [...prev, ...newVideos]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadVideos();
  }, [page]);

  return (
    <View style={{ backgroundColor: currentTheme.background, flex: 1 }}>
      <Text style={[styles.title, { color: currentTheme.text }]}>Vidéos Recommandées</Text>

      <FlatList
        data={videos}
        keyExtractor={(item, index) => index.toString()}  // Utilisation de l'index comme clé unique
        renderItem={({ item }) => (
          <View style={styles.videoContainer}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <Text style={{ color: currentTheme.text }}>{item.title}</Text>
          </View>
        )}
        onEndReached={() => setPage((prev) => prev + 1)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoading ? <ActivityIndicator size="large" color={currentTheme.button} /> : null}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: currentTheme.button }]} onPress={() => setPage(page + 1)}>
        <Text style={{ color: '#fff' }}>Charger Plus</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', margin: 10 },
  videoContainer: { margin: 10, alignItems: 'center' },
  thumbnail: { width: '100%', height: 200, borderRadius: 10 },
  button: { padding: 10, margin: 10, borderRadius: 5, alignItems: 'center' },
});

export default VideoRecommendations;
