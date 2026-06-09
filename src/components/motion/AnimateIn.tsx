"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const EASE: [number, number, number, number] = [0, 0, 0.2, 1];

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  x?: number;
  duration?: number;
}

export default function AnimateIn({
  children,
  delay = 0,
  className,
  y = 24,
  x = 0,
  duration = 0.6,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, x }}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : y,
        x: isInView ? 0 : x,
      }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
