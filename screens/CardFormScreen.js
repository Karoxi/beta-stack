import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, Button, Image, Pressable, FlatList, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { insertCard, updateCard, fetchCardById, deleteCard } from '../database';

export default function CardFormScreen({ navigation, route }) {
  const cardId = route.params?.cardId || null;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [extraMedia, setExtraMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cardId) return;
    setLoading(true);
    fetchCardById(cardId)
      .then(card => {
        if (card) {
          setTitle(card.title || '');
          setNotes(card.notes || '');
          setImage(card.imageUri || null);

          let extras = [];
          try {
            extras = typeof card.extraMediaUris === 'string'
              ? JSON.parse(card.extraMediaUris)
              : card.extraMediaUris || [];
          } catch {
            extras = [];
          }
          setExtraMedia(extras);
        }
      })
      .catch(() => Alert.alert('Fehler', 'Karte konnte nicht geladen werden.'))
      .finally(() => setLoading(false));
  }, [cardId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        cardId ? (
          <Button
            title="Delete"
            color="red"
            onPress={() => {
              Alert.alert(
                'confirm delete',
                'Are you sure you want to delete this projekt?',
                [
                  { text: 'cancel', style: 'cancel' },
                  {
                    text: 'delete',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await deleteCard(cardId);
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'BetaStack' }],
                          });

                      } catch {
                        Alert.alert('Error', 'delete failed');
                      }
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
          />
        ) : null,
    });
  }, [navigation, cardId]);

  const pickMainImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickExtraMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled) {
      setExtraMedia(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeExtraMedia = (uriToRemove) => {
    setExtraMedia(prev => prev.filter(uri => uri !== uriToRemove));
  };

  const removeMainImage = () => setImage(null);

const handleSave = async () => {
  if (!title.trim() && !notes.trim() && !image && extraMedia.length === 0) {
    Alert.alert('Error', 'Please enter at least a title or main image');
    return;
  }

  try {
    if (cardId) {
      await updateCard(cardId, title.trim(), notes.trim(), image, JSON.stringify(extraMedia));
      // Nach Edit zurück zu Details (replace, damit Back-Pfeil sauber bleibt)
      navigation.goBack();

    } else {
      const newId = await insertCard(title.trim(), notes.trim(), image, JSON.stringify(extraMedia));
      // Nach Create zurück zu Home (BetaStack)
      navigation.reset({
  index: 0,
  routes: [{ name: 'BetaStack' }],
});

    }
  } catch {
    Alert.alert('Error', 'Card could not be saved');
  }
};


  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Lade Karte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={pickMainImage} style={{ marginVertical: 10 }}>
        {image ? (
          <View>
            <Image source={{ uri: image }} style={styles.mainImage} resizeMode="contain" />
            <Button title="Delete main image" onPress={removeMainImage} color="red" />
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>Select main image</Text>
          </View>
        )}
      </Pressable>

      <Text style={styles.label}>Additional images</Text>
      <FlatList
        horizontal
        data={extraMedia}
        keyExtractor={(item) => item}
        style={{ maxHeight: 110 }}
        renderItem={({ item }) => (
          <View style={styles.extraImageContainer}>
            <Image source={{ uri: item }} style={styles.extraImage} resizeMode="cover" />
            <Pressable
              style={styles.removeButton}
              onPress={() => removeExtraMedia(item)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>X</Text>
            </Pressable>
          </View>
        )}
        ListFooterComponent={() => (
          <Pressable
            style={[styles.extraImageContainer, styles.addExtraButton]}
            onPress={pickExtraMedia}
          >
            <Text style={{ fontSize: 30, color: '#666' }}>+</Text>
          </Pressable>
        )}
        showsHorizontalScrollIndicator={false}
      />

      <Text style={styles.label}>Titel</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Notizen</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <View style={{ marginTop: 30 }}>
        <Button
          title={cardId ? 'Save' : 'Create Projekt'}
          onPress={handleSave}
        />
      </View>

      <View style={{ marginTop: 10 }}>
        <Button
          title="Cancel"
          color="#888"
          onPress={() => navigation.goBack()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontWeight: 'bold', marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  mainImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  extraImageContainer: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: 'rgba(255,0,0,0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  addExtraButton: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
