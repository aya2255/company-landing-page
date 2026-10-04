import { useEffect, useState } from "react";

function FileManagement() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/files",
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

      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setError(
        error.message || "Failed to load files."
      );
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    setStatus("");
    setError("");

    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    const formData = new FormData();

    formData.append("file", selectedFile);

    const token = localStorage.getItem("token");

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/files",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStatus(data.message);
      setSelectedFile(null);

      e.target.reset();

      fetchFiles();
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Failed to upload file."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this file?"
    );

    if (!confirmed) return;

    setStatus("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/files/${id}`,
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

      fetchFiles();
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Failed to delete file."
      );
    }
  };

  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <section className="file-management-section">
      <div className="file-management-container">

        <p className="section-subtitle">
          FILE MANAGEMENT
        </p>

        <h2>My Documents</h2>

        <p className="file-description">
          Upload and manage your documents securely.
        </p>

        {/* Upload Form */}

        <form
          className="file-upload-form"
          onSubmit={handleUpload}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) =>
              setSelectedFile(e.target.files[0])
            }
          />

          {selectedFile && (
            <p className="selected-file">
              Selected: {selectedFile.name}
            </p>
          )}

          <button
            type="submit"
            className="form-button"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload File"}
          </button>
        </form>

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

        {/* Files */}

        <div className="uploaded-files">

          <h3>Uploaded Files</h3>

          {files.length === 0 ? (
            <p className="no-files">
              You haven't uploaded any files yet.
            </p>
          ) : (
            files.map((file) => (
              <div
                className="file-card"
                key={file.id}
              >
                <div className="file-info">

                  <h4>
                    {file.original_name}
                  </h4>

                  <p>
                    Type: {file.mimetype}
                  </p>

                  <p>
                    Size: {formatFileSize(file.size)}
                  </p>

                  <p>
                    Uploaded: {file.created_at}
                  </p>

                </div>

                <button
                  type="button"
                  className="file-delete-button"
                  onClick={() =>
                    handleDelete(file.id)
                  }
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
}

export default FileManagement;