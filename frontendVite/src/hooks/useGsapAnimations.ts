import { useEffect, useRef, RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FadeInOptions {
  delay?: number;
  duration?: number;
  y?: number;
  ease?: string;
  stagger?: number;
}

interface ScrollTriggerOptions {
  trigger?: HTMLElement | null;
  start?: string;
  end?: string;
  toggleActions?: string;
  onEnter?: () => void;
  onLeave?: () => void;
}

export const useGsapFadeIn = (
  containerRef: RefObject<HTMLElement>,
  selector: string,
  options: FadeInOptions = {}
) => {
  const { delay = 0, duration = 0.8, y = 30, ease = 'power3.out', stagger = 0 } = options;

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray<HTMLElement>(selector);
      
      gsap.from(elements, {
        opacity: 0,
        y,
        duration,
        delay,
        ease,
        stagger,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef, selector, delay, duration, y, ease, stagger]);
};

export const useGsapScrollFadeIn = (
  containerRef: RefObject<HTMLElement>,
  selector: string,
  options: FadeInOptions & ScrollTriggerOptions = {}
) => {
  const {
    delay = 0,
    duration = 0.8,
    y = 30,
    ease = 'power3.out',
    stagger = 0.15,
    start = 'top 80%',
    end = 'bottom 20%',
    toggleActions = 'play none none none',
  } = options;

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray<HTMLElement>(selector);
      
      elements.forEach((element) => {
        gsap.from(element, {
          scrollTrigger: {
            trigger: element,
            start,
            end,
            toggleActions,
          },
          opacity: 0,
          y,
          duration,
          delay,
          ease,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef, selector, delay, duration, y, ease, stagger, start, end, toggleActions]);
};

export const useGsapScrollStagger = (
  containerRef: RefObject<HTMLElement>,
  selector: string,
  options: FadeInOptions & ScrollTriggerOptions = {}
) => {
  const {
    delay = 0,
    duration = 0.6,
    y = 40,
    ease = 'power3.out',
    stagger = 0.15,
    start = 'top 80%',
    end = 'bottom 20%',
    toggleActions = 'play none none none',
  } = options;

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray<HTMLElement>(selector);
      
      gsap.from(elements, {
        scrollTrigger: {
          trigger: containerRef.current,
          start,
          end,
          toggleActions,
        },
        opacity: 0,
        y,
        duration,
        delay,
        ease,
        stagger,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef, selector, delay, duration, y, ease, stagger, start, end, toggleActions]);
};

export const useGsapTimeline = (
  containerRef: RefObject<HTMLElement>,
  buildTimeline: (tl: gsap.core.Timeline, ctx: gsap.Context) => void
) => {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context((self) => {
      const tl = gsap.timeline({ paused: true });
      timelineRef.current = tl;
      buildTimeline(tl, self);
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef, buildTimeline]);

  return timelineRef;
};

export const useGsapScrollTimeline = (
  containerRef: RefObject<HTMLElement>,
  buildTimeline: (tl: gsap.core.Timeline) => void,
  scrollTriggerOptions: ScrollTriggerOptions = {}
) => {
  const {
    start = 'top top',
    end = '+=100%',
    toggleActions = 'play none none none',
  } = scrollTriggerOptions;

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start,
          end,
          toggleActions,
        },
      });
      buildTimeline(tl);
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef, buildTimeline, start, end, toggleActions]);
};

export const useGsapHover = (
  elementRef: RefObject<HTMLElement>,
  enterVars: gsap.TweenVars,
  leaveVars: gsap.TweenVars
) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    
    const handleEnter = () => {
      gsap.to(element, enterVars);
    };
    
    const handleLeave = () => {
      gsap.to(element, leaveVars);
    };

    element.addEventListener('mouseenter', handleEnter);
    element.addEventListener('mouseleave', handleLeave);

    return () => {
      element.removeEventListener('mouseenter', handleEnter);
      element.removeEventListener('mouseleave', handleLeave);
    };
  }, [elementRef, enterVars, leaveVars]);
};

export const useGsapScrollHeader = (headerRef: RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!headerRef.current) return;

    const ctx = gsap.context(() => {
      let lastScroll = 0;
      
      ScrollTrigger.create({
        start: 'top top',
        end: 99999,
        onUpdate: (self) => {
          const currentScroll = self.scroll();
          
          if (currentScroll > lastScroll && currentScroll > 100) {
            // Scrolling down
            gsap.to(headerRef.current, {
              y: -100,
              duration: 0.3,
              ease: 'power2.out',
            });
          } else {
            // Scrolling up
            gsap.to(headerRef.current, {
              y: 0,
              duration: 0.3,
              ease: 'power2.out',
            });
          }
          
          lastScroll = currentScroll;
        },
      });
    }, headerRef);

    return () => ctx.revert();
  }, [headerRef]);
};
