
import { useEffect, useRef, useState } from 'react';
import ProjectDialog, { ProjectDetails } from '@/components/ProjectDialog';

const Work = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const projects: ProjectDetails[] = [
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

  const handleProjectClick = (project: ProjectDetails) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="opacity-0" ref={titleRef}>
              My Work
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Selected projects that showcase my skills in web and game development.
            </p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-16">
        <div className="container">
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 opacity-0"
            ref={projectsRef}
            style={{ animationDelay: '0.3s' }}
          >
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-lg overflow-hidden"
                onClick={() => handleProjectClick(project)}
              >
                <div
                  className={`aspect-video bg-secondary rounded-lg mb-6 flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.02]`}
                >
                  <p className="text-muted-foreground">Project image</p>
                </div>
                <div className='p-4'>
                  <h3 className="text-2xl mb-2">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{project.category}</p>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-secondary">
        <div className="container">
          <h2 className="text-center mb-16">My Development Process</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "01", title: "Research & Planning", description: "Understanding requirements and planning the approach." },
              { number: "02", title: "Design & Prototype", description: "Creating wireframes and initial prototypes." },
              { number: "03", title: "Development", description: "Implementing the solution with clean, maintainable code." },
              { number: "04", title: "Testing & Deployment", description: "Thorough testing and smooth deployment." }
            ].map((step, index) => (
              <div
                key={index}
                className="relative transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl font-light text-primary/20 mb-4">{step.number}</div>
                <h3 className="text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
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

export default Work;