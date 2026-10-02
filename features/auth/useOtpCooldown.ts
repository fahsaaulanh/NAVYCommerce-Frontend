"use client";

import { useEffect, useState } from "react";

export default function useOtpCooldown() {
  const [availableAt, setAvailableAt] = useState(0);
  const [now, setNow] = useState(0);

  const remainingSeconds = Math.max(0, Math.ceil((availableAt - now) / 1000));

  function startCooldown(seconds: number) {
    const currentTime = Date.now();

    setNow(currentTime);
    setAvailableAt(currentTime + Math.max(0, seconds) * 1000);
  }

  useEffect(() => {
    if (availableAt <= Date.now()) return;

    const timer = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);

      if (currentTime >= availableAt) {
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [availableAt]);

  return { remainingSeconds, startCooldown };
}
