import React from "react";

const TestimonialsSection = ({ testimonials }) => (
  <section className="lp-testimonials">
    <h2>What Our Users Say</h2>
    <div className="lp-testimonials-container">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="lp-testimonial">
          {" "}
          <p>"{testimonial.quote}"</p>
        </div>
      ))}
    </div>
  </section>
);

export default TestimonialsSection;
