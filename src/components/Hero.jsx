function Hero () {
    return (
        <section cllassName="hero" id="home">
            <div className="container hero-content">
                <div className="hero-text">
                    <p className="hero-subtitle">INNOVATE. CREATE. GROW.</p>
                    <h1>
                        We Build Digital Solutions
                        <span>That Move Businesses Forward</span>
                    </h1>
                    <p className="hero-description">
                        We help businesses transform their ideas into powerful 
                        digital experiences that create real impact.
                        </p>

                        <div className="hero-buttons">
                            <a href="#contact" className="primary-button">
                                Get Started
                            </a>
                            <a href="#about" className="secondary-button">
                                Learn More
                                </a>
                        </div>
                </div>
                <div className="hero-visual">
                    <div className="visual-card">
                        <div className="circle"></div>
                        <div className="visual-content">
                            <span>Digital</span>
                            <strong>Innovation</strong>
                            <small>Turnning Ideas into Reality</small>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
export default Hero;