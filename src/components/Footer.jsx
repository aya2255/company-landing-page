function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">

        <div>
          <a href="#" className="logo footer-logo">
            Nexa<span>Tech</span>
          </a>

          <p>
            Building digital solutions for a better future.
          </p>
        </div>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>

      </div>

      <div className="container footer-bottom">
        <p>© 2026 NexaTech. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;