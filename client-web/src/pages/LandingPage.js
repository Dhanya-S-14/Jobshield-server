import React, { useEffect, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeatureCards from '../components/landing/FeatureCards';
import StatsCounter from '../components/landing/StatsCounter';
import PublicReports from '../components/landing/PublicReports';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-group').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <Navbar />
      <HeroSection />
      <StatsCounter />
      <FeatureCards />
      <PublicReports />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
};

export default LandingPage;
