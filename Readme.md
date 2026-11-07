# SupportPilot AI — Backend API

**A scalable, AI-powered customer support backend built with Node.js, Express, TypeScript, PostgreSQL, and Prisma.**

SupportPilot AI Backend is a RESTful API designed to power a modern customer support management platform. It provides secure authentication, role-based access control, ticket management, agent assignment, user administration, dashboard analytics, and AI-powered ticket analysis.

The backend follows a modular architecture, uses PostgreSQL for relational data management, Prisma ORM for database operations, and Google Gemini AI to generate intelligent ticket insights and suggested customer responses.

---

## 🚀 Live Services

| Service | URL |
|---|---|
| Backend API | https://supportpilot-ai-g2xp.onrender.com |
| API Documentation | https://supportpilot-ai-g2xp.onrender.com/api-docs |
| Health Check | https://supportpilot-ai-g2xp.onrender.com/api/v1/health |
| Database Health | https://supportpilot-ai-g2xp.onrender.com/api/v1/health/db |

---

## ✨ Core Features

### 1. Authentication & Authorization

Secure authentication and access control for customers, support agents, and administrators.

**Authentication features:**
- User registration.
- Email and password login.
- Google OAuth authentication.
- JWT-based authentication.
- Current authenticated user endpoint.
- Password hashing using bcryptjs.
- Token verification through authentication middleware.

**Authorization features:**
- Role-based access control.
- Protected API endpoints.
- Server-side user verification.
- Permission checks based on user roles.
- Restricted administrative operations.

### 2. Role-Based Access Control

The application supports three user roles.

| Role | Access |
|---|---|
| CUSTOMER | Create tickets, view personal tickets, and communicate through comments. |
| AGENT | Access assigned tickets and manage customer support requests. |
| ADMIN | Manage users, agents, tickets, assignments, and platform operations. |

Permissions are enforced on the backend, not just hidden in the frontend.

### 3. Ticket Management

Provides the core business logic for customer support operations.

**Ticket features:**
- Create support tickets.
- Retrieve ticket details.
- Retrieve ticket lists.
- Pagination and filtering.
- Update ticket status.
- Assign tickets to support agents.
- Add ticket comments.
- Track ticket priority.
- Store AI-generated ticket analysis.

**Supported ticket statuses:**

| Status | Description |
|---|---|
| OPEN | Newly created ticket. |
| IN_PROGRESS | Ticket currently being handled. |
| RESOLVED | Customer issue has been resolved. |
| CLOSED | Ticket has been closed. |

**Supported priorities:**

| Priority | Description |
|---|---|
| LOW | Low-impact request. |
| MEDIUM | Normal support request. |
| HIGH | Important issue requiring attention. |
| URGENT | Critical issue requiring immediate attention. |

### 4. AI-Powered Ticket Analysis

Integrates Google Gemini AI to analyze customer support tickets.

The AI service analyzes ticket titles and descriptions and generates:

- **Category Classification:** Identifies the type of customer issue.
- **Priority Recommendation:** Recommends LOW, MEDIUM, HIGH, or URGENT.
- **Ticket Summary:** Generates a concise summary.
- **Suggested Reply:** Creates a professional response for the support team.

**AI processing workflow:**

1. An authorized agent or administrator requests ticket analysis.
2. The backend retrieves the ticket from PostgreSQL.
3. Ticket information is sent to Google Gemini.
4. Gemini generates structured JSON analysis.
5. The backend validates the returned analysis.
6. AI-generated results are saved to the database.
7. The API returns the updated analysis.

**Important design decision:**

The AI-recommended priority is stored separately in `aiPriority`. The original ticket `priority` is never overwritten by AI analysis.

This preserves the distinction between the original ticket priority and the AI recommendation.

### 5. User Management

Administrative endpoints support user administration.

- Retrieve registered users.
- Paginate user results.
- Filter users by role.
- Update eligible user roles.
- Restrict administrative operations.
- Prevent unauthorized role changes.

### 6. Agent Management

Provides functionality for managing support agents.

- Retrieve available support agents.
- Assign tickets to agents.
- Retrieve agent workload information.
- Monitor open, in-progress, and resolved tickets.
- Restrict agent-management operations by role.

