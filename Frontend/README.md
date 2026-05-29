# Frontend Web App

This is the web frontend for the Internship Management System. It is a React + Vite application using Tailwind CSS, React Router, Axios, and role-based dashboards for students, faculty, admins, mentors, organizations, evaluators, and UIL.

The app manages:

- login and authentication
- role-based access and dashboard routing
- student internship application views and reports
- evaluator, mentor, UIL, organization, faculty, and admin dashboards
- recommendation letter retrieval
- theme toggle and session persistence

---

## Folder Structure

### `src/`

Main source folder for the frontend app.

- `main.jsx` — application bootstrap and provider setup.
- `App.jsx` — top-level router configuration, protected routes, and theming.
- `AuthContext.jsx` — authentication state provider, token persistence, auto-logout, and recommendation letter state.

### `src/pages/`

Page-level routes for authentication and dashboards.

- `pages/auth/` — login and organization registration pages.
- `pages/dashboard/` — role-based dashboard entry pages for each user type.

### `src/components/`

Reusable UI components grouped by feature.

- `components/auth/` — auth forms and header components.
- `components/common/` — shared layout and UI elements such as theme toggle, sidebar overlay, and change password form.
- `components/dashboard/` — dashboard-specific components for student and other roles.
- `components/setup/` — first-login or password setup screen.

### `src/context/`

- `ThemeContext.jsx` — manages dark/light mode and persists preference to `localStorage`.

### `src/utils/`

Helper logic.

- `internshipProgress.js` — computes internship progress state for student views.
- `fileValidation.js` — file upload validation helpers.
- `departmentFilters.js` — department-specific filters used by internship matching or dashboards.

### Root files

- `package.json` — dependencies and scripts.
- `vite.config.ts` — Vite configuration.
- `tailwind.config.js` — Tailwind CSS setup.
- `index.css` — global CSS utilities and style reset.
- `.env` — environment variables for development.

---

## How the Frontend Works

### Authentication and Routing

The frontend uses `AuthContext` to store the authenticated user object in `localStorage` under `ims_user`.

- `AuthProvider` loads the saved session at startup.
- JWT tokens are decoded to check expiration.
- If the token expires, the user is automatically logged out.

`App.jsx` uses `HashRouter` and `ProtectedRoute` to guard pages:

- `/login` — public login page.
- `/register/organization` — organization sign-up page.
- `/change-password` — first-login password setup.
- `/student/*`, `/faculty/*`, `/admin/*`, `/mentor/*`, `/organization/*`, `/uil/*`, `/org-supervisor/*`, `/evaluator/*` — role-based dashboards.

Role-based routing logic is implemented by `ProtectedRoute` in `App.jsx`.
If a user is not logged in, they are redirected to `/login`.
If a user must complete first-login setup, they are redirected to `/change-password`.

### Login Flow

`src/pages/auth/LoginPage.jsx` displays the login form and handles authentication.

- Calls backend POST `/api/login` with:
  - `id`
  - `email`
  - `password`
- Normalizes backend roles to frontend route roles.
- Saves user info and token to `AuthContext`.
- Redirects based on role:
  - student => `/student`
  - admin => `/admin`
  - faculty => `/faculty`
  - mentor => `/mentor`
  - organization => `/organization`
  - uil => `/uil`
  - org_supervisor => `/org-supervisor`
  - evaluator => `/evaluator`

The login page also supports a forgot-password modal that calls backend `/api/change-password/forgot` for supported roles.

### First Login and Password Change

If the backend returns `firstLogin`, the frontend marks the session with `isFirstLogin: true` and sends the user to `/change-password`.
The `ProtectedRoute` ensures the first-login password setup is completed before the user can access dashboard pages.

### Theme Management

The app stores theme preference in `localStorage`.
`ThemeProvider` and `App.jsx` both manage dark mode by toggling the `dark` class on the document root.

### Student Dashboard Features

The student dashboard is implemented in `src/pages/dashboard/StudentDashboard.jsx` and includes routes for:

- `overview` — student summary and internship status.
- `opportunities` — internship search and listing.
- `my-applications` — current and past internship applications.
- `reports` — internship report pages.
- `stipend` — stipend application page.
- `profile` — student profile management.
- `feedback` — feedback and evaluation details.
- `status` — active internship status.
- `recommendation` — recommendation letter viewer.
- `change-password` — password updates after first login.
- `apply/:id` — individual internship application page.

Key student components:

- `StudentOverview.jsx` — home dashboard that fetches `/api/student/myInternship` and renders placement status.
- `InternshipOpportunities.jsx` — searches and displays internships from `/api/student/internships` and `/api/student/internships/suggested`.
- `InternshipReport.jsx` — student report upload and PDF generation interface.

### Other Role Dashboards

Each role has a dedicated dashboard entry in `src/pages/dashboard/`.
The app includes dashboards for:

- Admin
- Faculty
- Mentor
- Organization
- UIL
- Organization Supervisor
- Evaluator

These dashboards are loaded behind role-specific protected routes, so only users with the proper role can access them.

### Recommendation Letter and UIL Support

`AuthContext` also tracks `recommendationLetter` state and refreshes it for `student` and `uil` roles.
The data is loaded from:

- `/api/student/recommendation-letter`
- `/api/UIL/recommendation-letter`

This allows the frontend to render recommendation letter availability for both student and UIL users.

---

## Key Files and What They Do

### `src/main.jsx`

- Bootstraps React.
- Wraps the app with `ThemeProvider` and `AuthProvider`.
- Loads `index.css` for global styling.

### `src/App.jsx`

- Sets up the main router and page routes.
- Handles theme toggle state.
- Protects pages with `ProtectedRoute`.

### `src/AuthContext.jsx`

- Manages login, logout, token storage, and user session.
- Automatically refreshes recommendation letter data for student/UIL users.
- Intercepts Axios 401 responses and logs the user out when unauthorized.

### `src/components/auth/LoginForm.jsx`

- Reusable login form UI for email/username and password.
- Includes forgot-password and register organization actions.

### `src/components/dashboard/student/InternshipOpportunities.jsx`

- Loads internship listings and suggested matches.
- Supports searching and filtering by title, company, location, and skills.
- Shows opportunity details and allows application navigation.

### `src/utils/internshipProgress.js`

- Contains logic for internship progress state used in student dashboard views.

---

## Environment Variables

The frontend uses `import.meta.env.VITE_BACKEND_URL` to connect to the backend API.

Create or update `.env` with:

```env
VITE_BACKEND_URL=http://localhost:5000
```

If your backend runs on another host or port, update the value accordingly.

---

## Run Locally

From the `Frontend/` folder:

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite, usually `http://localhost:5173`.

### Useful scripts

- `npm run dev` — start the development server.
- `npm run build` — create a production build.
- `npm run preview` — preview the production build locally.
- `npm run lint` — run ESLint.

---

## Deployment Notes

- This app is built with Vite and React.
- The final production build is generated in `dist/`.
- Ensure `VITE_BACKEND_URL` points to the deployed backend.
- The app uses hash routing (`HashRouter`) so it can be hosted on static servers without server-side route configuration.

---

## Notes

- The frontend is role-aware and supports multiple entry dashboards.
- Authentication uses JWT tokens stored in browser storage.
- The login page includes a forgot-password flow for company, mentor, and admin roles.
- Theme preference is preserved between visits.
- Student features include internship search, application tracking, reports, feedback, status, and recommendation letters.

If you want, I can also add a short “developer quick start” section or a visual diagram section for the frontend.
