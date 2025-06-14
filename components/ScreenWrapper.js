import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

export default function ScreenWrapper({ children }) {
  return (
    <ImageBackground
      source={require('../assets/background.jpg')} // Pfad zu deinem Bild anpassen
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)', // Leicht transparente weiße Schicht, damit Text besser lesbar ist
    padding: 20,
  },
});
