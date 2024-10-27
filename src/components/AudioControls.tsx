import React, { useState } from 'react';
import styles from '../styles/AudioControls.module.css';

export interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  duration: number;
  currentTime: number;
  onTimeUpdate: (value: number) => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  onSkip: (seconds: number) => void;
  onSpeedChange: (speed: number) => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlayPause,
  duration,
  currentTime,
  onTimeUpdate,
  volume,
  onVolumeChange,
  onSkip,
  onSpeedChange,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    const formattedTime = [
      hours > 0 ? hours : null,
      hours > 0 ? String(minutes).padStart(2, '0') : minutes,
      String(seconds).padStart(2, '0'),
    ]
      .filter((unit) => unit !== null)
      .join(':');

    return formattedTime;
  };

  const handlePlayPause = () => {
    onPlayPause();
  };

  const handleTimeUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      onTimeUpdate(value);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      onVolumeChange(value);
      setIsMuted(value === 0);
    }
  };

  const handleMuteToggle = () => {
    const newVolume = isMuted ? (volume || 0.5) : 0;
    onVolumeChange(newVolume);
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const speed = Number(e.target.value);
    setPlaybackSpeed(speed);
    onSpeedChange(speed);
  };

  return (
    <div className={styles.audioControls}>
      <button
        onClick={() => onSkip(-10)}
        aria-label="Skip backward 10 seconds"
        className={styles.skipButton}
      >
        ⏪
      </button>

      <button
        onClick={handlePlayPause}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className={styles.playPauseButton}
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>

      <button
        onClick={() => onSkip(10)}
        aria-label="Skip forward 10 seconds"
        className={styles.skipButton}
      >
        ⏩
      </button>

      <div className={styles.timeDisplay}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      <label htmlFor="seek" className={styles.srOnly}>
        Progress:
      </label>
      <input
        id="seek"
        type="range"
        min={0}
        max={duration}
        value={currentTime}
        onChange={handleTimeUpdate}
        className={styles.seekBar}
        aria-label="Seek"
      />

      <button
        onClick={handleMuteToggle}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        className={styles.muteButton}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      <label htmlFor="volume" className={styles.srOnly}>
        Volume:
      </label>
      <input
        id="volume"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={isMuted ? 0 : volume}
        onChange={handleVolumeChange}
        className={styles.volumeControl}
        aria-label="Volume"
      />

      <label htmlFor="speed" className={styles.srOnly}>
        Playback Speed:
      </label>
      <select
        id="speed"
        value={playbackSpeed}
        onChange={handleSpeedChange}
        className={styles.speedControl}
        aria-label="Playback Speed"
      >
        <option value={0.5}>0.5x</option>
        <option value={0.75}>0.75x</option>
        <option value={1}>1x</option>
        <option value={1.25}>1.25x</option>
        <option value={1.5}>1.5x</option>
        <option value={2}>2x</option>
      </select>
    </div>
  );
};

export default AudioControls;
