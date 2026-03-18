import AbstractLines from '@/components/AbstractLines';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const DNAPlayback = lazy(() => import('@/components/DNAPlayback'));
const ThinkerPlayback = lazy(() => import('@/components/ThinkerPlayback'));
import { Link } from 'react-router-dom';
import { Code2, Brain, Layers, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { getProjects } from '@/lib/api';
import { ProjectDetails } from '@/components/ProjectDialog';
import TechCategoryBar from '@/components/TechCategoryBar';

const springConfig = { stiffness: 80, damping: 30, mass: 0.5 };

const PhilosophySection = ({ isDesktop }: { isDesktop: boolean }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Raw transforms smoothed with springs to eliminate stutter
  const leftYRaw = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const rightYRaw = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const captionYRaw = useTransform(scrollYProgress, [0, 1], [-15, 25]);
  const linesScaleRaw = useTransform(scrollYProgress, [0, 0.5, 1], [0.97, 1.03, 0.97]);

  const thinkerYRaw = useTransform(scrollYProgress, [0, 1], [60, -40]);
  const thinkerOpacityRaw = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const leftY = useSpring(leftYRaw, springConfig);
  const rightY = useSpring(rightYRaw, springConfig);
  const captionY = useSpring(captionYRaw, springConfig);
  const linesScale = useSpring(linesScaleRaw, springConfig);
  const thinkerY = useSpring(thinkerYRaw, springConfig);
  const thinkerOpacity = useSpring(thinkerOpacityRaw, springConfig);

  return (
    <section ref={sectionRef} className="py-32 md:py-44 relative overflow-hidden">
      <motion.div style={{ scale: linesScale, willChange: 'transform' }}>
        <AbstractLines variant="diagonal" className="opacity-60" />
      </motion.div>
      <div className="container relative">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.p
            className="text-sm font-medium text-muted-foreground uppercase tracking-[0.25em] will-change-transform"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            Philosophy
          </motion.p>

          {/* Quote — left aligned, drifts up on scroll */}
          <motion.blockquote
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-semibold leading-[1.15] tracking-tight italic will-change-transform"
            style={{ y: leftY }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            "The greatest obstacle to discovery is not ignorance
          </motion.blockquote>

          {/* Quote continued — right aligned, drifts down on scroll */}
          <motion.blockquote
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-semibold leading-[1.15] tracking-tight italic text-right text-muted-foreground will-change-transform"
            style={{ y: rightY }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            — it is the illusion of knowledge."
          </motion.blockquote>

          {/* Attribution — right aligned */}
          <motion.p
            className="text-sm md:text-base text-muted-foreground text-right tracking-wide will-change-transform"
            style={{ y: captionY }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            — Daniel J. Boorstin
          </motion.p>

          <motion.p
            className="text-sm md:text-base text-muted-foreground/70 max-w-lg ml-auto text-right leading-relaxed will-change-transform"
            style={{ y: captionY }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.55 }}
          >
            In AI and software engineering, the hardest bugs aren't what you don't know — they're the assumptions you never question. This quote drives how I approach every problem.
          </motion.p>

          <motion.div
            className="w-16 h-px bg-foreground/20 ml-auto will-change-transform"
            style={{ y: captionY }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.65 }}
          />
        </div>
      </div>

      {/* Thinker ASCII — bottom-left corner */}
      {isDesktop && (
        <motion.div
          className="absolute -bottom-10 left-[8%] w-[420px] h-[520px] md:w-[500px] md:h-[620px]"
          style={{ y: thinkerY, opacity: thinkerOpacity, willChange: 'transform, opacity' }}
        >
          <Suspense fallback={null}>
            <ThinkerPlayback />
          </Suspense>
        </motion.div>
      )}
    </section>
  );
};

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isDesktop;
};

const Index = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [featuredProjects, setFeaturedProjects] = useState<ProjectDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    // Directly add animation classes after a short delay
    const timer = setTimeout(() => {
      if (titleRef.current) titleRef.current.classList.add('animate-fade-in');
      if (subtitleRef.current) subtitleRef.current.classList.add('animate-fade-in');
      if (ctaRef.current) ctaRef.current.classList.add('animate-fade-in');
      if (imageRef.current) imageRef.current.classList.add('animate-fade-in');
    }, 2580);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchRandomProjects = async () => {
      try {
        setLoading(true);
        const allProjects = await getProjects();

        // Randomly select 2 projects
        if (allProjects.length > 0) {
          const shuffled = [...allProjects].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, Math.min(2, allProjects.length));
          setFeaturedProjects(selected);
        } else {
          // Fallback for empty projects
          setFeaturedProjects([]);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        setFeaturedProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomProjects();
  }, []);

  // Function to get image URL from project
  const getImageUrl = (project: ProjectDetails) => {
    if (project.images && project.images.length > 0) {
      const imagePath = project.images[0];

      // Base API URL from environment variables
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      if (imagePath.startsWith('http')) {
        return imagePath;
      } else if (imagePath.startsWith('/uploads')) {
        return `${apiBaseUrl}${imagePath}`;
      } else if (imagePath.includes('/uploads')) {
        // Remove any leading slashes before /uploads to ensure correct path
        const fixedPath = imagePath.substring(imagePath.indexOf('/uploads'));
        return `${apiBaseUrl}${fixedPath}`;
      } else {
        return imagePath;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 opacity-0" ref={titleRef}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-secondary/50 text-xs font-medium text-muted-foreground tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Available for work
              </div>
              <h1 className="text-balance font-semibold leading-[1.1]">
                Full Stack Developer &<br className="hidden sm:block" /> AI and Machine Learning Student
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg opacity-0 leading-relaxed" ref={subtitleRef}>
                Building intelligent, user-focused digital experiences that combine modern engineering with cutting-edge AI.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 opacity-0" ref={ctaRef}>
                <Link
                  to="/work"
                  className="group inline-flex items-center justify-center h-12 px-6 sm:px-8 rounded-full bg-foreground text-background font-medium transition-all duration-300 hover:shadow-lg hover:shadow-foreground/10 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
                >
                  View My Projects
                  <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center h-12 px-6 sm:px-8 rounded-full border border-border font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:border-border/80 text-sm sm:text-base"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
            {isDesktop && (
              <div
                className="rounded-2xl h-full overflow-hidden opacity-0"
                ref={imageRef}
              >
                <Suspense fallback={null}>
                  <DNAPlayback />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </section>

      <TechCategoryBar />

      <section className="py-28 bg-secondary/50">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">Services</p>
            <h2>What I Do</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Web Development",
                description: "Creating responsive and intuitive web applications with modern technologies and frameworks.",
                icon: Code2
              },
              {
                title: "AI & Machine Learning",
                description: "Exploring deep learning, data science, and intelligent automation to build smarter applications.",
                icon: Brain
              },
              {
                title: "Full Stack Solutions",
                description: "Delivering comprehensive solutions from frontend to backend with scalable architecture.",
                icon: Layers
              }
            ].map((service, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-background border border-border/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-black/[0.03] dark:hover:shadow-black/20 hover:border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 transition-colors duration-500 group-hover:bg-foreground group-hover:text-background">
                  <service.icon size={22} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Statement — Scroll Stop */}
      <PhilosophySection isDesktop={isDesktop} />

      {/* Featured Work */}
      <section className="py-28">
        <div className="container">
          <div className="flex justify-between items-end mb-14">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">Portfolio</p>
              <h2>Featured Projects</h2>
            </div>
            <Link
              to="/work"
              className="group text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1"
            >
              View All
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              [...Array(2)].map((_, index) => (
                <div key={index} className="aspect-[16/9] bg-secondary animate-pulse rounded-2xl" />
              ))
            ) : featuredProjects.length > 0 ? (
              featuredProjects.map((project, index) => (
                <Link
                  to={`/work?project=${project.id}`}
                  key={index}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-500 hover:shadow-xl hover:shadow-black/[0.04] dark:hover:shadow-black/20 hover:border-border"
                >
                  <div className="aspect-[16/9] bg-secondary relative overflow-hidden">
                    {getImageUrl(project) ? (
                      <img
                        src={getImageUrl(project)}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-muted-foreground">Project preview</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{project.category}</p>
                    <h3 className="text-xl font-semibold">{project.title}</h3>
                  </div>
                </Link>
              ))
            ) : (
              [...Array(2)].map((_, index) => (
                <div
                  key={index}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-card"
                >
                  <div className="aspect-[16/9] bg-secondary flex items-center justify-center">
                    <p className="text-muted-foreground">Project preview</p>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Web Development</p>
                    <h3 className="text-xl font-semibold">Sample Project</h3>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
