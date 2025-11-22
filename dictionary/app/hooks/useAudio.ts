import { useState, useEffect, useRef } from "react";

export function useAudio(url: string) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const play = async () => {
    if (!audioRef.current) {
      setIsLoading(true);
      try {
        const newAudio = new Audio(url);

        // Wait for audio to be ready
        await new Promise((resolve, reject) => {
          newAudio.addEventListener("canplaythrough", resolve, { once: true });
          newAudio.addEventListener("error", reject, { once: true });
          newAudio.load();
        });

        audioRef.current = newAudio;
        setAudio(newAudio);
        setIsLoading(false);

        // Set up event listeners
        newAudio.addEventListener("ended", () => {
          setIsPlaying(false);
        });

        newAudio.addEventListener("pause", () => {
          setIsPlaying(false);
        });

        newAudio.addEventListener("play", () => {
          setIsPlaying(true);
        });

        await newAudio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error loading audio:", error);
        setIsLoading(false);
        setIsPlaying(false);
      }
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggle = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return {
    isPlaying,
    isLoading,
    play,
    pause,
    toggle,
    audio,
  };
}
