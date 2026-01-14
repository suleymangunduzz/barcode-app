import { useRef, useCallback } from "react";

export default function useBarcodeBeep() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playBeep = useCallback(async () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Barcode sound playback failed", err);
      }
    }
  }, []);

  // Usage: <audio ref={audioRef} ... /> in your component
  return { audioRef, playBeep };
}
