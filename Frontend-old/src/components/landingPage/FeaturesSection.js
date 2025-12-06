const FeaturesSection = ({ features, theme, featuresRef }) => (
  <section className="lp-features" id="features" ref={featuresRef}>
    <h1>Features</h1>
    <div className="lp-features-container">
      {features.map((feature, index) => (
        <div
          key={feature.title}
          className="lp-feature-item"
          style={{ flexDirection: index % 2 === 0 ? "row" : "row-reverse" }}
        >
          <div className="lp-feature-content">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
          <div className="lp-feature-image">
            <a
              href="http://www.freepik.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                style={{
                  filter:
                    theme === "dark" ? "invert(1) grayscale(100%)" : "none",
                }}
                src={feature.image}
                alt={feature.alt}
              />
            </a>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturesSection;
