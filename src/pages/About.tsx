
import { useEffect, useRef } from 'react';
import Timeline from '../components/Timeline';
import { Card, CardContent } from '@/components/ui/card';
import { type TimelineItem } from '../components/Timeline';

const About = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

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

  const timelineItems: TimelineItem[] = [
    {
      year: '2022 - Present',
      title: 'Full Stack Developer',
      description: 'Working on web applications using modern technologies like React, TypeScript, and Node.js.',
      category: 'work'
    },
    {
      year: '2021 - Present',
      title: 'Game Development with Unreal Engine',
      description: 'Creating games and interactive experiences using Unreal Engine.',
      category: 'project'
    },
    {
      year: '2020 - 2021',
      title: 'Unity and Godot Experience',
      description: 'Developed multiple game prototypes and small projects using Unity and Godot game engines.',
      category: 'project'
    },
    {
      year: '2019 - 2023',
      title: 'Computer Science Degree',
      description: 'Studied programming fundamentals, algorithms, data structures, and software development principles.',
      category: 'education'
    }
  ];

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
            <Timeline items={timelineItems} />
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
              <Card key={index} className="bg-background">
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

export default About;
