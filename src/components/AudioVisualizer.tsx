import React, { useRef, useState, useEffect } from 'react';
import AudioControls from './AudioControls';
import PastelNeonPulsatingVisualizer from './PastelNeonPulsatingVisualizer';
import styles from '../styles/AudioVisualizer.module.css';

interface AudioVisualizerProps {
  audioSrc: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioSrc }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  console.log('Rendering AudioVisualizer component');

  // useEffect to set up event listeners on component mount
  useEffect(() => {
    console.log('AudioVisualizer component mounted');
    console.log('Initial audio source:', audioSrc);

    const audio = audioRef.current;
    if (!audio) {
      console.error('Audio element not found');
      return;
    }

    console.log('Audio element found on mount');
    console.log('Audio ready state:', audio.readyState);
    console.log('Audio paused state:', audio.paused);

    const setAudioData = () => {
      console.log('loadedmetadata event fired');
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
      console.log('Audio duration:', audio.duration);
      console.log('Can play MP3:', audio.canPlayType('audio/mpeg'));
      console.log('Can play WAV:', audio.canPlayType('audio/wav'));
      console.log('Can play OGG:', audio.canPlayType('audio/ogg'));
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleError = (e: Event) => {
      console.error('Audio error event:', e);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('error', handleError);

    // Initialize volume
    audio.volume = volume;

    return () => {
      console.log('Cleaning up AudioVisualizer component');
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('error', handleError);
      // Do not attempt to close audioContext here
    };
  }, []);

  // New useEffect to clean up audioContext on unmount
  useEffect(() => {
    return () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
        console.log('AudioContext closed');
      }
    };
  }, [audioContext]);

  // useEffect to update audio source and volume when they change
  useEffect(() => {
    console.log('useEffect triggered by audioSrc or volume change');
    console.log('audioSrc value:', audioSrc);
    console.log('volume value:', volume);

    const audio = audioRef.current;
    if (audio) {
      console.log('Audio element found in useEffect');
      console.log('Audio element source before update:', audio.src);
      audio.src = audioSrc;
      audio.volume = volume;
      console.log('Audio element source after update:', audio.src);
      console.log('Audio element volume:', audio.volume);
    } else {
      console.error('Audio element not found in useEffect');
    }
  }, [audioSrc, volume]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) {
      console.error('Audio element not available for playback');
      return;
    }

    console.log('handlePlayPause called');
    console.log('Audio paused state before action:', audio.paused);

    // Create AudioContext and nodes if not already created
    if (!audioContext) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
      console.log('AudioContext created in handlePlayPause');

      // Create MediaElementSource and AnalyserNode
      const sourceNode = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      sourceNode.connect(analyser);
      analyser.connect(context.destination);

      setAnalyserNode(analyser);

      console.log('Audio nodes connected');
    } else if (audioContext.state === 'suspended') {
      audioContext.resume();
      console.log('AudioContext resumed');
    }

    if (audio.paused) {
      audio.play()
        .then(() => {
          console.log('Audio playback started successfully');
          setIsPlaying(true);
          console.log('Audio paused state after play:', audio.paused);
        })
        .catch(error => {
          console.error('Error starting audio playback:', error);
        });
    } else {
      audio.pause();
      console.log('Audio playback paused');
      setIsPlaying(false);
      console.log('Audio paused state after pause:', audio.paused);
    }
  };

  const handleTimeUpdate = (value: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value;
      setCurrentTime(value);
      console.log('Time updated to:', value);
    } else {
      console.error('Audio element not found in handleTimeUpdate');
    }
  };

  const handleVolumeChange = (value: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = value;
      setVolume(value);
      console.log('Volume changed to:', value);
    } else {
      console.error('Audio element not found in handleVolumeChange');
    }
  };

  const handleSkip = (seconds: number) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
      audio.currentTime = newTime;
      console.log(`Skipped ${seconds} seconds to:`, newTime);
    } else {
      console.error('Audio element not found in handleSkip');
    }
  };

  const handleSpeedChange = (speed: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = speed;
      console.log('Playback speed changed to:', speed);
    } else {
      console.error('Audio element not found in handleSpeedChange');
    }
  };

  return (
    <div className={styles.audioVisualizer}>
      <audio ref={audioRef} src={audioSrc} />
      <div className={styles.visualizerContainer}>
        {analyserNode && (
          <PastelNeonPulsatingVisualizer analyserNode={analyserNode} />
        )}
      </div>
      <div className={styles.controlsContainer}>
        <AudioControls
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          duration={duration}
          currentTime={currentTime}
          onTimeUpdate={handleTimeUpdate}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          onSkip={handleSkip}
          onSpeedChange={handleSpeedChange}
        />
      </div>
    </div>
  );
};

export default AudioVisualizer;
