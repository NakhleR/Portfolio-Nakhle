import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/components/ThemeProvider';

const technologies = [
    "FRONTEND",
    "BACKEND",
    "MOBILE",
    "UI/UX",
    "DATABASE",
    "DEVOPS",
    "WEB",
    "ARCHITECTURE",
    "CLOUD",
    "API",
    "REACT",
    "NODEJS",
    "TYPESCRIPT",
    "NEXTJS",
    "EXPRESS",
    "MONGODB",
    "MYSQL",
    "FLUTTER",
    "RIVERPOD",
    "BLOC",
];

const TechCategoryBar = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        // Start with a clean setup, copy all items multiple times to ensure we have enough content
        const scrollAnimation = () => {
            if (scrollContainer) {
                scrollContainer.scrollLeft += 1; // Smooth constant speed

                // Reset position when we've scrolled far enough
                // This creates a seamless loop effect by jumping back when items have scrolled out of view
                if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.offsetWidth - 10) {
                    // Jump back to start but not completely to zero to avoid flickering
                    scrollContainer.scrollLeft = 10;
                }
            }

            animationRef.current = requestAnimationFrame(scrollAnimation);
        };

        // Start the animation
        animationRef.current = requestAnimationFrame(scrollAnimation);

        // Cleanup on unmount
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Create a larger array by repeating the items to ensure continuous scrolling
    const repeatedTechnologies = [...technologies, ...technologies, ...technologies, ...technologies];

    return (
        <div className="bg-background w-full overflow-hidden py-4 border-y border-border/50">
            <div
                className="relative whitespace-nowrap overflow-x-hidden scrollbar-hide pointer-events-none"
                ref={scrollRef}
                style={{
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch',
                    msOverflowStyle: 'none'
                }}
            >
                <div className="inline-flex gap-16 px-10">
                    {repeatedTechnologies.map((tech, index) => (
                        <span
                            key={`${tech}-${index}`}
                            className="text-foreground font-bold text-xl md:text-2xl tracking-wide whitespace-nowrap"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TechCategoryBar; 