import { LuPlay, LuPause } from "react-icons/lu";
import { useAudio } from "~/hooks/useAudio";

interface AudioPlayerProps {
  audioUrl: string | null;
}

export function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const { isPlaying, isLoading, toggle } = useAudio(audioUrl || "");

  if (!audioUrl) {
    return null;
  }

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={isPlaying ? "Pause audio" : "Play audio"}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : isPlaying ? (
        <LuPause className="w-5 h-5" />
      ) : (
        <LuPlay className="w-5 h-5 ml-0.5" />
      )}
    </button>
  );
}
