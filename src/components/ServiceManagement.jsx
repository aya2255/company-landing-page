import { useEffect, useState } from "react";

function ServiceManagement() {
  const [services, setServices] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

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
      setError(error.message || "Failed to fetch services.");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const url = editingId
        ? `http://localhost:5000/api/services/${editingId}`
        : "http://localhost:5000/api/services";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStatus(
        editingId
          ? "Service updated successfully!"
          : "Service created successfully!"
      );

      setTitle("");
      setDescription("");
      setEditingId(null);

      fetchServices();
    } catch (error) {
      setError(error.message || "Something went wrong.");
    }
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setTitle(service.title);
    setDescription(service.description);

    setStatus("");
    setError("");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmDelete) return;

    setStatus("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/services/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStatus("Service deleted successfully!");

      fetchServices();
    } catch (error) {
      setError(error.message || "Failed to delete service.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setStatus("");
    setError("");
  };

  return (
    <section className="service-management-section">
      <div className="service-management-container">
        <p className="section-subtitle">SERVICE MANAGEMENT</p>

        <h2>Manage Company Services</h2>

        <form
          onSubmit={handleSubmit}
          className="service-management-form"
        >
          <input
            type="text"
            placeholder="Service title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Service description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
          />

          <div className="service-form-buttons">
            <button type="submit" className="form-button">
              {editingId ? "Update Service" : "Add Service"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {status && <p className="auth-success">{status}</p>}
        {error && <p className="auth-error">{error}</p>}

        <div className="services-list">
          <h3>All Services</h3>

          {services.length === 0 ? (
            <p>No services available.</p>
          ) : (
            services.map((service) => (
              <div className="service-item" key={service.id}>
                <div>
                  <h4>{service.title}</h4>
                  <p>{service.description}</p>
                </div>

                <div className="service-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(service)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => handleDelete(service.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default ServiceManagement;