### 7. Dashboard Analytics

Provides role-aware dashboard statistics.

The dashboard service retrieves operational information from the database, including:

- Ticket statistics.
- Ticket status breakdown.
- User statistics.
- Customer and agent counts for administrators.
- Agent workload information.

Statistics are scoped according to the authenticated user's permissions.

### 8. API Documentation

Swagger provides interactive API documentation.

Developers can explore endpoints, understand request and response structures, and test supported API operations.

**[Explore API Documentation](https://supportpilot-ai-g2xp.onrender.com/api-docs)**

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js 5 | REST API framework |
| TypeScript | Static typing and maintainable code |
| PostgreSQL | Relational database |
| Prisma ORM 7 | Database queries and schema management |
| Prisma PostgreSQL Adapter | PostgreSQL database connectivity |
| Zod | Request and data validation |
| JSON Web Token | Authentication |
| bcryptjs | Password hashing |
| Google Gemini AI | AI-powered ticket analysis |
| Google GenAI SDK | Gemini API integration |
| Vitest | Unit and integration testing |
| Supertest | HTTP endpoint testing |
| Swagger | API documentation |
| dotenv | Environment configuration |

---

## 🏗️ Backend Architecture

The backend uses a modular structure that separates application features into independent modules.

Each module is responsible for a specific business domain.

```text
Client Application
       |
       v
Express Application
       |
       v
Middleware Layer
       |
       +---- CORS
       +---- JSON Parsing
       +---- Authentication
       +---- Authorization
       |
       v
Route Layer
       |
       +---- Authentication
       +---- Tickets
       +---- AI
       +---- Users
       +---- Dashboard
       |
       v
Controller Layer
       |
       v
Service Layer
       |
       +---- Business Logic
       +---- Validation
       +---- AI Processing
       |
       v
Prisma ORM
       |
       v
PostgreSQL Database
```

### Architecture Principles

- **Separation of concerns:** Routes, controllers, middleware, and services have separate responsibilities.
- **Modular organization:** Features are grouped by business domain.
- **Type safety:** TypeScript provides compile-time checks.
- **Validation:** Zod validates incoming data.
- **Security:** Authentication and authorization are enforced by backend middleware.
- **Maintainability:** Individual modules can be extended without unnecessarily affecting other modules.

---

## 📁 Project Structure

```text
supportpilot-ai/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── create-admin.ts
│
├── src/
│   │
│   ├── config/
│   │   └── swagger.ts
│   │
│   ├── lib/
│   │   └── prisma.ts
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.middleware.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── authorize.ts
│   │   │
│   │   ├── ai/
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.routes.ts
│   │   │   ├── ai.service.ts
│   │   │   ├── ai.service.test.ts
│   │   │   ├── ai.provider.test.ts
│   │   │   └── ai.routes.test.ts
│   │   │
│   │   ├── tickets/
│   │   │   ├── ticket.controller.ts
│   │   │   ├── ticket.routes.ts
│   │   │   └── ...
│   │   │
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.routes.ts
│   │   │   └── ...
│   │   │
│   │   └── dashboard/
│   │       ├── dashboard.controller.ts
│   │       ├── dashboard.routes.ts
│   │       └── ...
│   │
│   ├── app.ts
│   └── server.ts
│
├── generated/
│   └── prisma/
│
├── prisma.config.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .env.example
├── .gitignore
└── README.md
```

*This is a representative project structure. Adjust filenames if your current repository uses different names.*

---

## 🗄️ Database Design

SupportPilot AI uses PostgreSQL with Prisma ORM.

The database is designed around the main entities required for customer support operations.

### User

Stores authentication and user information.

Main fields include:

- `id`
- `name`
- `email`
- `passwordHash`
- `googleId`
- `role`
- `createdAt`
- `updatedAt`

### Ticket

Stores customer support requests.

Main fields include:

- `id`
- `title`
- `description`
- `status`
- `priority`
- `category`
- `creatorId`
- `assigneeId`
- `aiPriority`
- `aiSummary`
- `aiReply`
- `createdAt`
- `updatedAt`

### Comment

Stores ticket discussion messages.

Comments are associated with their ticket and author.

### Important Database Relationships

- A customer can create multiple tickets.
- An agent can be assigned multiple tickets.
- A ticket can contain multiple comments.
- Comments belong to a ticket and an author.
- Ticket creator and assignee are associated with user records.

Prisma manages database queries, relationships, and schema migrations.

---

## 🔌 API Reference

All API endpoints use the following base URL:

```text
https://supportpilot-ai-g2xp.onrender.com
```

### API Modules

| Module | Base Path | Responsibility |
|---|---|---|
| Health | `/api/v1/health` | Application health |
| Authentication | `/api/v1/auth` | Registration and login |
| Tickets | `/api/v1/tickets` | Ticket operations |
| AI | `/api/v1/ai` | Ticket analysis |
| Users | `/api/v1/users` | User administration |
| Dashboard | `/api/v1/dashboard` | Dashboard statistics |

### Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a customer |
| POST | `/api/v1/auth/login` | Authenticate using email and password |
| POST | `/api/v1/auth/google` | Authenticate using Google |
| GET | `/api/v1/auth/me` | Retrieve authenticated user information |

### Ticket Endpoints

The ticket module supports:

- Creating a ticket.
- Listing tickets.
- Retrieving ticket details.
- Updating ticket status.
- Assigning tickets to agents.
- Adding comments.
- Filtering and pagination.

### AI Endpoints

The AI module provides ticket analysis functionality.

### User Endpoints

The user module supports:

- Paginated user listing.
- Role-based user filtering.
- User role management.
- Agent listing.
- Agent workload overview.

### Dashboard Endpoints

The dashboard module provides role-aware operational statistics.

**For exact endpoint paths, HTTP methods, request bodies, authentication requirements, and response schemas, use the Swagger documentation:**

https://supportpilot-ai-g2xp.onrender.com/api-docs

---

## 🔐 Authentication Flow

SupportPilot AI uses JWT-based authentication.

```text
User Login
    |
    v
Validate Credentials
    |
    v
Compare Password with bcrypt Hash
    |
    v
Generate JWT
    |
    v
Return Token and User Information
    |
    v
Client Sends Bearer Token
    |
    v
Authentication Middleware
    |
    v
Verify Token and User
    |
    v
Check User Permissions
    |
    v
Access Protected Resource
```

### Protected API Requests

Authenticated requests use the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

The authentication middleware verifies the token and retrieves the current user from the database.

Authorization middleware then checks whether the user has permission to access the requested resource.

---

## 🤖 AI Integration Details

Google Gemini AI is integrated through the official Google GenAI SDK.

The AI service uses the model:

```text
gemini-2.5-flash
```

The service requests structured JSON output containing:

```json
{
  "category": "TECHNICAL_ISSUE",
  "priority": "HIGH",
  "summary": "The customer is experiencing a technical issue.",
  "suggestedReply": "Thank you for reporting this issue. Our support team is investigating it."
}
```

The backend validates the generated values before updating the ticket.

Supported categories:

- `TECHNICAL_ISSUE`
- `BILLING`
- `ACCOUNT`
- `GENERAL`

Supported AI priorities:

- `LOW`
- `MEDIUM`
- `HIGH`
- `URGENT`

The ticket's original priority remains unchanged.

**Note:** AI-generated classifications and replies are recommendations and should be reviewed by support staff before being sent to customers.

---

## ⚙️ Environment Variables

Create a `.env` file in the backend root directory.

Example:

```env
PORT=5000

DATABASE_URL="YOUR_DATABASE_URL"
DATABASE_URL_UNPOOLED="YOUR_DIRECT_DATABASE_URL"

JWT_SECRET="YOUR_SECURE_JWT_SECRET"

GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

Use the exact environment variable names expected by your application and Prisma configuration.

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `DATABASE_URL` | PostgreSQL connection URL |
| `DATABASE_URL_UNPOOLED` | Direct PostgreSQL connection used by Prisma tooling |
| `JWT_SECRET` | Secret used to sign JWTs |
| `GEMINI_API_KEY` | Google Gemini API authentication |

If your Google OAuth implementation requires additional environment variables, configure those according to your actual code.

**Security rules:**

- Never commit `.env` to GitHub.
- Never expose API keys in frontend code.
- Never publish database credentials.
- Never use a public `NEXT_PUBLIC_` prefix for backend secrets.
- Keep `.env.example` free of real credentials.

---

## 💻 Local Installation

### Prerequisites

- Node.js 22+
- npm
- PostgreSQL or Neon account
- Git
- Google Gemini API key for AI functionality

### 1. Clone the repository

```bash
git clone YOUR_BACKEND_REPOSITORY_URL
cd supportpilot-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env` and add your database URL, JWT secret, and Gemini API key.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Apply database migrations

For a fresh database:

```bash
npx prisma migrate deploy
```

### 6. Start the development server

```bash
npm run dev
```

The API will run on the configured port.

Example:

```text
http://localhost:5000
```

### 7. Verify the application

Open:

```text
http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "message": "SupportPilot AI API is running"
}
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with automatic restart |
| `npm run build` | Compile TypeScript |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run all Vitest tests |
| `npm start` | Start compiled production server |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate deploy` | Apply pending migrations |

---

## 🧪 Testing

The backend uses Vitest and Supertest to test important application behavior.

### Run All Tests

```bash
npm test
```

### Run Type Checking

```bash
npm run typecheck
```

### Build the Project

```bash
npm run build
```

### Run an Individual Test

```bash
npx vitest run src/modules/ai/ai.service.test.ts
```

### AI Service Test Coverage

The AI service tests verify:

- Returns null when a ticket does not exist.
- Saves generated AI analysis.
- Preserves the original ticket priority.
- Rejects invalid AI-generated priority values.
- Handles database errors correctly.

### Development Verification

During development, the backend test suite reached:

| Verification | Result |
|---|---|
| Vitest test files | 3 passed |
| Automated tests | 17 passed |
| TypeScript type checking | Passed |
| Production build | Passed |

These are development verification results; run the commands against the current repository to confirm its latest state.

---

## 🚀 Production Deployment

The backend is deployed on Render and uses Neon PostgreSQL.

### Production Build Command

```bash
npm install && npx prisma generate && npm run build
```

### Production Start Command

```bash
npm start
```

### Required Production Environment Variables

Configure the necessary database connection, JWT secret, and AI API key in Render's environment settings.

Never upload `.env` to the repository.

### Production Endpoints

- **API:** https://supportpilot-ai-g2xp.onrender.com
- **Swagger:** https://supportpilot-ai-g2xp.onrender.com/api-docs
- **Health:** https://supportpilot-ai-g2xp.onrender.com/api/v1/health

---

## 🛡️ Error Handling & Validation

The backend uses Zod to validate incoming request data.

Validation helps prevent malformed requests from reaching business logic.

The application also handles common API errors, including:

- Invalid input.
- Missing authentication.
- Insufficient permissions.
- Missing resources.
- Database errors.
- AI provider failures.

The API uses appropriate HTTP status codes to communicate request outcomes.

---

## 🔮 Future Improvements

Potential backend improvements include:

- Real-time ticket updates using WebSockets.
- Email notifications.
- Ticket attachment uploads.
- SLA management.
- Automated ticket escalation.
- AI sentiment analysis.
- Advanced analytics and reporting.
- Rate limiting and additional security controls.
- Expanded integration and end-to-end test coverage.

---

## 👨‍💻 Author

**S. M. Anzumul Jubayer**

Full-Stack Web Developer

- GitHub: YOUR_GITHUB_PROFILE_URL
- LinkedIn: YOUR_LINKEDIN_PROFILE_URL
- Portfolio: YOUR_PORTFOLIO_URL
- Email: YOUR_PUBLIC_CONTACT_EMAIL

---

## ⭐ Project Highlights

SupportPilot AI Backend demonstrates practical experience with:

- RESTful API development.
- Node.js and Express architecture.
- TypeScript backend development.
- PostgreSQL database design.
- Prisma ORM and migrations.
- JWT authentication.
- Role-based authorization.
- AI API integration.
- Request validation.
- Automated testing.
- API documentation.
- Production deployment.

**Built with TypeScript, PostgreSQL, and Google Gemini AI to solve real-world customer support challenges.**
