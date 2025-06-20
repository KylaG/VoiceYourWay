// App.js
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import MainPage from './MainPage';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <MainPage />
    </SafeAreaView>
  );
}