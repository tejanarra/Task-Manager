import React, { useRef } from "react";
import { Link } from "react-router-dom";
import "../../Styles/LandingPage.css";
import heroImage from "../../assets/hero1.jpg";
import { featuresData } from "./data";
import { benefitsData } from "./data";
import { testimonialsData } from "./data";
import FeaturesSection from "./FeaturesSection";
import BenefitsSection from "./BenefitsSection";
import TestimonialsSection from "./TestimonialsSection";

const LandingPage = ({ theme }) => {
  const featuresRef = useRef(null);

  const scrollToFeatures = (e) => {
    e.preventDefault();
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={`lp-container ${theme}`}>
      {/* Hero Section */}
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
            <Link
              to="/feature"
              href="#features"
              onClick={scrollToFeatures}
              className="lp-btn lp-btn-secondary"
            >
              Learn More
            </Link>
          </div>
        </div>
        <div className="lp-hero-image">
          <img
            style={{
              filter: theme === "dark" ? "invert(1) grayscale(100%)" : "none",
            }}
            src={theme === "dark" ? heroImage : heroImage}
            alt="Task Manager Illustration"
          />
        </div>
      </section>

      <FeaturesSection
        features={featuresData}
        featuresRef={featuresRef}
        theme={theme}
      />
      <BenefitsSection benefits={benefitsData} />
      <TestimonialsSection testimonials={testimonialsData} />

      {/* Call to Action Section */}
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
