import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headingRef, { once: true, margin: '-15%' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end end'],
  });

  // "ther." lifts off as user scrolls
  const liftY = useTransform(scrollYProgress, [0.4, 0.85], [0, -48]);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Work', to: '/work' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  const socialLinks = [
    { label: 'GitHub', href: 'https://github.com/NakhleR' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nakhle-rizk-528129256/' },
  ];

  return (
    <footer ref={sectionRef} className="relative overflow-hidden">
      {/* Divider */}
      <div className="container">
        <div className="h-px bg-border/50" />
      </div>

      {/* Main CTA area */}
      <div className="container py-24 md:py-36 lg:py-44">
        <div ref={headingRef}>
          <motion.p
            className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em] mb-8"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            Have a project in mind?
          </motion.p>

          <Link to="/contact" className="group inline-block">
            {/* Line 1: "Let's work" */}
            <div className="overflow-hidden">
              <motion.div
                className="text-[clamp(3rem,10vw,9rem)] font-heading font-semibold leading-[0.95] tracking-tight"
                initial={{ y: '100%' }}
                animate={isInView ? { y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                Let's work
              </motion.div>
            </div>

            {/* Line 2: "toge" + "ther." (ther. lifts off) */}
            <div className="overflow-visible flex items-baseline">
              <div className="overflow-hidden">
                <motion.div
                  className="text-[clamp(3rem,10vw,9rem)] font-heading font-semibold leading-[0.95] tracking-tight"
                  initial={{ y: '100%' }}
                  animate={isInView ? { y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  toge
                </motion.div>
              </div>
              {/* Scroll lift wrapper for "ther." + arrow */}
              <motion.div className="flex items-baseline" style={{ y: liftY }}>
                <motion.div
                  className="text-[clamp(3rem,10vw,9rem)] font-heading font-semibold leading-[0.95] tracking-tight origin-bottom-left"
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  ther.
                </motion.div>

                {/* Arrow */}
                <motion.div
                  className="ml-4 md:ml-8 self-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full border border-foreground/20 flex items-center justify-center transition-all duration-500 group-hover:bg-foreground group-hover:border-foreground group-hover:scale-110">
                    <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 transition-all duration-500 group-hover:text-background group-hover:rotate-45" />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom section */}
      <div className="container pb-8">
        <div className="h-px bg-border/50 mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <p className="text-xs text-muted-foreground order-3 md:order-1">
            &copy; {new Date().getFullYear()} Nakhle Rizk
          </p>

          {/* Nav links */}
          <div className="flex items-center gap-8 order-1 md:order-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social links */}
          <div className="flex items-center gap-6 order-2 md:order-3">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
