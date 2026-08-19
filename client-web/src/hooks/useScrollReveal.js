import { useEffect, useRef, useCallback } from 'react';

export function useScrollReveal(threshold = 0.1) {
  const observerRef = useRef(null);

  const observe = useCallback((node) => {
    if (!node) return;
    if (observerRef.current) {
      observerRef.current.observe(node);
    }
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );
    return () => observerRef.current?.disconnect();
  }, [threshold]);

  return observe;
}
