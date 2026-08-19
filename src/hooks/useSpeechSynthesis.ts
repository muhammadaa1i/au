"use client";

import { useCallback, useEffect, useState } from "react";

export function useSpeechSynthesis(lang = "ja-JP") {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Feature detection can only run client-side, after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    },
    [lang],
  );

  return { isSupported, speak };
}
