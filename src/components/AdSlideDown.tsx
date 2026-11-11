"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";

interface Ad {
  _id: string;
  title: string;
  type: "image" | "video";
  url: string;
}

function pickRandom(ads: Ad[]): Ad | null {
  if (ads.length === 0) return null;
  return ads[Math.floor(Math.random() * ads.length)];
}

export default function AdSlideDown({ ads }: { ads: Ad[] }) {
  const [current, setCurrent] = useState<Ad | null>(null);
  const [open, setOpen] = useState(true);
  const [initialSlide, setInitialSlide] = useState(false);

  const rotate = useCallback(() => {
    setCurrent(pickRandom(ads));
  }, [ads]);

  useEffect(() => {
    if (ads.length === 0) return;
    rotate();
    const timer = setTimeout(() => setInitialSlide(true), 500);
    return () => clearTimeout(timer);
  }, [ads, rotate]);

  useEffect(() => {
    if (ads.length < 2) return;
    const interval = setInterval(rotate, 15000);
    return () => clearInterval(interval);
  }, [ads, rotate]);

  if (!current || !initialSlide) return null;

  const adHeight = open ? "max-h-[32rem]" : "max-h-0";

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex flex-col items-center">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-4 py-1.5 rounded-b-sm bg-primary text-primary-foreground shadow-md hover:opacity-90 transition-opacity text-sm font-bold"
      >
        {open ? (
          <><ChevronUpIcon className="size-4" /> Ad</>
        ) : (
          <><ChevronDownIcon className="size-4" /> Ad</>
        )}
      </button>

      <div
        className={`w-full max-w-5xl overflow-hidden transition-all duration-300 ${adHeight}`}
      >
        <div className="bg-card border border-border shadow-lg overflow-hidden mx-2 sm:mx-3 rounded-b-sm">
          {current.type === "video" ? (
            <video
              src={current.url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full max-h-[30rem] object-contain"
            />
          ) : (
            <img
              src={current.url}
              alt={current.title}
              className="w-full max-h-[30rem] object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}
