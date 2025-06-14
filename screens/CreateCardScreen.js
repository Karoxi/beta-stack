import React, { useState } from 'react';
import { View, Image, Pressable, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { insertCard } from '../database';

export default function NewCardScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false, // Zuschneiden entfernt
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim() && !notes.trim() && !image) {
      Alert.alert('Empty card', 'Please fill in at least one field.');
      return;
    }

    try {
      await insertCard(title.trim(), notes.trim(), image);
      Alert.alert('Saved!', 'Your card has been saved.');
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
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>Select an image</Text>
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
        multiline={true}
        numberOfLines={6}
      />

      <Button title="Save Card" onPress={handleSave} />
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
});

