import React from 'react';
import {
  VerticalTimeline,
  VerticalTimelineElement
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { BriefcaseIcon, GraduationCapIcon, FolderIcon } from 'lucide-react';

export interface TimelineItem {
  id?: string;
  year: string;
  title: string;
  description?: string;
  category: 'education' | 'work' | 'project';
  location?: string;
  bullets?: string[];
}

interface TimelineProps {
  items: TimelineItem[];
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <VerticalTimeline animate={true} lineColor="var(--border)">
      {items.map((item, index) => {
        const isEducation = item.category === 'education';
        const isWork = item.category === 'work';

        // Determine color based on category
        const iconStyle = {
          background: isEducation
            ? 'hsl(var(--primary))'
            : isWork
              ? 'hsl(var(--primary))'
              : 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          boxShadow: '0 0 0 4px hsl(var(--background)), 0 0 0 5px hsl(var(--border))'
        };

        // Determine icon based on category
        const IconComponent = isEducation
          ? GraduationCapIcon
          : isWork
            ? BriefcaseIcon
            : FolderIcon;

        return (
          <VerticalTimelineElement
            key={item.id || index}
            className="vertical-timeline-element"
            contentStyle={{
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
              borderRadius: 'var(--radius)',
              border: '1px solid hsl(var(--border))'
            }}
            contentArrowStyle={{
              borderRight: '7px solid hsl(var(--card))'
            }}
            date={item.year}
            dateClassName="text-muted-foreground font-medium"
            iconStyle={iconStyle}
            icon={<IconComponent className="w-5 h-5" />}
          >
            <div>
              <span className={`inline-block px-3 py-1 text-xs rounded-full mb-3 ${isEducation
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : isWork
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                }`}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </span>
              <h3 className="text-lg font-medium mb-2">{item.title}</h3>
              {item.location && (
                <p className="text-sm text-muted-foreground mb-2">{item.location}</p>
              )}
              {item.description && (
                <p className="text-muted-foreground mb-4">{item.description}</p>
              )}
              {item.bullets && item.bullets.length > 0 && (
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {item.bullets.map((bullet, i) => (
                    <li key={i} className="ml-2">{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          </VerticalTimelineElement>
        );
      })}
    </VerticalTimeline>
  );
};

export default Timeline;