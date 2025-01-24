import React from "react";

const Footer = () => {
  return (
    <footer className="bg-light text-dark py-4 shadow-sm">
      <div className="container">
        <div className="row">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p
              style={{
                fontWeight: "600",
                fontFamily: "Poppins, sans-serif",
                fontSize: "1.1rem",
              }}
            >
              Task Manager - Your Productivity Companion
            </p>
          </div>

          <div className="col-md-6 text-center text-md-end">
            <p
              style={{
                fontWeight: "400",
                fontFamily: "Poppins, sans-serif",
                fontSize: "0.875rem",
                marginBottom: "0.5rem",
              }}
            >
              <a
                href="https://tejanarra.github.io/portfolio/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
                style={{
                  fontWeight: "600",
                  color: "inherit",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Suggestions / Get in touch?
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
