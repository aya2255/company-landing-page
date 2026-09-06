function Navbar() {
    return(
        <nav className="navbar">
            <div className="container navbar-content">
                <a href="#" className="logo">
                    Nexa<span>Tech</span>
                </a>
                <div className="nav-links">
                    <a href="#home">Home</a>
                    <a href="#about">About</a>
                    <a href="#services">Services</a>
                    <a href="#contact">Contact</a>
                </div>
                <a href="#contact" className="nav-button">
                    Get Started
                </a>
            </div>
        </nav>
    );
}
export default Navbar;