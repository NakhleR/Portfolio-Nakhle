
import { useEffect, useRef, useState } from 'react';

const Contact = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
    if (formRef.current) observer.observe(formRef.current);
    if (infoRef.current) observer.observe(infoRef.current);

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, email, message });
    setSubmitted(true);
    // Reset form
    setName('');
    setEmail('');
    setMessage('');

    // Show submitted state temporarily
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="opacity-0" ref={titleRef}>
              Get in Touch
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Let's discuss how we can help you create something extraordinary.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="opacity-0" ref={formRef} style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl mb-8">Contact Us</h2>

              {submitted ? (
                <div className="p-6 bg-secondary rounded-lg text-center">
                  <h3 className="text-xl mb-2">Thank you!</h3>
                  <p className="text-muted-foreground">
                    We've received your message and will respond as soon as possible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-foreground text-background transition-transform duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>

            <div
              className="opacity-0"
              ref={infoRef}
              style={{ animationDelay: '0.4s' }}
            >
              <h2 className="text-2xl mb-8">Information</h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl mb-2">Address</h3>
                  <p className="text-muted-foreground">
                    Rue De Fontenelle<br />
                    Rouen 76000<br />
                    France
                  </p>
                </div>

                <div>
                  <h3 className="text-xl mb-2">Contact</h3>
                  <p className="text-muted-foreground">
                    Email: nakhler2k2@gmail.com<br />
                    Phone: +33 7 74 81 21 04
                  </p>
                </div>
                <div className="aspect-[16/9] bg-secondary rounded-lg flex items-center justify-center mt-8">
                  <p className="text-muted-foreground">Map</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
