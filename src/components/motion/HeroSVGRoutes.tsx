"use client";

import { motion } from "framer-motion";

const ROUTES = [
  { d: "M1150,350 C900,200 600,300 320,500", opacity: 0.6, delay: 1.3 },
  { d: "M1150,350 C880,180 580,320 290,540", opacity: 0.5, delay: 1.7 },
  { d: "M1150,350 C870,220 560,380 340,580", opacity: 0.5, delay: 2.1 },
  { d: "M1150,350 C910,160 620,280 370,460", opacity: 0.4, delay: 2.5 },
  { d: "M1150,350 C860,240 540,340 250,510", opacity: 0.4, delay: 2.9 },
];

const DEST_POINTS = [
  { cx: 320, cy: 500, delay: 2.9 },
  { cx: 290, cy: 540, delay: 3.3 },
  { cx: 340, cy: 580, delay: 3.7 },
  { cx: 370, cy: 460, delay: 3.1 },
  { cx: 250, cy: 510, delay: 3.5 },
];

export default function HeroSVGRoutes() {
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ opacity: 0.07 }}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Cartographic grid */}
      <motion.line x1="0" y1="300" x2="1440" y2="300" stroke="white" strokeWidth="0.5"
        initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}
        transition={{ duration: 1, delay: 0.3 }} />
      <motion.line x1="0" y1="500" x2="1440" y2="500" stroke="white" strokeWidth="0.5"
        initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}
        transition={{ duration: 1, delay: 0.4 }} />
      <motion.line x1="720" y1="0" x2="720" y2="900" stroke="white" strokeWidth="0.5"
        initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}
        transition={{ duration: 1, delay: 0.5 }} />

      {/* Origin — East Asia */}
      <motion.circle cx="1150" cy="350" r="4" fill="#C4933F"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9, ease: "backOut" }} />
      <motion.circle cx="1150" cy="350" r="12" fill="none" stroke="#C4933F" strokeWidth="1"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ duration: 0.7, delay: 1.0 }} />

      {/* Trade routes — draw on, one by one */}
      {ROUTES.map((r, i) => (
        <motion.path
          key={i}
          d={r.d}
          fill="none"
          stroke="white"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: r.opacity }}
          transition={{ duration: 1.6, delay: r.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Destination dots — pop in after routes arrive */}
      {DEST_POINTS.map((pt, i) => (
        <motion.circle
          key={i}
          cx={pt.cx} cy={pt.cy} r="3" fill="white"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ duration: 0.3, delay: pt.delay, ease: "backOut" }}
        />
      ))}
    </svg>
  );
}
