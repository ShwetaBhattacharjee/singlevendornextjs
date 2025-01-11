// components/CountdownTimer.tsx
"use client";
import { useEffect, useState } from "react";

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const targetDate = new Date("2025-02-28T23:59:59").getTime(); // Target end date

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        setTimeLeft("00:00:00:00");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${days}:${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  return <span>{timeLeft}</span>;
};

export default CountdownTimer;
