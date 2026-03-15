import DNAPlayback from '@/components/DNAPlayback';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjects } from '@/lib/api';
import { ProjectDetails } from '@/components/ProjectDialog';
import TechCategoryBar from '@/components/TechCategoryBar';

const Index = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [featuredProjects, setFeaturedProjects] = useState<ProjectDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Directly add animation classes after a short delay
    const timer = setTimeout(() => {
      if (titleRef.current) titleRef.current.classList.add('animate-fade-in');
      if (subtitleRef.current) subtitleRef.current.classList.add('animate-fade-in');
      if (ctaRef.current) ctaRef.current.classList.add('animate-fade-in');
      if (imageRef.current) imageRef.current.classList.add('animate-fade-in');
    }, 4580);

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 opacity-0" ref={titleRef}>
              <h1 className="text-balance font-medium">
                Full Stack Developer & AI and Machine Learning Student
              </h1>
              <p className="text-xl text-muted-foreground max-w-md opacity-0" ref={subtitleRef}>
                Creating digital experiences that combine functionality, creativity, and technical excellence.
              </p>
              <div className="pt-4 opacity-0" ref={ctaRef}>
                <Link
                  to="/work"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-foreground text-background transition-transform duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                >
                  View My Projects
                </Link>
              </div>
            </div>
            <div
              className="rounded-lg h-full overflow-hidden opacity-0 hidden md:block"
              ref={imageRef}
            >
              <DNAPlayback />
            </div>
          </div>
        </div>
      </section>

      <TechCategoryBar />

      <section className="py-24 bg-secondary">
        <div className="container">
          <h2 className="text-center mb-16">What I Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Web Development",
                description: "Creating responsive and intuitive web applications with modern technologies."
              },
              {
                title: "AI & Machine Learning",
                description: "Exploring deep learning, data science, and intelligent automation to build smarter applications."
              },
              {
                title: "Full Stack Solutions",
                description: "Delivering comprehensive solutions from frontend to backend."
              }
            ].map((service, index) => (
              <div
                key={index}
                className="p-8 rounded-lg bg-background border transition-transform duration-300 hover:translate-y-[-4px]"
              >
                <h3 className="text-xl mb-4">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="py-24">
        <div className="container">
          <div className="flex justify-between items-end mb-12">
            <h2>Featured Projects</h2>
            <Link
              to="/work"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 link-underline"
            >
              View All Projects
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              // Loading state
              [...Array(2)].map((_, index) => (
                <div key={index} className="aspect-[16/9] bg-secondary animate-pulse rounded-lg" />
              ))
            ) : featuredProjects.length > 0 ? (
              // Display random projects
              featuredProjects.map((project, index) => (
                <Link
                  to={`/work?project=${project.id}`}
                  key={index}
                  className="group cursor-pointer overflow-hidden rounded-lg"
                >
                  <div className="aspect-[16/9] bg-secondary flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.03]">
                    {getImageUrl(project) ? (
                      <img
                        src={getImageUrl(project)}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p className="text-muted-foreground">Project preview</p>
                    )}
                  </div>
                  <h3 className="mt-4 text-xl">{project.title}</h3>
                  <p className="text-muted-foreground">{project.category}</p>
                </Link>
              ))
            ) : (
              // Fallback when no projects are found
              [...Array(2)].map((_, index) => (
                <div
                  key={index}
                  className="group cursor-pointer overflow-hidden rounded-lg"
                >
                  <div className="aspect-[16/9] bg-secondary flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.03]">
                    <p className="text-muted-foreground">Project preview</p>
                  </div>
                  <h3 className="mt-4 text-xl">Sample Project</h3>
                  <p className="text-muted-foreground">Web Development</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-secondary">
        <div className="container text-center max-w-3xl mx-auto">
          <h2 className="mb-6">Interested in working together?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-foreground text-background transition-transform duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
