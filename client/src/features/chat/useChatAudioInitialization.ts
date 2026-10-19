
import { useEffect } from "react";
import { initializeChatAudio } from "./chatSound";

export const useChatAudioInitialization = () => {
  useEffect(() => {
    const handleInteraction = () => {
      void initializeChatAudio();
    };

    const options = { once: true };

    window.addEventListener("pointerdown", handleInteraction, options);
    window.addEventListener("keydown", handleInteraction, options);

    return () => {
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);
};
