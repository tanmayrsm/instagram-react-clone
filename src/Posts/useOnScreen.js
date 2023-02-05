import { useEffect, useState, useRef } from 'react';

export const useIntersectionObserver = (ref, options) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
  
    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      }, options);
  
      if (ref.current) {
        observer.observe(ref.current);
      }
  
      return () => {
        try {
            observer.unobserve(ref.current);
        } catch(e) {
            console.warn("Cant find observer");
        }
      };
    }, []);
  
    return isIntersecting;
  };