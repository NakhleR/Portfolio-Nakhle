import React from 'react';
import { useTheme } from '@/components/ThemeProvider';

const technologies = [
    "FRONTEND", "BACKEND", "MOBILE", "UI/UX", "DATABASE", "DEVOPS", "WEB", "ARCHITECTURE",
    "CLOUD", "API", "REACT", "NODEJS", "TYPESCRIPT", "NEXTJS", "EXPRESS",
    "MONGODB", "MYSQL", "FLUTTER", "RIVERPOD", "BLOC",
];

export default function TechCategoryBar() {
    const { theme } = useTheme();

    // Double the technologies to ensure we have enough content for seamless scrolling
    const marqueeContent = [...technologies, ...technologies];

    return (
        <div className="w-full border-y border-border/30 py-5 overflow-hidden relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="marquee-container">
                <div className="marquee-track">
                    {marqueeContent.map((tech, index) => (
                        <span
                            key={`tech-1-${index}`}
                            className="text-foreground/80 font-heading font-semibold text-lg md:text-xl tracking-wider mx-6 flex items-center gap-6"
                        >
                            {tech}
                            <span className="w-1.5 h-1.5 rounded-full bg-foreground/15" />
                        </span>
                    ))}

                    {marqueeContent.map((tech, index) => (
                        <span
                            key={`tech-2-${index}`}
                            className="text-foreground/80 font-heading font-semibold text-lg md:text-xl tracking-wider mx-6 flex items-center gap-6"
                        >
                            {tech}
                            <span className="w-1.5 h-1.5 rounded-full bg-foreground/15" />
                        </span>
                    ))}
                </div>
            </div>

            <style>
                {`
                .marquee-container {
                    width: 100%;
                    overflow: hidden;
                    position: relative;
                }
                
                .marquee-track {
                    display: inline-flex;
                    white-space: nowrap;
                    animation: marquee 45s linear infinite;
                    will-change: transform;
                }
                
                @keyframes marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                `}
            </style>
        </div>
    );
}
