"use client";

import { useState, useEffect, useCallback } from "react";

interface Ad {
  _id: string;
  title: string;
  type: "image" | "video";
  url: string;
}

function pickTwoRandom(ads: Ad[]): [Ad | null, Ad | null] {
  if (ads.length === 0) return [null, null];
  if (ads.length === 1) return [ads[0], null];
  const idx1 = Math.floor(Math.random() * ads.length);
  let idx2 = Math.floor(Math.random() * (ads.length - 1));
  if (idx2 >= idx1) idx2++;
  return [ads[idx1], ads[idx2]];
}

export default function AdSidebar({ ads }: { ads: Ad[] }) {
  const [leftAd, setLeftAd] = useState<Ad | null>(null);
  const [rightAd, setRightAd] = useState<Ad | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const rotate = useCallback(() => {
    const [l, r] = pickTwoRandom(ads);
    setLeftAd(l);
    setRightAd(r);
  }, [ads]);

  useEffect(() => { rotate(); }, [rotate]);

  useEffect(() => {
    if (ads.length < 2) return;
    const interval = setInterval(rotate, 20000);
    return () => clearInterval(interval);
  }, [ads, rotate]);

  function renderAd(ad: Ad, side: "left" | "right") {
    const isLeft = side === "left";
    const open = isLeft ? leftOpen : rightOpen;
    const toggle = () => (isLeft ? setLeftOpen : setRightOpen)((v) => !v);

    return (
      <div
        className={`fixed top-1/4 z-30 hidden lg:flex flex-col items-center ${
          isLeft ? "left-3" : "right-3"
        }`}
      >
        <button
          onClick={toggle}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:opacity-90 transition-all"
        >
          <span className={`text-xl font-bold transition-transform duration-300 ${open ? "rotate-0" : "rotate-180"}`}>
            {isLeft ? "◀" : "▶"}
          </span>
        </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[56rem] opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        <div className="w-96 bg-card border border-border rounded-sm shadow-lg overflow-hidden">
          {ad.type === "video" ? (
            <video
              src={ad.url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full max-h-[52rem] object-contain"
            />
          ) : (
            <img
              src={ad.url}
              alt={ad.title}
              className="w-full max-h-[52rem] object-contain"
            />
          )}
        </div>
      </div>
      </div>
    );
  }

  return (
    <>
      {leftAd && renderAd(leftAd, "left")}
      {rightAd && renderAd(rightAd, "right")}
    </>
  );
}
