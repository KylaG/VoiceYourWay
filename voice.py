from io import BytesIO
import json
import requests
import sounddevice as sd 
import wave
from elevenlabs.client import ElevenLabs
import os
from pprint import pprint
import queue
import threading
import sys
import numpy as np

# set up Eleven Labs API Key
ELEVEN_LABS_KEY = ""
GOOGLE_MAPS_KEY = ""

client = ElevenLabs(api_key=ELEVEN_LABS_KEY)

def main():
    #record_and_transcribe(5)
    record_until_keypress()
    # audio_url = (
    # "https://storage.googleapis.com/eleven-public-cdn/audio/marketing/nicole.mp3"
    # )
    # response = requests.get(audio_url)
    # audio_data = BytesIO(response.content)
    # transcription = elevenlabs.speech_to_text.convert(
    #     file=audio_data,
    #     model_id="scribe_v1", # Model to use, for now only "scribe_v1" is supported
    #     tag_audio_events=True, # Tag audio events like laughter, applause, etc.
    #     language_code="eng", # Language of the audio file. If set to None, the model will detect the language automatically.
    #     diarize=True, # Whether to annotate who is speaking
    # )
    # pprint(transcription.text)

def record_and_transcribe(duration=5):

    RATE = 44100
    CHANNELS = 1

    # Record audio
    print(f"Recording...")
    audio = sd.rec(int(duration * RATE), samplerate=RATE, channels=CHANNELS, dtype='int16')
    sd.wait()  # Wait for recording to finish
    print("Recording complete!")

    # Convert to WAV format in memory
    audio_buffer = BytesIO()
    with wave.open(audio_buffer, 'wb') as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(2)  # 2 bytes for int16
        wf.setframerate(RATE)
        wf.writeframes(audio.tobytes())

     # Reset buffer position
    audio_buffer.seek(0)

    # Send to Eleven Labs
    print("Transcribing...")
    transcription = client.speech_to_text.convert(
        file=audio_buffer,
        model_id="scribe_v1",
        tag_audio_events=True,
        language_code="eng",
        diarize=True,
    )
    
    # Print result
    print("\nTranscription:")
    print(transcription.text)
    
    return transcription


def record_until_keypress():

    RATE = 44100
    CHANNELS = 1
    CHUNK_SIZE = 1024 

    # Thread-safe queue for audio data
    audio_queue = queue.Queue()
    recording = threading.Event()
    recording.set()

    # Callback function for continuous recording
    def audio_callback(indata, frames, time, status):
        if status:
            print(f"Audio callback error: {status}", file=sys.stderr)
        if recording.is_set():
            # Copy the data to avoid memory issues
            audio_queue.put(indata.copy())

    # Input thread to detect Enter key
    def wait_for_enter():
        input()
        recording.clear()

    try:
        
        # Create and start the audio stream
        stream = sd.InputStream(
            callback=audio_callback,
            channels=CHANNELS,
            samplerate=RATE,
            blocksize=CHUNK_SIZE,
            dtype='int16'
        )
        
        # Start the Enter key detection thread
        enter_thread = threading.Thread(target=wait_for_enter, daemon=True)
        enter_thread.start()
        
        # Start recording in a separate thread
        print("Recording... (Press Enter to stop)")
        
        # Start the audio stream
        with stream:
            enter_thread.join()  # Wait for Enter key
        
        print("Recording complete! Processing audio...")
        
        # Collect all audio chunks
        audio_chunks = []
        while not audio_queue.empty():
            try:
                chunk = audio_queue.get_nowait()
                audio_chunks.append(chunk)
            except queue.Empty:
                break
        
        if not audio_chunks:
            raise ValueError("No audio data recorded")
        
        # Concatenate all chunks
        audio_data = np.concatenate(audio_chunks, axis=0)
        
        # Convert to WAV format in memory
        audio_buffer = BytesIO()
        with wave.open(audio_buffer, 'wb') as wf:
            wf.setnchannels(CHANNELS)
            wf.setsampwidth(2)  # 2 bytes for int16
            wf.setframerate(RATE)
            wf.writeframes(audio_data.tobytes())
        
        audio_buffer.seek(0)
        
        # Send to Eleven Labs
        print("Transcribing...")
        transcription = client.speech_to_text.convert(
            file=audio_buffer,
            model_id="scribe_v1",
            tag_audio_events=True,
            language_code="eng",
            diarize=True,
        )
        
        print("\nTranscription:")
        print(transcription.text)
        
        return transcription
    
    except Exception as e:
        print(f"Error during recording: {e}", file=sys.stderr)
        raise
    finally:
        # Ensure stream is properly closed
        if 'stream' in locals() and stream.active:
            stream.stop()
    
if __name__ == '__main__':
    main()