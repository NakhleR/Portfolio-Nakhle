import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Timeline from '../components/Timeline';
import { type TimelineItem } from '../components/Timeline';
import { getTimelineItems } from '@/lib/api';

const About = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);

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
        { name: "Python", imagePath: "/python-logo-only.svg", color: "#3776AB", level: 50 },
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
              Full Stack Developer & AI and Machine Learning Student
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
                  I'm Nakhle Rizk, born on November 20, 2002. I'm a full stack developer and AI & machine learning
                  student with a passion for building intelligent, user-focused applications. My journey began with
                  web development, mastering various frontend and backend technologies.
                </p>
                <p>
                  My curiosity for how systems learn and adapt led me to artificial intelligence and machine learning,
                  where I'm exploring areas like deep learning, data science, and intelligent automation. I enjoy
                  bridging the gap between robust software engineering and cutting-edge AI research.
                </p>
                <p>
                  I approach every project with attention to detail and a focus on user experience, whether
                  I'm building a responsive web application or training a machine learning model. I'm constantly
                  learning and expanding my skills to stay current with the latest technologies and best practices.
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
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent pointer-events-none" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="mb-4">My Skills</h2>
            <p className="text-muted-foreground text-lg">Technologies & tools I work with</p>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex justify-center mb-16 -mx-4 px-4"
          >
            <div className="inline-flex gap-1 p-1.5 rounded-full bg-secondary/60 backdrop-blur-sm border border-border/50 overflow-x-auto max-w-full scrollbar-hide">
              {skills.map((group, index) => (
                <button
                  key={index}
                  onClick={() => setActiveCategory(index)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                    activeCategory === index
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {activeCategory === index && (
                    <motion.div
                      layoutId="activeSkillTab"
                      className="absolute inset-0 bg-primary rounded-full"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{group.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Skills Grid */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap justify-center gap-5"
              >
                {skills[activeCategory].items.map((skill, index) => {
                  const radius = 34;
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference - (skill.level / 100) * circumference;

                  return (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
                      className="group relative"
                    >
                      <div className="flex flex-col items-center gap-3 w-[140px] p-5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm transition-all duration-500 hover:border-border hover:-translate-y-2 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20">
                        {/* Radial Progress Ring */}
                        <div className="relative w-[76px] h-[76px]">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 76 76">
                            <circle
                              cx="38" cy="38" r={radius}
                              fill="none"
                              className="stroke-secondary"
                              strokeWidth="2.5"
                            />
                            <motion.circle
                              cx="38" cy="38" r={radius}
                              fill="none"
                              stroke={skill.color}
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeDasharray={circumference}
                              initial={{ strokeDashoffset: circumference }}
                              animate={{ strokeDashoffset: offset }}
                              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 + index * 0.06 }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <img
                              src={skill.imagePath}
                              alt={skill.name}
                              className={`w-7 h-7 object-contain transition-transform duration-500 group-hover:scale-110 ${skill.darkModeInvert ? 'dark:invert' : ''}`}
                            />
                          </div>
                        </div>

                        {/* Skill Info */}
                        <div className="text-center">
                          <p className="text-sm font-medium leading-tight">{skill.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{skill.level}%</p>
                        </div>
                      </div>

                      {/* Hover Glow Effect */}
                      <div
                        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"
                        style={{ backgroundColor: `${skill.color}18` }}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
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
