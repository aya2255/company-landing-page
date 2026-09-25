import { useEffect, useState } from "react";

function CustomerRequest() {
  const [services, setServices] = useState([]);

  const [serviceId, setServiceId] = useState("");
  const [details, setDetails] = useState("");

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/services"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setServices(data);
      } catch (error) {
        setError(error.message || "Failed to load services.");
      }
    };

    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus("");
    setError("");

    if (!serviceId || !details.trim()) {
      setError("Please select a service and enter your request details.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            service_id: Number(serviceId),
            details,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStatus("Request submitted successfully!");

      setServiceId("");
      setDetails("");
    } catch (error) {
      setError(error.message || "Failed to submit request.");
    }
  };

  return (
    <section className="customer-request-section">
      <div className="customer-request-container">
        <p className="section-subtitle">SERVICE REQUEST</p>

        <h2>Request a Service</h2>

        <p className="request-description">
          Choose a service and tell us what you need.
        </p>

        <form
          onSubmit={handleSubmit}
          className="customer-request-form"
        >
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          >
            <option value="">Select a service</option>

            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Describe what you need..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows="6"
          />

          <button type="submit" className="form-button">
            Submit Request
          </button>
        </form>

        {status && <p className="auth-success">{status}</p>}
        {error && <p className="auth-error">{error}</p>}
      </div>
    </section>
  );
}

export default CustomerRequest;