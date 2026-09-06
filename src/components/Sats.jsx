function Stats() {
  const stats = [
    {
      number: "50+",
      label: "Projects Completed",
    },
    {
      number: "30+",
      label: "Happy Clients",
    },
    {
      number: "10+",
      label: "Years Experience",
    },
    {
      number: "15+",
      label: "Team Members",
    },
  ];

  return (
    <section className="stats">
      <div className="container stats-grid">
        {stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <h3>{stat.number}</h3>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Stats;