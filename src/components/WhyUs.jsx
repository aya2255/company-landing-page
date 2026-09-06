function WhyUs() {
  const reasons = [
    {
      icon: "✓",
      title: "Experienced Team",
      description:
        "Our team combines technical expertise with creative thinking to deliver quality solutions.",
    },
    {
      icon: "⚡",
      title: "Fast & Reliable",
      description:
        "We focus on building efficient solutions while maintaining high standards of quality.",
    },
    {
      icon: "💡",
      title: "Creative Approach",
      description:
        "We turn complex ideas into simple, practical, and engaging digital experiences.",
    },
  ];

  return (
    <section className="why-us">
      <div className="container why-content">

        <div className="why-text">
          <p className="section-subtitle">WHY CHOOSE US</p>

          <h2>
            We Build More Than
            <span> Just Websites.</span>
          </h2>

          <p>
            We believe that great digital products are built by combining
            technology, creativity, and a clear understanding of our clients'
            goals.
          </p>

          <a href="#contact" className="primary-button">
            Work With Us
          </a>
        </div>

        <div className="reasons-list">
          {reasons.map((reason) => (
            <div className="reason-item" key={reason.title}>
              <div className="reason-icon">
                {reason.icon}
              </div>

              <div>
                <h3>{reason.title}</h3>
                <p>{reason.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default WhyUs;