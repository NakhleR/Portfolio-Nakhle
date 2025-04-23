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
    {
      name: "Web Development",
      items: [
        { name: "React.js", imagePath: "/react.png", color: "#61DAFB", level: 65 },
        { name: "JavaScript", imagePath: "/js.png", color: "#F7DF1E", level: 70 },
        { name: "TypeScript", imagePath: "/ts.png", color: "#3178C6", level: 60 },
        { name: "Three.js", imagePath: "/threejs.png", color: "#000000", darkModeInvert: true, level: 45 },
        { name: "PHP", imagePath: "/php.png", color: "#777BB4", level: 55 },
        { name: "Laravel", imagePath: "/laravel.png", color: "#FF2D20", level: 50 }
      ]
    },
    {
      name: "App Development",
      items: [
        { name: "Flutter", imagePath: "/flutter.png", color: "#02569B", level: 60 },
        { name: "Dart", imagePath: "/dart.png", color: "#0175C2", level: 55 },
        { name: "Bloc", imagePath: "/bloc.webp", color: "#0082FB", level: 40 },
        { name: "Riverpod", imagePath: "/riverpod.png", color: "#0175C2", level: 35 }
      ]
    },
    {
      name: "Game Development",
      items: [
        { name: "Unreal Engine", imagePath: "/unreal.png", color: "#0E1128", darkModeInvert: true, level: 50 },
        { name: "C++", imagePath: "/cpp.png", color: "#00599C", level: 45 },
        { name: "C", imagePath: "/c.png", color: "#A8B9CC", level: 40 },
        { name: "Blender", imagePath: "/blender.png", color: "#478CAB", level: 35 }
      ]
    },
    {
      name: "Programming Languages",
      items: [
        { name: "JavaScript", imagePath: "/js.png", color: "#F7DF1E", level: 70 },
        { name: "TypeScript", imagePath: "/ts.png", color: "#3178C6", level: 60 },
        { name: "C", imagePath: "/c.png", color: "#A8B9CC", level: 40 },
        { name: "C++", imagePath: "/cpp.png", color: "#00599C", level: 45 },
        { name: "OCaml", imagePath: "/ocaml.png", color: "#EC6813", level: 30 },
        { name: "PHP", imagePath: "/php.png", color: "#777BB4", level: 55 },
        { name: "Java", imagePath: "/java.png", color: "#007396", level: 35 },
        { name: "Dart", imagePath: "/dart.png", color: "#0175C2", level: 55 }
      ]
    },
    {
      name: "Databases",
      items: [
        { name: "SQL", imagePath: "/mysql.png", color: "#4479A1", level: 60 },
        { name: "MongoDB", imagePath: "/mongodb.png", color: "#4DB33D", level: 55 }
      ]
    }
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
                <img src="/nakhle.png" alt="Profile" className="w-full h-full object-cover" />
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
          <style>
            {`
              @keyframes fillBar {
                from {
                  transform: scaleX(0);
                }
                to {
                  transform: scaleX(1);
                }
              }
              .skill-bar {
                animation: fillBar 1.5s ease-out forwards;
                transform: scaleX(0);
                transform-origin: left;
              }
            `}
          </style>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-0"
            ref={skillsRef}
            style={{ animationDelay: '0.3s' }}
          >
            {skills.map((skillGroup, index) => (
              <Card key={index} className="bg-background hover:shadow-md transition-shadow duration-300 border-opacity-50">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-6">{skillGroup.name}</h3>
                  <ul className="space-y-5">
                    {skillGroup.items.map((skill, skillIndex) => (
                      <li key={skillIndex}>
                        <div className="flex items-center mb-2">
                          <img
                            src={skill.imagePath}
                            alt={skill.name}
                            width={16}
                            height={16}
                            className={`mr-3 ${skill.darkModeInvert ? 'dark:invert' : ''}`}
                          />
                          <span className="text-muted-foreground text-sm">{skill.name}</span>
                        </div>
                        <div className="w-full bg-secondary/50 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full skill-bar ${skill.darkModeInvert ? 'dark:bg-white' : ''}`}
                            style={{
                              width: `${skill.level}%`,
                              backgroundColor: skill.color || 'var(--primary)',
                              animationDelay: `${0.2 + (skillIndex * 0.1)}s`
                            }}
                          ></div>
                        </div>
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
