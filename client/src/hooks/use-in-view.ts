import { useEffect, useRef, useState, useCallback } from "react";

export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px", ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}

export function useCountUp(end: number, duration = 1200, startOnView = true) {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [count, setCount] = useState(prefersReduced ? end : 0);
  const [started, setStarted] = useState(!startOnView || prefersReduced);
  const frameRef = useRef<number>(0);

  const start = useCallback(() => setStarted(true), []);

  useEffect(() => {
    if (prefersReduced) {
      setCount(end);
      return;
    }
    if (!started || end === 0) {
      if (end === 0) setCount(0);
      return;
    }

    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress < 1
        ? 1 - Math.pow(2, -10 * progress) * Math.cos((progress * 10 - 0.75) * (2 * Math.PI / 3))
        : 1;
      setCount(Math.round(Math.min(eased, 1.02) * end));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [started, end, duration, prefersReduced]);

  return { count, start };
}
