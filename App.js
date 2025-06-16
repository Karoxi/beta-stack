import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import CardFormScreen from './screens/CardFormScreen';
import CardDetailsScreen from './screens/CardDetailsScreen';
import { initDB } from './database';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    initDB()
      .then(() => {
        console.log('Database initialized');
        setDbInitialized(true);
      })
      .catch(err => {
        console.log('DB Error:', err);
      });
  }, []);

  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="BetaStack">
        <Stack.Screen
          name="BetaStack"
          component={HomeScreen}
          options={{ title: 'My Projects' }}
        />
        <Stack.Screen
          name="CardDetails"
          component={CardDetailsScreen}
          options={{ title: 'Project Details' }}
        />
        <Stack.Screen
          name="CardForm"
          component={CardFormScreen}
          options={{ title: 'Project Manager' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
