import { useEffect, useRef, useState } from 'react';
import ProjectDialog, { ProjectDetails } from '@/components/ProjectDialog';
import { getProjects } from '@/lib/api';

const Work = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [projects, setProjects] = useState<ProjectDetails[]>([]);
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
    if (projectsRef.current) observer.observe(projectsRef.current);

    return () => observer.disconnect();
  }, []);

  // Fetch projects data from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getProjects();

        if (data && data.length > 0) {
          const testProjects = data.filter(p => p.title.includes('TEST'));
          const otherProjects = data.filter(p => !p.title.includes('TEST'));

          if (testProjects.length > 0) {
            setProjects([...testProjects, ...otherProjects]);
          } else {
            const testProject = fallbackProjects.find(p => p.title === 'TEST');
            if (testProject) {
              setProjects([testProject, ...data]);
            } else {
              setProjects(data);
            }
          }
        } else {
          // If no data, use fallback
          setProjects(fallbackProjects);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load projects. Please try again later.');
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Debug function to check project images
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';

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
  };

  const handleProjectClick = (project: ProjectDetails) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Portfolio</p>
            <h1 className="opacity-0" ref={titleRef}>
              My Work
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              Selected projects that showcase my skills in web development, AI, and full stack solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-16">
        <div className="container">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
              ref={projectsRef}
              style={{ animationDelay: '0.3s' }}
            >
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-black/[0.04] dark:hover:shadow-black/20 rounded-2xl overflow-hidden border border-border/50 bg-card hover:border-border"
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="aspect-video bg-secondary relative overflow-hidden">
                    {project.images && project.images.length > 0 ? (
                      <img
                        src={getImageUrl(project.images[0])}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-muted-foreground">No project image</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{project.category}</p>
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>

                    {project.technologies && project.technologies.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 3).map((tech, index) => (
                          <span key={index} className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary/80 text-muted-foreground">
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary/80 text-muted-foreground">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Process Section */}
      <section className="py-28 bg-secondary/50">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">Workflow</p>
            <h2>My Development Process</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { number: "01", title: "Research & Planning", description: "Understanding requirements and planning the approach." },
              { number: "02", title: "Design & Prototype", description: "Creating wireframes and initial prototypes." },
              { number: "03", title: "Development", description: "Implementing the solution with clean, maintainable code." },
              { number: "04", title: "Testing & Deployment", description: "Thorough testing and smooth deployment." }
            ].map((step, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-background border border-border/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/[0.03] dark:hover:shadow-black/20 hover:border-border"
              >
                <div className="font-heading text-5xl font-bold text-primary/[0.07] mb-4 transition-colors duration-500 group-hover:text-primary/[0.12]">{step.number}</div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Dialog */}
      <ProjectDialog
        project={selectedProject}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

// Fallback data in case API fails
const fallbackProjects: ProjectDetails[] = [
  {
    id: "1",
    title: "Unreal Engine Adventure Game",
    category: "Game Development",
    description: "A third-person adventure game with realistic visuals and physics.",
    longDescription: "A fully immersive third-person adventure game developed with Unreal Engine. Features include realistic visuals with dynamic lighting, advanced AI behavior systems, interactive environments, and a unique narrative that adapts to player choices. The game incorporates custom character animations and a procedurally generated world.",
    technologies: ["Unreal Engine", "C++", "Blueprint", "Niagara VFX", "SpeedTree"],
    images: ["game1.jpg", "game2.jpg", "game3.jpg"]
  },
  {
    id: "2",
    title: "React E-Commerce Platform",
    category: "Web Development",
    description: "A full-featured online shopping platform with payment integration.",
    longDescription: "A comprehensive e-commerce solution built with React and Node.js. The platform includes user authentication, product management, shopping cart functionality, checkout process with Stripe integration, and an admin dashboard for inventory management. The application is fully responsive and optimized for performance.",
    technologies: ["React", "Node.js", "Express", "MongoDB", "Stripe API", "Redux"],
    images: ["ecommerce1.jpg", "ecommerce2.jpg"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/nakhlerizk/ecommerce"
  },
  {
    id: "3",
    title: "Unity Mobile Game",
    category: "Game Development",
    description: "A casual mobile game with engaging mechanics and monetization.",
    longDescription: "A casual mobile game developed with Unity targeting iOS and Android platforms. The game features intuitive touch controls, progressive difficulty, in-app purchases, ad integration, and social features. Special attention was paid to optimizing performance for a wide range of mobile devices.",
    technologies: ["Unity", "C#", "Mobile SDK", "Firebase", "AdMob"],
    images: ["mobile-game1.jpg", "mobile-game2.jpg"]
  },
  {
    id: "4",
    title: "Real-time Analytics Dashboard",
    category: "Full Stack Development",
    description: "A data visualization platform with real-time updates and filters.",
    longDescription: "An advanced analytics dashboard that provides real-time data visualization for business metrics. The application features interactive charts, customizable widgets, data filtering capabilities, and automated reporting. Built with a scalable architecture to handle large datasets with minimal latency.",
    technologies: ["Vue.js", "D3.js", "Node.js", "WebSockets", "PostgreSQL"],
    images: ["dashboard1.jpg", "dashboard2.jpg"]
  },
  {
    id: "5",
    title: "Godot 2D Platformer",
    category: "Game Development",
    description: "A retro-styled 2D platformer with unique puzzle elements.",
    longDescription: "A 2D platformer game developed with Godot Engine featuring pixel art graphics, custom physics, innovative puzzle mechanisms, and a chiptune soundtrack. The game includes multiple levels with increasing difficulty, boss fights, and hidden collectibles throughout the game world.",
    technologies: ["Godot Engine", "GDScript", "Pixel Art", "Tiled Map Editor"],
    images: ["platformer1.jpg", "platformer2.jpg"]
  },
  {
    id: "6",
    title: "Progressive Web App",
    category: "Frontend Development",
    description: "A PWA with offline capabilities and push notifications.",
    longDescription: "A Progressive Web Application that delivers a native-like experience across all devices. The app features offline functionality using Service Workers, push notifications, home screen installation, and optimized loading times. The interface is fully responsive and adapts to different screen sizes.",
    technologies: ["React", "TypeScript", "PWA", "Service Workers", "IndexedDB"],
    images: ["pwa1.jpg", "pwa2.jpg"],
    githubUrl: "https://github.com/nakhlerizk/pwa-project"
  }
];

export default Work;