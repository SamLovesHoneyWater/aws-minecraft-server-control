
import { useEffect, useRef, useState } from "react";

export const useStatusFreshness = (timeoutMs: number = 30000) => {
  const [statusFresh, setStatusFresh] = useState(true);
  const statusTimerRef = useRef<number | null>(null);

  const startFreshnessTimer = () => {
    // Clear any existing timer
    if (statusTimerRef.current) {
      window.clearTimeout(statusTimerRef.current);
    }
    
    // Set status as fresh
    setStatusFresh(true);
    
    // Start a new timer
    statusTimerRef.current = window.setTimeout(() => {
      setStatusFresh(false);
    }, timeoutMs);
  };

  // Clean up timer when component unmounts
  useEffect(() => {
    return () => {
      if (statusTimerRef.current) {
        window.clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

  return {
    statusFresh,
    startFreshnessTimer
  };
};
