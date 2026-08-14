"use client";

import { useEffect, useRef } from "react";

export function AmbientBackground() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const moveSpotlight = (event: PointerEvent) => {
      spotlightRef.current?.style.setProperty("--spotlight-x", `${event.clientX}px`);
      spotlightRef.current?.style.setProperty("--spotlight-y", `${event.clientY}px`);
    };

    window.addEventListener("pointermove", moveSpotlight, { passive: true });
    return () => window.removeEventListener("pointermove", moveSpotlight);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="ambient-grid absolute inset-0" />
      <div ref={spotlightRef} className="ambient-spotlight absolute inset-0" />
      <div className="ambient-orb ambient-orb-left" />
      <div className="ambient-orb ambient-orb-right" />
      <div className="ambient-orb ambient-orb-center" />
      <div className="ambient-grain absolute inset-0" />
    </div>
  );
}
