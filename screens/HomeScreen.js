import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { fetchCards } from '../database';
import ScreenWrapper from '../components/ScreenWrapper';

export default function HomeScreen({ navigation }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCards = async () => {
    
    try {
      const data = await fetchCards();
      setCards(data);
    } catch (err) {
      console.error('Failed to load cards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCards();
    });
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CardDetails', { cardId: item.id })}
    >
      {item.imageUri ? (
        <Image
          source={{ uri: item.imageUri }}
          style={styles.cardImage}
          resizeMode="contain"
        />
      ) : null}
      <Text style={styles.title}>{item.title || 'No title'}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <Button title="Create New Card" onPress={() => navigation.navigate('CardForm')} />
      {loading ? (
        <Text>Loading cards...</Text>
      ) : cards.length === 0 ? (
        <Text>No cards found.</Text>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  cardImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
  },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  notes: { color: '#555' },
});


