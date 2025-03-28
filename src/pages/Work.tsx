
import { useEffect, useRef } from 'react';

const Work = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

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

  const projects = [
    {
      title: "Craft Apparel",
      category: "Branding, E-commerce",
      description: "A minimalist clothing brand with a focus on sustainability and ethical production.",
      image: "bg-[#f5f5f5]"
    },
    {
      title: "Lumina App",
      category: "UI/UX, Mobile App",
      description: "A meditation and mindfulness app with a clean, calming interface.",
      image: "bg-[#f0f0f0]"
    },
    {
      title: "Savor Restaurant",
      category: "Web Design, Branding",
      description: "A fine dining restaurant with a modern, elegant online presence.",
      image: "bg-[#ebebeb]"
    },
    {
      title: "Zenith Analytics",
      category: "Web Application, Dashboard",
      description: "A data visualization platform for enterprise businesses.",
      image: "bg-[#e6e6e6]"
    },
    {
      title: "Nomad Travel",
      category: "Website, Mobile App",
      description: "A travel platform connecting adventurers with unique experiences.",
      image: "bg-[#e1e1e1]"
    },
    {
      title: "Rhythm Music",
      category: "Branding, Website",
      description: "A music streaming service with a focus on independent artists.",
      image: "bg-[#dcdcdc]"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="opacity-0" ref={titleRef}>
              Our Work
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Selected projects that showcase our approach to design and development.
            </p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-16">
        <div className="container">
          <div 
            className="grid grid-cols-1 md:grid-cols-2 gap-12 opacity-0" 
            ref={projectsRef}
            style={{ animationDelay: '0.3s' }}
          >
            {projects.map((project, index) => (
              <div 
                key={index} 
                className="group cursor-pointer"
              >
                <div 
                  className={`aspect-video ${project.image} rounded-lg mb-6 flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.02]`}
                >
                  <p className="text-muted-foreground">Project image</p>
                </div>
                <h3 className="text-2xl mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{project.category}</p>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-secondary">
        <div className="container">
          <h2 className="text-center mb-16">Our Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "01", title: "Discovery", description: "Understanding goals, audience, and context." },
              { number: "02", title: "Strategy", description: "Planning the approach and defining success metrics." },
              { number: "03", title: "Design", description: "Creating intuitive, elegant solutions." },
              { number: "04", title: "Development", description: "Building with precision and attention to detail." }
            ].map((step, index) => (
              <div 
                key={index} 
                className="relative"
              >
                <div className="text-4xl font-light text-primary/20 mb-4">{step.number}</div>
                <h3 className="text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Work;
