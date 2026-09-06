function Contact() {
    return(
        <section className="contact" id="contact">
            <div className="container contact-content">
                <div className="contact-text">
                    <p className="section-subtitle">Get In Touch</p>
                    <h2>
                        Let's Build Somthing
                        <span>Great Together.</span>
                    </h2>
                    <p>
                        Have an idea or project in mind? We would love to hear from you.
                        Get in touch with our team and let's make it happen.
                    </p>
                    <div className="contact-info">
                        <div>
                            <strong>Email</strong>
                            <p>hello@nexatech.com</p>
                        </div>
                        <div>
                            <strong>Phone</strong>
                            <p>+20 100 000 000</p>
                        </div>
                        </div>
                        </div>
                <form className="contact-form">
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Your name"
                            />
                            </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Your email"
                            />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Message</label>
                        <textarea
                            id="message"
                            rows="5"
                            placeholder="Tell us about your project...."
                            ></textarea>
                    </div>

                    <button type="submit" className="form-button">
                        Send Message
                    </button>
                </form>
            </div>
        </section>
    );
}
export default Contact;