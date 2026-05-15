import { useEffect, useRef } from "react";

const defaultOptions: IntersectionObserverInit = {
  threshold: 0.14,
  rootMargin: "0px 0px -6% 0px",
};

export function useRevealOnScroll(visibleClass = "scroll-reveal-visible") {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        el.classList.add(visibleClass);
        io.disconnect();
      }
    }, defaultOptions);

    io.observe(el);
    return () => io.disconnect();
  }, [visibleClass]);

  return ref;
}
