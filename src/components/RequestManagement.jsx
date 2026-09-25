import { useEffect, useState } from "react";

function RequestManagement() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/requests",
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

  useEffect(() => {
    fetchRequests();
  }, []);

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

      fetchRequests();
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to update request status.");
    }
  };

  return (
    <section className="request-management-section">
      <div className="request-management-container">
        <p className="section-subtitle">REQUEST MANAGEMENT</p>

        <h2>Customer Requests</h2>

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

        <div className="requests-list">
          {requests.length === 0 ? (
            <p>No requests available.</p>
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