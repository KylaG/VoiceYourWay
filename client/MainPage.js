import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

// const ELEVEN_LABS_API_KEY = process.env.REACT_APP_ELEVEN_LABS_API_KEY;
const ELEVEN_LABS_API_KEY = Constants.expoConfig?.extra?.elevenLabsApiKey;
console.log('ElevenLabs API Key:', ELEVEN_LABS_API_KEY ? 'Loaded' : 'Missing');


// Continuous Location Fetch
// TaskManager.defineTask(LOCATION_TASK_NAME, async ({data, error}) => {
//   if (error) {
//     console.error('Background location error: ', error);
//   }
//   if (data){
//     const { locations } = data;
//     console.log('Background location update: ', locations[0]);
//   }
// });

export default function MainPage() {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');

    useEffect(() => {
    (async () => {
      // Request permission and get location once
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      // Get current location
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      console.log('User location:', currentLocation.coords);

      // Get location name using reverse geocoding
      try {
        let reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        
        if (reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          const cityName = address.city || address.subregion || address.region || 'Unknown location';
          setLocationName(`${cityName}, ${address.region || ''}`);
        }
      } catch (error) {
        console.error('Error getting location name:', error);
        setLocationName('Location unavailable');
      }
    })();
  }, []);

  async function startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setIsRecording(false);
    setIsTranscribing(true);
    setTranscriptionText('');
    
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);

      // Get the audio file as a blob
      const response = await fetch(uri);
      const audioBlob = await response.blob();

      // Create FormData for the API request
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'audio/wav',
        name: 'recording.wav'
      });
      formData.append('model_id', 'scribe_v1');
      formData.append('tag_audio_events', 'true');
      formData.append('language_code', 'eng');
      formData.append('diarize', 'true');

      // Send to ElevenLabs API
      const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_LABS_API_KEY,
        },
        body: formData,
      });

      if (!elevenLabsResponse.ok) {
        throw new Error(`API request failed: ${elevenLabsResponse.status}`);
      }

      const transcriptionData = await elevenLabsResponse.json();
      setTranscriptionText(transcriptionData.text || 'No transcription available');
    } catch (error) {
      console.error('Error during transcription:', error);
      setTranscriptionText('Error during transcription. Please try again.');
    } finally {
      setRecording(null);
      setIsTranscribing(false);
    }
  }

  const handleButtonPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Voice Your Way</Text>

      
      {/* Location display */}
      {locationName && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationTitle}>📍 Current Location</Text>
          <Text style={styles.locationText}>{locationName}</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recordingButton]}
        onPress={handleButtonPress}
        disabled={isTranscribing}
      >
        {isTranscribing ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <Text style={styles.buttonText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        )}
      </TouchableOpacity>

      {isRecording && (
        <Text style={styles.recordingIndicator}>Recording in progress...</Text>
      )}

      {transcriptionText !== '' && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionTitle}>Transcription:</Text>
          <Text style={styles.transcriptionText}>{transcriptionText}</Text>
        </View>
      )}

        <View style={styles.inputContainer}>
          <Text style={styles.inputTitle}>Backend Input:</Text>
          <Text style={styles.inputText}>Awaiting input...</Text>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  container: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 50,
    color: '#333',
  },
  recordButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  recordingIndicator: {
    marginTop: 20,
    fontSize: 16,
    color: '#FF3B30',
    fontStyle: 'italic',
  },
  transcriptionContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  transcriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  transcriptionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  locationContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  locationText: {
    fontSize: 16,
    color: '#555',
  },
  inputContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  inputText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
});