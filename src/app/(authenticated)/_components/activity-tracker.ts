"use client";

import { useEffect } from "react";

const ACTIVITY_INTERVAL = 5 * 60 * 1000;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export function ActivityTracker() {
  useEffect(() => {
    let lastInteraction = Date.now();
    let lastReported = 0;

    const registerActivity = () => {
      if (document.visibilityState !== "visible") return;

      const now = Date.now();

      if (now - lastInteraction > INACTIVITY_TIMEOUT) return;
      if (now - lastReported < ACTIVITY_INTERVAL) return;

      lastReported = now;

      void fetch("/api/access", {
        method: "POST",
      }).catch((error) => {
        console.error("Error registrando actividad:", error);
      });
    };

    const handleInteraction = () => {
      lastInteraction = Date.now();
      registerActivity();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleInteraction();
      }
    };

    registerActivity();

    const interval = window.setInterval(registerActivity, ACTIVITY_INTERVAL);

    window.addEventListener("pointerdown", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
