import { useEffect, useRef, useState } from 'react';
import Timeline from '../components/Timeline';
import { Card, CardContent } from '@/components/ui/card';
import { type TimelineItem } from '../components/Timeline';
import { getTimelineItems } from '@/lib/api';

const About = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (titleRef.current) observer.observe(titleRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    if (imageRef.current) observer.observe(imageRef.current);
    if (timelineRef.current) observer.observe(timelineRef.current);
    if (skillsRef.current) observer.observe(skillsRef.current);

    return () => observer.disconnect();
  }, []);

  // Fetch timeline data from API
  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        const data = await getTimelineItems();
        setTimelineItems(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError('Failed to load timeline data. Please try again later.');
        // Fallback to static data if API fails
        setTimelineItems(fallbackTimelineItems);
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, []);

  const skills = [
    { name: "Web Development", items: ["HTML/CSS", "JavaScript", "TypeScript", "React", "Node.js"] },
    { name: "Game Development", items: ["Unreal Engine", "Unity", "Godot", "Game Design", "3D Modeling"] },
    { name: "Other Skills", items: ["Git/GitHub", "UI/UX Design", "Problem Solving", "Team Collaboration"] }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="opacity-0" ref={titleRef}>
              About Me
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Full Stack Developer & Game Development Enthusiast
            </p>
          </div>
        </div>
      </section>

      {/* My Story */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="opacity-0" ref={contentRef} style={{ animationDelay: '0.2s' }}>
              <h2 className="mb-6">My Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  I'm Nakhle Rizk, born on November 20, 2002. I'm a full stack developer with a passion for creating
                  both web applications and games. My journey began with web development, mastering various frontend
                  and backend technologies.
                </p>
                <p>
                  My fascination with interactive experiences led me to game development, where I've worked with
                  Godot and Unity before finding my current focus with Unreal Engine. I enjoy the creative and
                  technical challenges that come with building immersive digital experiences.
                </p>
                <p>
                  I approach every project with attention to detail and a focus on user experience, whether
                  I'm building a responsive web application or designing game mechanics. I'm constantly learning
                  and expanding my skills to stay current with the latest technologies and best practices.
                </p>
              </div>
            </div>
            <div
              className="rounded-lg overflow-hidden opacity-0"
              ref={imageRef}
              style={{ animationDelay: '0.4s' }}
            >
              <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Profile image</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-secondary">
        <div className="container">
          <h2 className="text-center mb-16">My Journey</h2>
          <div
            className="opacity-0"
            ref={timelineRef}
            style={{ animationDelay: '0.2s' }}
          >
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
              <Timeline items={timelineItems} />
            )}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-center mb-16">My Skills</h2>
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-0"
            ref={skillsRef}
            style={{ animationDelay: '0.3s' }}
          >
            {skills.map((skillGroup, index) => (
              <Card key={index} className="bg-background hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <h3 className="text-xl mb-4">{skillGroup.name}</h3>
                  <ul className="space-y-2">
                    {skillGroup.items.map((skill, skillIndex) => (
                      <li key={skillIndex} className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                        <span className="text-muted-foreground">{skill}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Fallback data in case API fails
const fallbackTimelineItems: TimelineItem[] = [
  {
    year: 'January 2024 - Currently',
    title: 'Full Stack Developer',
    location: 'Code SARL - Jounieh, Lebanon',
    category: 'work',
    bullets: [
      'Mastery of front-end and back-end technologies.',
      'Effective collaboration with teams to achieve project objectives.',
      'Creation of complete web applications, from design to production.'
    ]
  },
  {
    year: 'February 2020 - September 2022',
    title: 'Maintenance team manager',
    location: 'GCS Computers Pro - Sarba, Lebanon',
    category: 'work',
    bullets: [
      'Close collaboration within a dynamic team.',
      'Evolution at the heart of a workshop specializing in the complete repair of various electronic devices.',
      'Active participation in repair and maintenance projects.'
    ]
  },
  {
    year: 'September 2019 - January 2020',
    title: 'Cashier',
    location: 'Morgan\'s Lane - Kaslik, Lebanon',
    category: 'work',
    bullets: [
      'Development of essential skills in the accurate and efficient processing of financial transactions.',
      'Commitment to exceptional customer service.',
      'Warm welcome to customers.'
    ]
  },
  {
    year: 'June 2019 - August 2019',
    title: 'Versatile Employee',
    location: 'McDonald\'s - Kaslik, Lebanon',
    category: 'work',
    bullets: [
      'Acquisition of extensive experience in various operational areas.',
      'Inventory management.',
      'Customer service.'
    ]
  },
  {
    year: 'September 2023 - Currently',
    title: 'L2 Computer Science',
    location: 'University of Rouen Normandy - Rouen, France',
    category: 'education'
  },
  {
    year: 'September 2022 - June 2023',
    title: 'L1 IEEA',
    location: 'University of Rouen Normandy - Rouen, France',
    category: 'education'
  },
  {
    year: 'September 2019 - June 2020',
    title: 'French Scientific Baccalaureate - Biology',
    location: 'Sainte-Famille Française - Jounieh, Liban',
    category: 'education'
  }
];

export default About;
