import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { fetchCardById, updateCard, deleteCard } from '../database';

export default function EditCardScreen({ route, navigation }) {
  const { cardId } = route.params;
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    async function loadCard() {
      try {
        const card = await fetchCardById(cardId);
        if (card) {
          setTitle(card.title);
          setNotes(card.notes);
          setImageUri(card.imageUri);
        }
      } catch (err) {
        console.error('Failed to load card:', err);
      }
    }
    loadCard();
  }, [cardId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title="X" onPress={() => navigation.goBack()} />
      ),
    });
  }, [navigation]);

  const handleSave = async () => {
    try {
      await updateCard(cardId, title.trim(), notes.trim(), imageUri);
      navigation.navigate('CardDetails', { cardId }); // Korrekte Screen-Name und Parameter!
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
              navigation.navigate('BetaStack');  // Hier zu Home wechseln
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
    <View style={styles.container}>
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

      {/* Save Button */}
      <Button title="Save Changes" onPress={handleSave} />

      {/* Delete Button */}
      <View style={{ marginTop: 15 }}>
        <Button title="Delete Card" color="red" onPress={handleDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
});

