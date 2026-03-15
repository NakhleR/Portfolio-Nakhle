import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface AbstractLinesProps {
  variant?: 'hero' | 'diagonal' | 'wave' | 'grid';
  className?: string;
}

const paths: Record<string, string[]> = {
  hero: [
    'M0,120 C150,180 350,60 500,120 C650,180 850,60 1000,120',
    'M0,200 C200,260 300,140 500,200 C700,260 800,140 1000,200',
    'M0,280 C250,340 350,220 500,280 C650,340 750,220 1000,280',
  ],
  diagonal: [
    'M-50,0 L1050,400',
    'M-50,50 L1050,450',
    'M-50,100 L1050,500',
    'M-50,-50 L1050,350',
  ],
  wave: [
    'M0,80 Q125,20 250,80 T500,80 T750,80 T1000,80',
    'M0,160 Q125,100 250,160 T500,160 T750,160 T1000,160',
    'M0,240 Q125,180 250,240 T500,240 T750,240 T1000,240',
    'M0,320 Q125,260 250,320 T500,320 T750,320 T1000,320',
  ],
  grid: [
    'M200,0 L200,400',
    'M400,0 L400,400',
    'M600,0 L600,400',
    'M800,0 L800,400',
    'M0,100 L1000,100',
    'M0,200 L1000,200',
    'M0,300 L1000,300',
  ],
};

const AbstractLines = ({ variant = 'wave', className = '' }: AbstractLinesProps) => {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const selectedPaths = paths[variant];

  return (
    <svg
      ref={ref}
      viewBox="0 0 1000 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      preserveAspectRatio="none"
    >
      {selectedPaths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="currentColor"
          strokeWidth={1}
          strokeLinecap="round"
          fill="none"
          className="text-foreground/[0.06]"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  );
};

export default AbstractLines;
