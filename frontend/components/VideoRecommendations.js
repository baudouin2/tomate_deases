import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Alert } from 'react-native';
import { fetchVideoRecommendations } from '../services/api';
import { useAppContext } from '../contexts/AppContext';
import { WebView } from 'react-native-webview';
import { lightTheme, darkTheme } from '../contexts/AppContext'; // Importation des thèmes

const ONE_HOUR =  1 * 10 * 1000;
const QUERIES = [
  '"tomate: culture " (Cameroun OR Afrique)',
  '"tomate: mildiou tomate" (Cameroun OR Afrique)',
  '"tomate: brulure precoces tomate" (Cameroun OR Afrique)',
  '"tomate: deformation jaune tomate" (Cameroun OR Afrique)',
  '"tomate: mosaique tomate" (Cameroun OR Afrique)',
  '"tomate: tout sur la tomate" (Cameroun OR Afrique)',
];

const VideoRecommendations = () => {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const { theme, setIsLoading, isLoading } = useAppContext();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const loadVideos = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && lastFetchTime && now - lastFetchTime < ONE_HOUR) {
      Alert.alert("⏳ Patience !", "Vous devez attendre avant de recharger les vidéos.");
      return;
    }

    try {
      setIsLoading(true);
      const randomQuery = QUERIES[Math.floor(Math.random() * QUERIES.length)];
      console.log(`🔎 Requête envoyée : ${randomQuery}`);
      const response = await fetchVideoRecommendations(randomQuery, page);
      if (Array.isArray(response.videos)) {
        setVideos(response.videos);
        setLastFetchTime(now);
      } else {
        console.error('Réponse inattendue :', response);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des vidéos :', error);
      Alert.alert("Erreur", "Impossible de charger les vidéos.");
    } finally {
      setIsLoading(false);
    }
  }, [page, lastFetchTime, setIsLoading]);

  useEffect(() => {
    loadVideos();
  }, []);

  const handleVideoClick = (videoUrl) => {
    const youtubeUrl = convertApiUrlToYoutube(videoUrl);
    if (youtubeUrl) setSelectedVideo(youtubeUrl);
  };

  const convertApiUrlToYoutube = (apiUrl) => {
    if (!apiUrl) return null;
    const videoIdMatch = apiUrl.match(/[?&]v=([^&]+)/);
    return videoIdMatch ? `https://www.youtube.com/watch?v=${videoIdMatch[1]}` : null;
  };

  const renderVideoItem = ({ item }) => (
    <View style={styles.videoContainer}>
      <TouchableOpacity onPress={() => handleVideoClick(item.url)} style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: item.thumbnail || 'https://via.placeholder.com/200' }}
          style={styles.thumbnail} 
          resizeMode="cover"
        />
        <View style={styles.playButtonContainer}>
          <Text style={styles.playButtonText}>▶</Text>
        </View>
        <Text style={[styles.videoTitle, { color: currentTheme.text }]}>{item.title || 'Titre inconnu'}</Text>
      </TouchableOpacity>
    </View>
  );

  const styles = useMemo(() => StyleSheet.create({
    title: { 
      fontSize: 20, 
      fontWeight: 'bold', 
      margin: 10, 
      textAlign: 'center', 
      color: currentTheme.text 
    },
    videoContainer: { 
      margin: 10, 
      alignItems: 'center',
      backgroundColor: currentTheme.cardBackground,
      borderRadius: 8, 
      padding: 10 
    },
    thumbnailContainer: { 
      position: 'relative' 
    },
    thumbnail: { 
      width: 300, 
      height: 200, 
      borderRadius: 10 
    },
    playButtonContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -15 }, { translateY: -15 }], 
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 30,
      width: 30,
      height: 30, 
      alignItems: 'center',
      justifyContent: 'center',
    },
    playButtonText: { 
      color: '#fff', 
      fontSize: 20 
    },
    videoTitle: { 
      marginTop: 5, 
      fontWeight: '500', 
      fontSize: 16, 
      textAlign: 'center' 
    },
    button: { 
      padding: 12, 
      margin: 10, 
      borderRadius: 5, 
      alignItems: 'center' 
    },
    buttonText: { 
      color: '#fff', 
      fontWeight: 'bold' 
    },
    reloadButton: { 
      backgroundColor: '#007bff' 
    },
    closeButton: { 
      padding: 12, 
      backgroundColor: '#ff0000', 
      alignItems: 'center', 
      position: 'absolute', 
      bottom: 20, 
      alignSelf: 'center',
      width: '90%',
      borderRadius: 8,
    },
    closeButtonText: { 
      color: '#fff', 
      fontWeight: 'bold', 
      textAlign: 'center' 
    },
  }), [currentTheme]);

  return (
    <View style={{ backgroundColor: currentTheme.background, flex: 1 }}>
      <Text style={styles.title}>Vidéos Recommandées</Text>

      <FlatList
        data={videos}
        keyExtractor={(item, index) => item.id ? `video-${item.id}` : `video-${index}`}
        renderItem={renderVideoItem}
        ListEmptyComponent={!isLoading && <Text style={{ textAlign: 'center', color: currentTheme.text }}>Aucune vidéo disponible.</Text>}
      />

      <TouchableOpacity
        style={[styles.button, styles.reloadButton]}
        onPress={() => loadVideos(true)}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Chargement...' : 'Recharger les vidéos'}</Text>
      </TouchableOpacity>

      <Modal
        visible={!!selectedVideo}
        animationType="slide"
        onRequestClose={() => setSelectedVideo(null)}
      >
        <View style={{ flex: 1 }}>
          {selectedVideo ? (
            <WebView
              source={{ uri: selectedVideo }}
              style={{ flex: 1 }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          ) : (
            <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center' }} />
          )}
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedVideo(null)}>
            <Text style={styles.closeButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default VideoRecommendations;
