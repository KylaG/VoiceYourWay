import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export default {
  expo: {
    name: "VoiceYourWay",
    slug: "voice-your-way",
    version: "1.0.0",
    platforms: ["ios", "android"],
    ios: {
      bundleIdentifier: "com.yourcompany.voiceyourway",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Voice Your Way needs location access to provide location-based features."
      }
    },
    android: {
      package: "com.yourcompany.voiceyourway"
    },
    extra: {
      elevenLabsApiKey: process.env.ELEVEN_LABS_API_KEY,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    }
  }
};