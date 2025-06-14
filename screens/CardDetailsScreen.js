import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, Button } from 'react-native';
import { fetchCardById } from '../database';

export default function CardDetailScreen({ route, navigation }) {
  const { cardId } = route.params;
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCard = async () => {
      try {
        const data = await fetchCardById(cardId);
        setCard(data);
      } catch (err) {
        console.error('Failed to load card:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCard();
  }, [cardId]);

  // Header-Button setzen, wenn Karte geladen ist
  useEffect(() => {
    if (card) {
      navigation.setOptions({
        headerRight: () => (
          <Button
            title="Edit"
            onPress={() => navigation.navigate('EditCard', { cardId: card.id })}
          />
        ),
      });
    }
  }, [navigation, card]);

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
      {card.imageUri ? (
        <Image source={{ uri: card.imageUri }} style={styles.image} resizeMode="contain" />
      ) : null}
      <Text style={styles.title}>{card.title || 'No title'}</Text>
      <Text style={styles.notes}>{card.notes || 'No notes'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    borderRadius: 8,
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
});
