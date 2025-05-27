// App.js
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';

export default function App() {
  const [count, setCount] = React.useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.main}>
        <Text style={styles.title}>Welcome to Pooj and Kyla's App! 🎉</Text>
        
        <View style={styles.card}>
          <Text style={styles.subtitle}>Counter Demo</Text>
          <Text style={styles.count}>{count}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.decrementButton]} 
              onPress={() => setCount(count - 1)}
            >
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.resetButton]} 
              onPress={() => setCount(0)}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.incrementButton]} 
              onPress={() => setCount(count + 1)}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Getting Started:</Text>
          <Text style={styles.infoText}>• Edit App.js to modify this screen</Text>
          <Text style={styles.infoText}>• Shake your device to open developer menu</Text>
          <Text style={styles.infoText}>• Your changes will auto-reload</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  main: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
    color: '#555',
  },
  count: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 80,
  },
  incrementButton: {
    backgroundColor: '#4CAF50',
  },
  decrementButton: {
    backgroundColor: '#f44336',
  },
  resetButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1976d2',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    lineHeight: 20,
  },
});