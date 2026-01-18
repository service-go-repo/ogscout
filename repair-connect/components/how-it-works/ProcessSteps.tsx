'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';

interface Step {
  label: string;
  description: string;
}

interface ProcessStepsProps {
  steps: Step[];
}

export function ProcessSteps({ steps }: ProcessStepsProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const intersectingSteps = useRef<Set<number>>(new Set());

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const stepIndex = parseInt(entry.target.getAttribute('data-step-index') || '0');

        if (entry.isIntersecting) {
          intersectingSteps.current.add(stepIndex);
        } else {
          intersectingSteps.current.delete(stepIndex);
        }
      });

      // Find the most visible step (closest to center)
      if (intersectingSteps.current.size > 0) {
        const mostVisibleStep = Array.from(intersectingSteps.current).sort((a, b) => {
          const elementA = document.querySelector(`[data-step-index="${a}"]`);
          const elementB = document.querySelector(`[data-step-index="${b}"]`);

          if (!elementA || !elementB) return 0;

          const rectA = elementA.getBoundingClientRect();
          const rectB = elementB.getBoundingClientRect();
          const centerY = window.innerHeight / 2;

          const distanceA = Math.abs(rectA.top + rectA.height / 2 - centerY);
          const distanceB = Math.abs(rectB.top + rectB.height / 2 - centerY);

          return distanceA - distanceB;
        })[0];

        if (mostVisibleStep !== activeStep) {
          setActiveStep(mostVisibleStep);
          setIsVisible(false);
          setTimeout(() => setIsVisible(true), 50);
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const stepElements = document.querySelectorAll('.js-stack-cards__item');
      stepElements.forEach((element) => observer.observe(element));
    }, 100);

    return () => {
      const stepElements = document.querySelectorAll('.js-stack-cards__item');
      stepElements.forEach((element) => observer.unobserve(element));
    };
  }, [activeStep]);

  return (
    <div ref={containerRef} className="space-y-7 xl:text-left text-center">
      <div className="space-y-3">
        <Badge variant="outline" className="border-primary-500 text-primary-500 px-4 py-2">
          Process
        </Badge>
        <h2 className="xl:max-w-[629px] w-full xl:mx-0 mx-auto text-heading-5 sm:text-heading-4 md:text-heading-3 lg:text-heading-2 text-secondary dark:text-accent">
          From Request to Repair
        </h2>
        <div
          className={`transition-opacity duration-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="xl:max-w-[544px] w-full text-lg text-secondary/60 dark:text-accent/60">
            {steps[activeStep]?.description || steps[0].description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 xl:justify-start justify-center">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeStep
                ? 'w-8 bg-primary-500'
                : 'w-2 bg-secondary/20 dark:bg-accent/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
