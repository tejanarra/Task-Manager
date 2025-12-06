import  { useRef } from "react";
import { Link } from "react-router-dom";
import "./Styles/LandingPage.css";
import heroImage from "../../assets/hero1.jpg";
import { featuresData, benefitsData, testimonialsData } from "./data";
import FeaturesSection from "./FeaturesSection";
import BenefitsSection from "./BenefitsSection";
import TestimonialsSection from "./TestimonialsSection";
import DemoSection from "./DemoSection"; // ✨ Added Demo Section

const LandingPage = ({ theme }) => {
  const featuresRef = useRef(null);
  const demoRef = useRef(null); // ✨ Added demo ref

  // const scrollToFeatures = (e) => {
  //   e.preventDefault();
  //   featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  // };

  // ✨ Added scroll to demo function
  const scrollToDemo = (e) => {
    e.preventDefault();
    demoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={`lp-container ${theme}`}>
      {/* Hero Section - UNCHANGED */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <h1>Your Ultimate Task Manager</h1>
          <p>
            Boost your productivity and stay organized with our intuitive task
            management tools.
          </p>
          <div className="lp-cta-buttons">
            <Link to="/register" className="lp-btn lp-btn-primary">
              Get Started
            </Link>
            {/* ✨ Changed to scroll to demo instead */}
            <button
              onClick={scrollToDemo}
              className="lp-btn lp-btn-secondary"
            >
              Watch Demo
            </button>
          </div>
        </div>
        <div className="lp-hero-image">
          <img
            style={{
              filter: theme === "dark" ? "invert(1) grayscale(100%)" : "none",
            }}
            src={heroImage}
            alt="Task Manager Illustration"
          />
        </div>
      </section>

      {/* ✨ NEW: Demo Section */}
      <div ref={demoRef}>
        <DemoSection theme={theme} />
      </div>

      {/* Features Section - UNCHANGED */}
      <FeaturesSection
        features={featuresData}
        featuresRef={featuresRef}
        theme={theme}
      />

      {/* Benefits Section - UNCHANGED */}
      <BenefitsSection benefits={benefitsData} />

      {/* Testimonials Section - UNCHANGED */}
      <TestimonialsSection testimonials={testimonialsData} />

      {/* CTA Section - UNCHANGED */}
      <section className="lp-cta">
        <h2>Ready to Boost Your Productivity?</h2>
        <Link to="/register" className="lp-btn-secondary lp-btn">
          Sign Up Now
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;