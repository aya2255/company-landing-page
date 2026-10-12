# [NexaTech — Company Landing Page](https://company-landing-page-chi-nine.vercel.app)

A modern and responsive company landing page built with React and Vite.

Live Demo : [View Website](https://company-landing-page-chi-nine.vercel.app)



## Project Overview

NexaTech is a full-stack web application designed to manage company operations through a centralized platform. It integrates a responsive frontend, a RESTful backend API, and a database to provide a connected and organized management experience.

The project combines the features developed throughout the Full-Stack track, including user authentication, customer inquiries, content management, service management, customer requests, role-based access control, file management, and client project management.

The application demonstrates how frontend interfaces, backend services, database operations, and authentication work together in a complete web application.

## Main Features

### 1. User Authentication
- User registration and login.
- Secure password hashing.
- JWT-based authentication.
- Protected routes and API endpoints.
- Role-based access control.

### 2. Customer Inquiry Management
- Contact form for submitting inquiries.
- Input validation on the frontend and backend.
- Store inquiries in the database.

### 3. Content Management
- Create, view, update, and delete content.
- Backend validation and database integration.
- Protected management operations.

### 4. Service Management
- Display services dynamically from the database.
- Create, update, and delete services.
- Automatically reflect service changes in the public interface.

### 5. Customer Dashboard
- Retrieve the authenticated user's profile from the backend.
- Display account information.
- Update the user's profile information.

### 6. Customer Request Management
- Submit service requests.
- View customer request details.
- Track request statuses.
- Allow authorized users to manage request statuses.
- Search and filter requests by customer information, status, and service.

### 7. Role-Based Access Control (RBAC)
The application supports different user roles with different permissions:

- **Admin:** Manage content, services, customer requests, clients, and projects.
- **Employee:** View and manage assigned projects, view services, and manage customer requests according to the configured permissions.
- **Customer:** Access customer features, view available services, and submit service requests.

Permissions are enforced by the backend API, not only by hiding frontend elements.

### 8. File and Document Management
- Upload supported documents and images.
- Validate file types and file sizes.
- Store file metadata in the database.
- List and delete the authenticated user's files.

Supported formats include PDF, DOC, DOCX, JPG, JPEG, and PNG, with a maximum upload size of 5 MB.

### 9. Client Project Management
- Create, view, update, and delete projects.
- Associate projects with clients.
- Assign projects to team members.
- Track project status and progress.
- Display assigned team members and project information.
- Restrict project operations according to user roles and permissions.

Supported project statuses:
- Not Started
- In Progress
- Completed
- On Hold

### 10. Database Integration
- Store and retrieve application data through backend APIs.
- Maintain relationships between users, clients, projects, and assigned team members.
- Persist changes in the database.

## Technologies Used

### Frontend
- React.js
- JavaScript (ES6+)
- HTML5
- CSS3
- Vite

### Backend
- Node.js
- Express.js
- RESTful APIs
- JSON Web Tokens (JWT)
- bcryptjs
- Multer
- CORS

### Database
- Turso (libSQL)
- SQL

### Development Tools
- Visual Studio Code
- Git
- GitHub
- npm
- Vercel and Render for deployment, where configured

## Project Structure

The project is organized into separate frontend and backend sections.

```text
NexaTech/
├── src/
│   ├── components/
│   │   ├── Auth.jsx
│   │   ├── Contact.jsx
│   │   ├── CustomerDashboard.jsx
│   │   ├── CustomerRequest.jsx
│   │   ├── ContentManagement.jsx
│   │   ├── ServiceManagement.jsx
│   │   ├── RequestManagement.jsx
│   │   ├── FileManagement.jsx
│   │   └── ProjectManagement.jsx
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── backend/
│   ├── server.js
│   ├── uploads/
│   ├── .env
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

*Note: The structure above is a representative overview. Adjust the filenames and folders to match the actual project files.*

## Setup & Installation

### Prerequisites

Make sure the following tools are installed:

- Node.js and npm
- Git
- A Turso database with the required database tables and credentials

### 1. Clone the Repository

```bash
git clone https://github.com/aya2255/company-landing-page.git
cd company-landing-page
```

### 2. Install Frontend Dependencies

From the project root directory, run:

```bash
npm install
```

### 3. Install Backend Dependencies

Navigate to the backend directory:

```bash
cd backend
npm install
```

If the backend dependencies are not already listed in `backend/package.json`, install the packages used by the application:

```bash
npm install express cors dotenv @libsql/client bcryptjs jsonwebtoken multer
```

### 4. Configure Environment Variables

Create a `.env` file inside the `backend/` directory.

Add the following variables using your own credentials:

```env
PORT=5000
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
JWT_SECRET=your_strong_random_secret
```

Replace the placeholder values with your actual configuration.

**Security note:** Never commit `.env` files, database authentication tokens, or JWT secrets to GitHub.

### 5. Start the Backend

From the `backend/` directory, run:

```bash
npm start
```

If a start script is not configured in `backend/package.json`, run:

```bash
node server.js
```

The backend should start on the configured port, normally `5000`.

You can test the root endpoint by opening:

```text
http://localhost:5000/
```

### 6. Start the Frontend

Open a second terminal in the project root directory and run:

```bash
npm run dev
```

Vite will display the local development URL, usually:

```text
http://localhost:5173/
```

Open the URL in your browser to use the application.

## API Communication

The React frontend communicates with the Express backend using HTTP requests.

Examples of the application's API endpoints include:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/user/profile` | Retrieve the current user's profile |
| PUT | `/api/user/profile` | Update the user's profile |
| GET | `/api/services` | Retrieve available services |
| POST | `/api/contact` | Submit a customer inquiry |
| GET | `/api/content` | Retrieve authorized content |
| GET | `/api/requests` | Retrieve authorized customer requests |
| POST | `/api/requests` | Create a customer request |
| GET | `/api/files` | Retrieve the current user's files |
| POST | `/api/files` | Upload a file |
| GET | `/api/clients` | Retrieve authorized client records |
| POST | `/api/clients` | Create a client |
| GET | `/api/projects` | Retrieve accessible projects |
| POST | `/api/projects` | Create a project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |

Protected endpoints require a valid JWT access token in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

The backend validates requests, checks permissions where required, performs database operations, and returns JSON responses to the frontend.

## Database

The application uses Turso (libSQL) to persist its data.

The database contains tables for the application's main entities, including:

- Users
- Inquiries
- Content
- Services
- Customer requests
- Uploaded file metadata
- Clients
- Projects
- Project members

The relationships between projects, clients, and team members allow the application to organize work and track assignments.

Database credentials are configured through environment variables.

## Security

The application includes several security measures:

- Password hashing with bcryptjs.
- JWT-based authentication.
- Backend authorization middleware.
- Input validation.
- Parameterized SQL queries.
- File type and size validation.
- User-specific file access.
- Environment variables for sensitive credentials.

## How to Run the Project

1. Install the frontend and backend dependencies.
2. Configure the backend `.env` file.
3. Make sure the database is accessible and the required tables are initialized.
4. Start the backend server.
5. Start the Vite development server in a separate terminal.
6. Open the frontend URL in your browser.
7. Register or log in with an account that has the appropriate permissions.
8. Explore the available features according to the account's role.

## Future Improvements

- Improve automated testing and API documentation.
- Add pagination and more advanced search options.
- Improve error handling and loading states.
- Add centralized API configuration for easier deployment.
- Deploy the complete application with production environment variables and persistent file storage.

## Author

**Aya Ahmed Refaie**

Computer Engineering Student — Ain Shams University

## License

This project was developed as part of a Full-Stack Development training track.



