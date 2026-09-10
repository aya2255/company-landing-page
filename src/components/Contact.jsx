import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     
    if (
  !formData.name ||
  !formData.email ||
  !formData.subject ||
  !formData.message
) {
  setStatus({
    type: "error",
    message: "Please fill in all fields.",
  });

  return;
}
    setStatus({
      type: "",
      message: "",
    });

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStatus({
        type: "success",
        message: data.message,
      });

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="container contact-content">

        <div className="contact-text">
          <p className="section-subtitle">GET IN TOUCH</p>

          <h2>
            Let's Build Something
            <span> Great Together.</span>
          </h2>

          <p>
            Have an idea or a project in mind? We'd love to hear from you.
            Get in touch with our team and let's make it happen.
          </p>

          <div className="contact-info">
            <div>
              <strong>Email</strong>
              <p>hello@nexatech.com</p>
            </div>

            <div>
              <strong>Phone</strong>
              <p>+20 100 000 0000</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your project..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="form-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>

          {status.message && (
            <p
              className={
                status.type === "success"
                  ? "success-message"
                  : "error-message"
              }
            >
              {status.message}
            </p>
          )}

        </form>

      </div>
    </section>
  );
}

export default Contact;