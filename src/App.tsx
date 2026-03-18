import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import FadeTransition from "./components/transitions/FadeTransition";
import BirdsTransition from "./components/transitions/BirdsTransition";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./lib/AuthContext";

const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Work = lazy(() => import("./pages/Work"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <BirdsTransition />
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Layout><FadeTransition><Index /></FadeTransition></Layout>} />
                <Route path="/about" element={<Layout><FadeTransition><About /></FadeTransition></Layout>} />
                <Route path="/work" element={<Layout><FadeTransition><Work /></FadeTransition></Layout>} />
                <Route path="/contact" element={<Layout><FadeTransition><Contact /></FadeTransition></Layout>} />
                <Route path="/login" element={<FadeTransition><Login /></FadeTransition>} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<Layout><FadeTransition><NotFound /></FadeTransition></Layout>} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
