import React, { useEffect, useState } from 'react'; 
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Button,
  Dimensions,
} from 'react-native';
import { Video } from 'expo-av';
import { fetchCardById } from '../database';

const screenWidth = Dimensions.get('window').width;
const horizontalPadding = 20; // wie in styles.container.padding

export default function CardDetailScreen({ route, navigation }) {
  const { cardId } = route.params;
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoHeights, setVideoHeights] = useState({}); // key: index, value: height

  useEffect(() => {
    const loadCard = async () => {
      try {
        const data = await fetchCardById(cardId);
        const parsedExtra = typeof data.extraMediaUris === 'string'
          ? JSON.parse(data.extraMediaUris)
          : data.extraMediaUris || [];
        setCard({ ...data, extraMediaUris: parsedExtra });
      } catch (err) {
        console.error('Failed to load card:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCard();
  }, [cardId]);

  useEffect(() => {
    if (card) {
      navigation.setOptions({
        headerRight: () => (
          <Button
            title="Edit"
            onPress={() => navigation.navigate('CardForm', { cardId: card.id })}
          />
        ),
      });
    }
  }, [navigation, card]);

  // Video geladen, Größe dynamisch setzen
  const onVideoLoad = (idx, status) => {
    if (
      status.naturalSize &&
      status.naturalSize.width > 0 &&
      status.naturalSize.height > 0
    ) {
      const { width, height } = status.naturalSize;
      const ratio = height / width;
      const videoWidth = screenWidth - horizontalPadding * 2;
      const videoHeight = videoWidth * ratio;
      setVideoHeights(prev => ({ ...prev, [idx]: videoHeight }));
    } else {
      // Fallback-Höhe
      setVideoHeights(prev => ({ ...prev, [idx]: 200 }));
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.center}>
        <Text>Card not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {card.imageUri && (
        <Image
          source={{ uri: card.imageUri }}
          style={[styles.image]}
          resizeMode="contain"
        />
      )}

      <Text style={styles.title}>{card.title || 'No title'}</Text>
      <Text style={styles.notes}>{card.notes || 'No notes'}</Text>

      {card.extraMediaUris?.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.subtitle}>Weitere Medien</Text>
          {/* Vertikaler ScrollView, um Medien untereinander anzuzeigen */}
          <ScrollView showsVerticalScrollIndicator={true} style={{ maxHeight: 400 }}>
            {card.extraMediaUris.map((uri, idx) => {
              if (uri.endsWith('.mp4')) {
                return (
                  <View
                    key={idx}
                    style={[
                      styles.videoContainer,
                      { width: screenWidth - horizontalPadding * 2, height: videoHeights[idx] || 200, marginBottom: 15 },
                    ]}
                  >
                    <Video
                      source={{ uri }}
                      style={{ width: '100%', height: '100%' }}
                      useNativeControls
                      resizeMode="contain"
                      onLoad={status => onVideoLoad(idx, status)}
                    />
                  </View>
                );
              }
              return (
                <Image
                  key={idx}
                  source={{ uri }}
                  style={[styles.thumb, { width: screenWidth - horizontalPadding * 2, height: 200, marginBottom: 15 }]}
                  resizeMode="contain"
                />
              );
            })}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: horizontalPadding,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 10,
  },
  notes: {
    fontSize: 16,
    color: '#444',
  },
  subtitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  thumb: {
    borderRadius: 6,
  },
  videoContainer: {
    borderRadius: 6,
    overflow: 'hidden', // damit keine Controls rausragen
  },
});
