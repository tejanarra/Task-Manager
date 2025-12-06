"use client";

const BenefitsSection = ({ benefits }) => (
  <section className="lp-benefits">
    <h2>Why Choose Us?</h2>
    <div className="lp-benefits-container">
      {benefits.map(benefit => (
        <div key={benefit.title} className="lp-benefit">
          <i className={benefit.icon}></i>
          <h4>{benefit.title}</h4>
          <p>{benefit.description}</p>
        </div>
      ))}
    </div>
  </section>
);

export default BenefitsSection;