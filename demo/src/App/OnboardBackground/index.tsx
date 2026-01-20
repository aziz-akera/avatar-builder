import React from 'react';

interface BackgroundProps {
  children?: React.ReactNode;
}

export function OnboardBackground({ children }: BackgroundProps) {
  return (
    <main className="relative w-screen min-h-screen overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-indigo-50 to-white" />

      {/* Polka dot pattern as overlay */}
      <img src="/polka.webp"
        className="absolute inset-0 z-20 w-full h-auto left-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none"
      />

      {/* Ellipse decoration */}
      <img
        src="/ellipses/ellipse-172.svg"
        className="z-10 blur-[260px] absolute left-[14%] top-[20%] w-[35%]"
        alt="Decorative Ellipse"
      />

      <img
        src="/ellipses/ellipse-173.svg"
        className="z-10 blur-[260px] absolute left-[33%] top-[31%] w-[35%]"
        alt="Decorative Ellipse"
      />

      <img
        src="/ellipses/ellipse-174.svg"
        className="z-10 blur-[260px] absolute left-[56%] top-[38%] w-[33%]"
        alt="Decorative Ellipse"
      />

      <img
        src="/ellipses/ellipse-175.svg"
        className="z-10 blur-[260px] absolute left-[13%] top-[77%] w-[27%]"
        alt="Decorative Ellipse"
      />

      <img
        src="/ellipses/ellipse-176.svg"
        className="z-10 blur-[260px] absolute left-[74%] top-[70%] w-[21%]"
        alt="Decorative Ellipse"
      />

      <img
        src="/ellipses/ellipse-177.svg"
        className="z-10 blur-[260px] absolute left-[60%] top-[60%] w-[21%]"
        alt="Decorative Ellipse"
      />

      {/* Page content */}
      <div className="relative z-30">{children}</div>
    </main>
  );
}
