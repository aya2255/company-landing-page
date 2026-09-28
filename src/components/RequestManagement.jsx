import { useEffect, useState } from "react";

function RequestManagement() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // Search & Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [services, setServices] = useState([]);

  // Fetch requests from backend
  const fetchRequests = async () => {
    const token = localStorage.getItem("token");

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (statusFilter !== "All") {
        params.append("status", statusFilter);
      }

      if (serviceFilter !== "All") {
        params.append("service_id", serviceFilter);
      }

      const response = await fetch(
        `http://localhost:5000/api/requests?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to load requests.");
    }
  };

  // Fetch services from backend
  const fetchServices = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/services"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  // Load requests and services when page opens
  useEffect(() => {
    fetchRequests();
    fetchServices();
  }, []);

  // Update request status
  const handleStatusChange = async (id, newStatus) => {
    setStatus("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/requests/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStatus(data.message);

      // Refresh using current search/filter values
      fetchRequests();
    } catch (error) {
      console.error(error);
      setError(
        error.message || "Failed to update request status."
      );
    }
  };

  // Reset all filters
  const handleReset = () => {
    setSearch("");
    setStatusFilter("All");
    setServiceFilter("All");

    // Fetch all requests again
    setTimeout(() => {
      const token = localStorage.getItem("token");

      fetch(
        "http://localhost:5000/api/requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          setRequests(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error(error);
          setError("Failed to reset requests.");
        });
    }, 0);
  };

  return (
    <section className="request-management-section">
      <div className="request-management-container">
        <p className="section-subtitle">
          REQUEST MANAGEMENT
        </p>

        <h2>Customer Requests</h2>

        {/* Search & Filters */}
        <div className="request-filters">

          {/* Search */}
          <input
            type="text"
            placeholder="Search by customer, email, service or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="request-search"
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="request-filter-select"
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Completed">
              Completed
            </option>

            <option value="Rejected">
              Rejected
            </option>
          </select>

          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) =>
              setServiceFilter(e.target.value)
            }
            className="request-filter-select"
          >
            <option value="All">
              All Services
            </option>

            {services.map((service) => (
              <option
                key={service.id}
                value={service.id}
              >
                {service.title}
              </option>
            ))}
          </select>

          {/* Buttons */}
          <div className="request-filter-buttons">
            <button
              type="button"
              onClick={fetchRequests}
              className="form-button"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="reset-button"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Messages */}
        {status && (
          <p className="auth-success">
            {status}
          </p>
        )}

        {error && (
          <p className="auth-error">
            {error}
          </p>
        )}

        {/* Requests */}
        <div className="requests-list">
          {requests.length === 0 ? (
            <p>
              No requests found.
            </p>
          ) : (
            requests.map((request) => (
              <div
                className="request-card"
                key={request.id}
              >
                <div className="request-info">
                  <h3>
                    Request #{request.id}
                  </h3>

                  <p>
                    <strong>Customer:</strong>{" "}
                    {request.customer_name}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {request.customer_email}
                  </p>

                  <p>
                    <strong>Service:</strong>{" "}
                    {request.service_title}
                  </p>

                  <p>
                    <strong>Details:</strong>{" "}
                    {request.details}
                  </p>

                  <p>
                    <strong>Created:</strong>{" "}
                    {request.created_at}
                  </p>
                </div>

                <div className="request-status">
                  <label>Status</label>

                  <select
                    value={request.status}
                    onChange={(e) =>
                      handleStatusChange(
                        request.id,
                        e.target.value
                      )
                    }
                  >
                    <option value="Pending">
                      Pending
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default RequestManagement;