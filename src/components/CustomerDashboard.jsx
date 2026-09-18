import { useEffect, useState } from "react";

function CustomerDashboard() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/user/profile",
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

      setProfile(data);
      setName(data.name);
    } catch (error) {
      setError(error.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    setStatus("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/user/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setProfile(data.user);
      setName(data.user.name);
      setStatus("Profile updated successfully!");
    } catch (error) {
      setError(error.message || "Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <section className="dashboard-section">
        <div className="dashboard-container">
          <p>Loading your profile...</p>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="dashboard-section">
        <div className="dashboard-container">
          <p className="auth-error">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-section">
      <div className="dashboard-container">
        <p className="section-subtitle">CUSTOMER DASHBOARD</p>

        <h2>My Account</h2>

        <div className="profile-card">
          <div className="profile-info">
            <p>
              <strong>Email:</strong> {profile.email}
            </p>

            <p>
              <strong>User ID:</strong> {profile.id}
            </p>
          </div>

          <form onSubmit={handleUpdate} className="dashboard-form">
            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />

            <button type="submit" className="form-button">
              Save Changes
            </button>
          </form>

          {status && <p className="auth-success">{status}</p>}
          {error && <p className="auth-error">{error}</p>}
        </div>
      </div>
    </section>
  );
}

export default CustomerDashboard;