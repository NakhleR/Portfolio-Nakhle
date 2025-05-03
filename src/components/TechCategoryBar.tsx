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
        <div className="w-full bg-background border-y border-border/50 py-4 overflow-hidden relative">
            <div className="marquee-container">
                <div className="marquee-track">
                    {marqueeContent.map((tech, index) => (
                        <span
                            key={`tech-1-${index}`}
                            className="text-foreground font-bold text-xl md:text-2xl tracking-wide mx-8"
                        >
                            {tech}
                        </span>
                    ))}

                    {marqueeContent.map((tech, index) => (
                        <span
                            key={`tech-2-${index}`}
                            className="text-foreground font-bold text-xl md:text-2xl tracking-wide mx-8"
                        >
                            {tech}
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
