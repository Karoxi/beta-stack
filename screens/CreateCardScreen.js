import React, { useState } from 'react';
import { View, Image, Pressable, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { insertCard } from '../database';

export default function NewCardScreen({ navigation }) {
  const [image, setImage] = useState(null); // Hauptbild
  const [extraMedia, setExtraMedia] = useState([]); // Weitere Bilder/Videos
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const pickImage = async () => {
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
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newUris = result.assets.map(a => a.uri);
      setExtraMedia(prev => [...prev, ...newUris]);
    }
  };

  const handleSave = async () => {
    if (!title.trim() && !image) {
      Alert.alert('Fehler', 'Bitte mindestens einen Titel oder ein Bild auswählen.');
      return;
    }
    try {
      await insertCard(title.trim(), notes.trim(), image, extraMedia);
      navigation.goBack();
    } catch (err) {
      console.error('Saving error:', err);
      Alert.alert('Error', 'Could not save the card.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={pickImage} style={{ marginVertical: 20 }}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>Select main image</Text>
          </View>
        )}
      </Pressable>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter project title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Notes / Beta</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write your learning notes here"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Add more images or videos" onPress={pickExtraMedia} />
        {extraMedia.length > 0 && (
          <ScrollView horizontal style={{ marginTop: 10 }}>
            {extraMedia.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={styles.thumb}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <View style={{ marginTop: 30 }}>
        <Button title="Save Card" onPress={handleSave} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
  thumb: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
});

