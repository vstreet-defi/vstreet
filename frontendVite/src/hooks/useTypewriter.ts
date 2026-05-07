import { useState, useEffect, useRef } from 'react';

interface UseTypewriterOptions {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
}

export function useTypewriter({
  words,
  typeSpeed = 120,
  deleteSpeed = 80,
  pauseDuration = 2000,
}: UseTypewriterOptions) {
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const currentWord = words[wordIndex];

    const tick = () => {
      if (isDeleting) {
        setDisplayed((prev) => prev.slice(0, -1));
        if (displayed.length <= 1) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
          timeoutRef.current = setTimeout(tick, typeSpeed);
        } else {
          timeoutRef.current = setTimeout(tick, deleteSpeed);
        }
      } else {
        const next = currentWord.slice(0, displayed.length + 1);
        setDisplayed(next);
        if (next === currentWord) {
          timeoutRef.current = setTimeout(() => {
            setIsDeleting(true);
            tick();
          }, pauseDuration);
        } else {
          timeoutRef.current = setTimeout(tick, typeSpeed);
        }
      }
    };

    timeoutRef.current = setTimeout(tick, typeSpeed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayed, isDeleting, wordIndex, words, typeSpeed, deleteSpeed, pauseDuration]);

  return { displayed, isDeleting };
}
