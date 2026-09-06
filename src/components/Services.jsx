function Services() {
  const services = [
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      title: "Web Development",
      description:
        "We build fast, responsive, and user-friendly websites tailored to your business needs.",
    },
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
      title: "UI/UX Design",
      description:
        "We create clean and engaging interfaces that provide a smooth and enjoyable user experience.",
    },
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v4" />
          <path d="M12 18v4" />
          <path d="M4.93 4.93l2.83 2.83" />
          <path d="M16.24 16.24l2.83 2.83" />
          <path d="M2 12h4" />
          <path d="M18 12h4" />
          <path d="M4.93 19.07l2.83-2.83" />
          <path d="M16.24 7.76l2.83-2.83" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
      title: "Digital Solutions",
      description:
        "We develop smart digital solutions that help businesses grow, improve, and reach their goals.",
    },
  ];

  return (
    <section className="services" id="services">
      <div className="container">
        <div className="section-heading">
          <p className="section-subtitle">OUR SERVICES</p>

          <h2>
            Solutions Designed For
            <span> Your Success.</span>
          </h2>

          <p>
            We provide modern digital services that help businesses
            turn their ideas into successful products.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div className="service-card" key={service.title}>
              <div className="service-icon">{service.icon}</div>

              <h3>{service.title}</h3>

              <p>{service.description}</p>

              <a href="#contact">Learn More →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
