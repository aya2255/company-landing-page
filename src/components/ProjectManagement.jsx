import { useEffect, useState } from "react";

function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // CLIENT FORM
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");

  // PROJECT FORM
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState("Not Started");
  const [projectProgress, setProjectProgress] = useState(0);
  const [projectClient, setProjectClient] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  // GET PROJECTS
  const fetchProjects = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/projects",
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

      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  // GET CLIENTS
  const fetchClients = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/clients",
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

      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  // GET TEAM MEMBERS
  const fetchTeamMembers = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/team-members",
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

      setTeamMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  // ADD CLIENT
  const handleAddClient = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/clients",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: clientName,
            email: clientEmail,
            company: clientCompany,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setMessage(data.message);

      setClientName("");
      setClientEmail("");
      setClientCompany("");

      fetchClients();
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Failed to create client."
      );
    }
  };

  // DELETE CLIENT
  const handleDeleteClient = async (clientId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this client?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/clients/${clientId}`,
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

      setMessage(data.message);

      fetchClients();
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Failed to delete client."
      );
    }
  };

  // CREATE PROJECT
  const handleCreateProject = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: projectName,
            description: projectDescription,
            status: projectStatus,
            progress: Number(projectProgress),
            client_id: Number(projectClient),
            member_ids: selectedMembers.map(Number),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setMessage(data.message);

      setProjectName("");
      setProjectDescription("");
      setProjectStatus("Not Started");
      setProjectProgress(0);
      setProjectClient("");
      setSelectedMembers([]);

      fetchProjects();
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Failed to create project."
      );
    }
  };

  // SELECT TEAM MEMBERS
  const handleMemberChange = (e) => {
    const values = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    setSelectedMembers(values);
  };

  // DELETE PROJECT
  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}`,
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

      setMessage(data.message);

      fetchProjects();
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Failed to delete project."
      );
    }
  };

  // LOAD DATA
  useEffect(() => {
    fetchProjects();
    fetchClients();
    fetchTeamMembers();
  }, []);

  return (
    <section className="project-management-section">
      <div className="project-management-container">

        <p className="section-subtitle">
          PROJECT MANAGEMENT
        </p>

        <h2>Client Projects</h2>

        {error && (
          <p className="auth-error">
            {error}
          </p>
        )}

        {message && (
          <p className="auth-success">
            {message}
          </p>
        )}

        {/* ADD CLIENT */}
        <form
          className="client-form"
          onSubmit={handleAddClient}
        >
          <h3>Add New Client</h3>

          <input
            type="text"
            placeholder="Client name"
            value={clientName}
            onChange={(e) =>
              setClientName(e.target.value)
            }
            required
          />

          <input
            type="email"
            placeholder="Client email"
            value={clientEmail}
            onChange={(e) =>
              setClientEmail(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Company name"
            value={clientCompany}
            onChange={(e) =>
              setClientCompany(e.target.value)
            }
          />

          <button
            type="submit"
            className="form-button"
          >
            Add Client
          </button>
        </form>

        {/* CLIENTS */}
        <div className="clients-list">
          <h3>Clients</h3>

          {clients.length === 0 ? (
            <p>No clients found.</p>
          ) : (
            clients.map((client) => (
              <div
                className="client-card"
                key={client.id}
              >
                <h4>{client.name}</h4>

                {client.company && (
                  <p>
                    <strong>Company:</strong>{" "}
                    {client.company}
                  </p>
                )}

                {client.email && (
                  <p>
                    <strong>Email:</strong>{" "}
                    {client.email}
                  </p>
                )}

                <button
                  type="button"
                  className="delete-button"
                  onClick={() =>
                    handleDeleteClient(client.id)
                  }
                >
                  Delete Client
                </button>
              </div>
            ))
          )}
        </div>

        {/* CREATE PROJECT */}
        <form
          className="project-form"
          onSubmit={handleCreateProject}
        >
          <h3>Create New Project</h3>

          <input
            type="text"
            placeholder="Project name"
            value={projectName}
            onChange={(e) =>
              setProjectName(e.target.value)
            }
            required
          />

          <textarea
            placeholder="Project description"
            value={projectDescription}
            onChange={(e) =>
              setProjectDescription(e.target.value)
            }
            required
          />

          <select
            value={projectClient}
            onChange={(e) =>
              setProjectClient(e.target.value)
            }
            required
          >
            <option value="">
              Select Client
            </option>

            {clients.map((client) => (
              <option
                key={client.id}
                value={client.id}
              >
                {client.name}
                {client.company
                  ? ` - ${client.company}`
                  : ""}
              </option>
            ))}
          </select>

          <select
            value={projectStatus}
            onChange={(e) =>
              setProjectStatus(e.target.value)
            }
          >
            <option value="Not Started">
              Not Started
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Completed">
              Completed
            </option>

            <option value="On Hold">
              On Hold
            </option>
          </select>

          <input
            type="number"
            min="0"
            max="100"
            placeholder="Progress"
            value={projectProgress}
            onChange={(e) =>
              setProjectProgress(e.target.value)
            }
          />

          <label>
            Assign Team Members
          </label>

          <select
            multiple
            value={selectedMembers}
            onChange={handleMemberChange}
          >
            {teamMembers.length === 0 ? (
              <option disabled>
                No employees available
              </option>
            ) : (
              teamMembers.map((member) => (
                <option
                  key={member.id}
                  value={member.id}
                >
                  {member.name} - {member.email}
                </option>
              ))
            )}
          </select>

          <small>
            Hold Ctrl and select multiple members.
          </small>

          <button
            type="submit"
            className="form-button"
          >
            Create Project
          </button>
        </form>

        {/* PROJECTS */}
        <div className="projects-section">
          <h3>Projects</h3>

          {loading ? (
            <p>Loading projects...</p>
          ) : projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            <div className="projects-list">

              {projects.map((project) => (
                <div
                  className="project-card"
                  key={project.id}
                >
                  <h3>{project.name}</h3>

                  <p>
                    <strong>Description:</strong>{" "}
                    {project.description}
                  </p>

                  <p>
                    <strong>Client:</strong>{" "}
                    {project.client_name}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {project.status}
                  </p>

                  <p>
                    <strong>Progress:</strong>{" "}
                    {project.progress}%
                  </p>

                  <p>
                    <strong>Team Members:</strong>
                  </p>

                  {project.members &&
                  project.members.length > 0 ? (
                    <ul>
                      {project.members.map(
                        (member) => (
                          <li key={member.id}>
                            {member.name}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p>
                      No members assigned.
                    </p>
                  )}

                  <div className="project-actions">
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDeleteProject(
                          project.id
                        )
                      }
                    >
                      Delete Project
                    </button>
                  </div>

                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </section>
  );
}

export default ProjectManagement;