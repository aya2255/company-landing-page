import { useEffect, useState } from "react";

function ContentManagement() {
  const token = localStorage.getItem("token");
  const [content, setContent] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");

  const fetchContent = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/content", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
      const data = await response.json();
      setContent(data);
    } catch (error) {
      setStatus("Failed to load content.");
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      setStatus("Please fill in all fields.");
      return;
    }

    try {
      const url = editingId
        ? `http://localhost:5000/api/content/${editingId}`
        : "http://localhost:5000/api/content";

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

      setStatus(data.message);
      setTitle("");
      setDescription("");
      setEditingId(null);

      fetchContent();
    } catch (error) {
      setStatus(error.message || "Something went wrong.");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setStatus("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this content?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/content/${id}`,
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

      setStatus(data.message);
      fetchContent();
    } catch (error) {
      setStatus(error.message || "Something went wrong.");
    }
  };

  return (
    <section className="content-management">
      <div className="container">
        <p className="section-subtitle">ADMIN PANEL</p>

        <h2>Content Management</h2>

        <form onSubmit={handleSubmit} className="content-form">
          <input
            type="text"
            placeholder="Content title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Content description"
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit" className="form-button">
            {editingId ? "Update Content" : "Add Content"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setEditingId(null);
                setTitle("");
                setDescription("");
              }}
            >
              Cancel
            </button>
          )}
        </form>

        {status && <p className="content-status">{status}</p>}

        <div className="content-list">
          {content.length === 0 ? (
            <p>No content available.</p>
          ) : (
            content.map((item) => (
              <div className="content-item" key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <div className="content-actions">
                  <button onClick={() => handleEdit(item)}>Edit</button>

                  <button onClick={() => handleDelete(item.id)}>
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

export default ContentManagement;