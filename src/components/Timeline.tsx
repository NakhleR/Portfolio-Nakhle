
import React from 'react';

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
  category: 'education' | 'work' | 'project';
}

interface TimelineProps {
  items: TimelineItem[];
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-0 md:left-1/2 h-full w-px bg-border transform -translate-x-1/2"></div>
      
      <div className="space-y-12">
        {items.map((item, index) => (
          <div 
            key={index} 
            className={`relative flex flex-col md:flex-row ${
              index % 2 === 0 ? 'md:flex-row-reverse' : ''
            }`}
          >
            {/* Content */}
            <div className="md:w-1/2 pb-10">
              <div 
                className={`relative ${
                  index % 2 === 0 ? 'md:mr-10' : 'md:ml-10'
                } p-6 bg-card rounded-lg border`}
              >
                <span className={`inline-block px-3 py-1 text-xs rounded-full mb-3 ${
                  item.category === 'education' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                    : item.category === 'work'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                }`}>
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </span>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">{item.year}</span>
                </div>
                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
            
            {/* Circle indicator */}
            <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full border-4 border-background bg-primary"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
