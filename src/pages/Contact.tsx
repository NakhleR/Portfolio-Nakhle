import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import emailjs from '@emailjs/browser';
import { DisplacementSphere } from '@/components/DisplacementSphere/DisplacementSphere';
import ReCAPTCHA from 'react-google-recaptcha';
import { useTheme } from '@/components/ThemeProvider';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Contact = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);

  const { theme: appTheme } = useTheme();
  const [effectiveRecaptchaTheme, setEffectiveRecaptchaTheme] = useState<'light' | 'dark'>('light');

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

  useEffect(() => {
    let systemThemeMediaQuery: MediaQueryList | null = null;

    const updateRecaptchaTheme = () => {
      let currentTheme: 'light' | 'dark';
      if (appTheme === 'system') {
        currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        currentTheme = appTheme;
      }
      setEffectiveRecaptchaTheme(currentTheme);
    };

    updateRecaptchaTheme();

    if (appTheme === 'system') {
      systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      systemThemeMediaQuery.addEventListener('change', updateRecaptchaTheme);
    }

    return () => {
      if (systemThemeMediaQuery) {
        systemThemeMediaQuery.removeEventListener('change', updateRecaptchaTheme);
      }
    };
  }, [appTheme]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recaptchaValue) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }

    setLoading(true);
    setError('');

    const serviceId = 'service_ar732mj';
    const templateId = 'template_0wys03s';
    const publicKey = 'GODvbfC6zE6uiLGdl';

    const templateParams = {
      from_name: name,
      from_email: email,
      message: message,
      title: 'Contact Us: ' + name,
      'g-recaptcha-response': recaptchaValue
    };

    emailjs.send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        console.log('Email sent successfully:', response);
        setSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
        setRecaptchaValue(null);

        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }

        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      })
      .catch((err) => {
        console.error('Failed to send email:', err);
        setError('Failed to send your message. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRecaptchaChange = (value: string | null) => {
    setRecaptchaValue(value);
    if (value) {
      setError('');
    }
  };

  return (
    <div className="min-h-screen relative">
      <DisplacementSphere />

      <section className="py-16 md:py-24 relative">
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

      <section className="py-16 relative">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="opacity-0 bg-background/80 rounded-lg p-8" ref={formRef} style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl mb-8">Contact Us</h2>

              {submitted ? (
                <div className="p-6 bg-secondary rounded-lg text-center">
                  <h3 className="text-xl mb-2">Thank you!</h3>
                  <p className="text-muted-foreground">
                    We've received your message and will respond as soon as possible.
                  </p>
                </div>
              ) : error ? (
                <div className="p-6 bg-red-100 rounded-lg text-center mb-6">
                  <h3 className="text-xl mb-2 text-red-700">Error</h3>
                  <p className="text-red-600">
                    {error}
                  </p>
                  <button
                    onClick={() => setError('')}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Try Again
                  </button>
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

                  <div className="my-4">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey="6LeoBS0rAAAAAORVXUsDnnw1wkzeglzTZtRBDiSL"
                      onChange={handleRecaptchaChange}
                      theme={effectiveRecaptchaTheme}
                    />
                    {error && error.includes('reCAPTCHA') && (
                      <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !recaptchaValue}
                    className={`inline-flex items-center justify-center h-12 px-8 rounded-md bg-foreground text-background transition-transform duration-200 ease-in-out ${(loading || !recaptchaValue) ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            <div
              className="opacity-0 bg-background/80 rounded-lg p-8"
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
                <div className="aspect-[16/9] rounded-lg overflow-hidden mt-8">
                  <MapContainer
                    center={[49.4431, 1.0993]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-lg z-0"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[49.4431, 1.0993]}>
                      <Popup>
                        Rue De Fontenelle<br />
                        Rouen 76000<br />
                        France
                      </Popup>
                    </Marker>
                  </MapContainer>
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
