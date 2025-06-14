import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { fetchCardById, updateCard, deleteCard } from '../database';
import { Video } from 'expo-av';

export default function EditCardScreen({ route, navigation }) {
  const { cardId } = route.params;
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [extraMedia, setExtraMedia] = useState([]);
  const [videoHeights, setVideoHeights] = useState({});

  useEffect(() => {
    async function loadCard() {
      try {
        const card = await fetchCardById(cardId);
        if (card) {
          setTitle(card.title);
          setNotes(card.notes);
          setImageUri(card.imageUri);
          // Parse extraMedia JSON-String aus DB (wie in DetailScreen)
          let media = [];
          if (card.extraMedia) {
            try {
              media = JSON.parse(card.extraMedia);
            } catch {
              media = [];
            }
          }
          setExtraMedia(Array.isArray(media) ? media : []);
        }
      } catch (err) {
        console.error('Failed to load card:', err);
      }
    }
    loadCard();
  }, [cardId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button title="X" onPress={() => navigation.goBack()} />,
    });
  }, [navigation]);

  // Hauptbild auswählen
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Mehrere Medien auswählen
  const pickExtraMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const newUris = result.assets.map(a => a.uri);
      setExtraMedia(prev => [...prev, ...newUris]);
    }
  };

  // Einzelnes extraMedium entfernen
  const removeExtraMedia = (uriToRemove) => {
    setExtraMedia(prev => prev.filter(uri => uri !== uriToRemove));
  };

  // Video lädt, Höhe berechnen für bessere Darstellung
  const onVideoLoad = (idx, status) => {
    if (
      status.naturalSize &&
      status.naturalSize.width > 0 &&
      status.naturalSize.height > 0
    ) {
      const ratio = status.naturalSize.height / status.naturalSize.width;
      const videoWidth = 300; // feste Breite für Thumbs
      const videoHeight = videoWidth * ratio;
      setVideoHeights(prev => ({ ...prev, [idx]: videoHeight }));
    } else {
      setVideoHeights(prev => ({ ...prev, [idx]: 200 }));
    }
  };

  // Hauptbild löschen mit Bestätigung
  const removeMainImage = () => {
    Alert.alert(
      'Remove main image',
      'Are you sure you want to remove the main image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => setImageUri(null) },
      ]
    );
  };

  // Speichern inkl. extraMedia JSON-stringify
  const handleSave = async () => {
    if (!title.trim() && !imageUri) {
      Alert.alert('Fehler', 'Bitte mindestens einen Titel oder ein Bild auswählen.');
      return;
    }
    try {
      await updateCard(cardId, title.trim(), notes.trim(), imageUri, JSON.stringify(extraMedia));
      navigation.navigate('CardDetails', { cardId });
    } catch (err) {
      Alert.alert('Error', 'Could not save changes.');
      console.error(err);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCard(cardId);
              navigation.navigate('BetaStack');
            } catch (err) {
              Alert.alert('Error', 'Could not delete card.');
              console.error(err);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Main Image</Text>
      <View style={{ marginVertical: 10 }}>
        <Pressable onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text>Select main image</Text>
            </View>
          )}
        </Pressable>
        {imageUri && <Button title="Remove main image" color="red" onPress={removeMainImage} />}
      </View>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes"
        multiline
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Add more images or videos" onPress={pickExtraMedia} />
        {extraMedia.length > 0 && (
          <ScrollView horizontal style={{ marginTop: 10 }}>
            {extraMedia.map((uri, idx) => {
              if (uri.endsWith('.mp4')) {
                return (
                  <View key={idx} style={styles.extraMediaWrapper}>
                    <Video
                      source={{ uri }}
                      style={{ width: 300, height: videoHeights[idx] || 200, borderRadius: 8 }}
                      useNativeControls
                      resizeMode="contain"
                      onLoad={status => onVideoLoad(idx, status)}
                    />
                    <Button title="Remove" color="red" onPress={() => removeExtraMedia(uri)} />
                  </View>
                );
              } else {
                return (
                  <View key={idx} style={styles.extraMediaWrapper}>
                    <Image source={{ uri }} style={styles.thumb} />
                    <Button title="Remove" color="red" onPress={() => removeExtraMedia(uri)} />
                  </View>
                );
              }
            })}
          </ScrollView>
        )}
      </View>

      <View style={{ marginTop: 30 }}>
        <Button title="Save Changes" onPress={handleSave} />
      </View>

      <View style={{ marginTop: 15 }}>
        <Button title="Delete Card" color="red" onPress={handleDelete} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 15,
  },
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
  image: {
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
  thumb: {
    width: 150,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
  extraMediaWrapper: {
    marginRight: 10,
    alignItems: 'center',
  },
});
