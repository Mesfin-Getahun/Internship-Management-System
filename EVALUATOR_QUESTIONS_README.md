# Internship Management System - Evaluator Question Answers

Use this file as a quick defense guide. Each answer tells you what to say and where to show it in the code.

## 1. Show the backend and frontend integration point

The frontend communicates with the backend through Axios requests using `import.meta.env.VITE_BACKEND_URL`.

Main examples:
- Login: `Frontend/src/pages/auth/LoginPage.jsx` posts to `POST /api/login`.
- Authenticated requests: frontend sends `Authorization: Bearer ${user.token}`.
- Backend route mounting is in `backend/index.js`, for example:
  - `/api/student` -> `studentRoute`
  - `/api/faculty` -> `facultyRoute`
  - `/api/company` -> `companyRoute`
  - `/api/UIL` -> `UILroute`
  - `/api/admin` -> `adminDashboardRoute`

Backend security/integration setup:
- `backend/index.js` enables CORS for allowed frontend origins.
- `backend/index.js` uses `express.json({ limit: "1mb" })`.
- Authenticated backend routes verify JWT tokens in `backend/middleware/auth.js`.

## 2. Does the company have to change password on first login?

For self-registered companies, no. The company creates its own password during registration, so the backend stores `must_change_password = FALSE` in `backend/controller/companyController.js`.

The system still supports forced password change for accounts that are given a temporary/default password. If a company record has `must_change_password = 1`, the login system will require a password change.

How it works:
- Login checks `company.must_change_password` in `backend/middleware/login.js`.
- If true, backend returns `firstLogin: true` and a short-lived `setupToken` instead of a normal session token.
- Frontend receives `firstLogin` in `Frontend/src/pages/auth/LoginPage.jsx` and redirects to `/change-password`.
- Password change is handled by `backend/middleware/changePassword.js`, which updates the hashed password and sets `must_change_password = FALSE`.

For invited companies, the company also sets its own password during invited registration, then waits for UIL approval.

## 3. Show how and where grade results are summed

There are several grade parts:
- Company assessment: 40 marks.
- Faculty attendance: 10 marks.
- Faculty mentor report: 20 marks.
- Presentation: 30 marks.

Where marks are calculated:
- Company/company mentor final evaluation sums assessment sections:
  - `backend/controller/companyController.js`
  - `backend/controller/companyMentorController.js`
  - It adds `assessment.general + assessment.personal + assessment.professional` and stores the result as `internship_evaluation.total_mark`.
- Faculty attendance grade uses `normalizeMark(..., 10)` in `backend/controller/facultyController.js`.
- Mentor report grade uses `normalizeMark(..., 20)` in `backend/controller/mentorController.js`.
- Presentation grade is stored in `presentation_grade`. `backend/utils/evaluatorSchema.js` only finalizes it when the two evaluators submit the same mark.

Where final known total is shown:
- `backend/controller/facultyController.js` and `backend/controller/studentController.js` calculate:

```sql
COALESCE(ie.total_mark, 0) +
COALESCE(ie.faculty_attendance_mark, 0) +
COALESCE(r.mentor_report_mark, 0) +
COALESCE(pg.final_presentation_mark, 0) AS known_total_mark
```

Frontend displays the marks in:
- `Frontend/src/components/dashboard/faculty/FacultyOrgEvaluations.jsx`
- `Frontend/src/components/dashboard/student/FeedbackAndEvaluation.jsx`

## 4. What techniques do you use to optimize code?

Good answer:
- I use reusable middleware for auth, file upload limits, rate limits, and security headers instead of repeating code.
- I use parameterized SQL queries to prevent SQL injection and keep database calls predictable.
- I use `Promise.all` where independent queries can run together, for example in admin user loading.
- I cache schema checks such as `ensureInternshipGradeColumns`, `ensureEvaluatorTables`, and `ensureMustChangePasswordColumn`, so the app does not repeatedly alter/check tables.
- I limit request body and upload size to reduce server memory usage.
- I separate frontend components by dashboard/role, so pages are easier to maintain.
- I use backend validation as the source of truth, with frontend validation only for faster user feedback.

## 5. File upload mechanisms to protect from unnecessary data uploading

Uploads are controlled mainly by `backend/middleware/fileUploadLimits.js`.

Protections:
- Uses Multer `memoryStorage`.
- Limits file size:
  - PDF uploads: 5 MB.
  - Application files: 5 MB each, max 2 files.
  - Company documents: 5 MB each, max 2 files.
  - Spreadsheet upload: 3 MB.
- Checks MIME types:
  - PDFs must be `application/pdf`.
  - Images must be JPEG, PNG, or WEBP.
  - Company profile must be image.
  - Company license must be PDF.
- Uses `uploadLimiter` from `backend/middleware/security.js` to rate-limit uploads.
- Global error handler in `backend/index.js` returns clean errors for oversized or unsupported uploads.

Frontend also validates before upload:
- `Frontend/src/utils/fileValidation.js` checks PDF/image MIME type or extension.

## 6. Company invitation link and approval page

Invitation:
- Frontend form: `Frontend/src/components/dashboard/uil/CompanyInvitation.jsx`.
- It posts to `POST /api/UIL/inviteCompany`.
- Backend handler: `inviteCompany` in `backend/controller/UILcontroller.js`.
- Backend creates a JWT invite token with purpose `company_invite`, expiry `7d`.
- Invite URL format:

```text
/#/company/invite?token=...
```

Invited registration:
- Frontend page: `Frontend/src/pages/auth/InvitedCompanySignUp.jsx`.
- It verifies token with `GET /api/UIL/verifyCompanyInvite/:token`.
- It completes registration with `POST /api/UIL/completeCompanyRegistration`.
- Backend stores company details, hashed password, uploaded profile/license files, and changes company status to `pending`.

Approval:
- Approval UI: `Frontend/src/components/dashboard/uil/OrgApprovals.jsx`.
- Pending companies are loaded from `GET /api/UIL/companyRequest`.
- Approve endpoint: `PUT /api/UIL/acceptCompany/:company_id`.
- Reject endpoint: `PUT /api/UIL/rejectCompany/:company_id`.
- Backend approval functions are `acceptCompany` and `rejectCompany` in `backend/controller/UILcontroller.js`.

## 7. Where and how minimum internship period is enforced for each department

Rules are in `backend/utils/internshipRules.js`.

Current rule:
- Computing-related departments require 2 months:
  - computer science
  - information technology
  - information system/systems
  - cyber security/cybersecurity
  - IT education
- Other departments require 4 months.

Backend enforcement:
- Company creates internship: `backend/controller/companyController.js` calls `validateMinimumInternshipDuration`.
- Company updates internship: same validation runs again.
- Student applies: `backend/controller/studentController.js` checks required months before allowing the application.

Frontend display/blocking:
- `Frontend/src/components/dashboard/student/InternshipOpportunities.jsx` shows duration eligibility and disables the apply button.
- `Frontend/src/components/dashboard/student/ApplicationPage.jsx` blocks submit if the internship does not meet the required duration.

## 8. How do you upload data with its name and give a student ID as name?

The upload helper is `backend/utils/cloudinaryUpload.js`.

It accepts:
- file buffer
- Cloudinary folder
- original file name

It sanitizes the file name using `safePublicId`, then sends it to Cloudinary as `public_id`.

For student uploaded files:
- CV uses original file name in `backend/controller/studentController.js`.
- Academic document uses original file name.
- Internship report uses original file name.

For generated evaluation PDFs:
- `backend/utils/generateAssessmentPDF.js` creates `${student.student_id}_assessment.pdf`.
- `backend/utils/generateAttendancePDF.js` creates `${student.student_id}_attendance.pdf`.
- `backend/controller/companyMentorController.js` uploads them to Cloudinary using those student-ID-based names.

So the system can either preserve the uploaded file name, or intentionally rename generated documents using the student ID.

## 9. Where and how token storage works

Backend:
- Login creates JWT tokens in `backend/middleware/login.js`.
- Normal login token expires in 1 day.
- First-login password setup token expires in 15 minutes.
- Auth middleware reads the token from the `Authorization: Bearer ...` header in `backend/middleware/auth.js`.

Frontend web:
- `Frontend/src/AuthContext.jsx` stores the logged-in user and token in browser `localStorage` under `ims_user`.
- It checks JWT expiry and removes expired sessions.
- Axios response interceptor logs the user out on authenticated `401` responses.

Mobile app:
- `Mobile-App/services/apiClient.js` stores token in an in-memory variable `authToken`.
- `Mobile-App/services/authService.js` sets/clears that token after login/logout.

## 10. Where is the Toastify function?

Toastify is used in frontend components through `react-toastify`.

Examples:
- `Frontend/src/components/dashboard/admin/DataBackup.jsx`
- `Frontend/src/components/dashboard/admin/UserPasswordResets.jsx`
- `Frontend/src/components/dashboard/faculty/FacultyOrgEvaluations.jsx`
- `Frontend/src/pages/dashboard/EvaluatorDashboard.jsx`

Pattern:

```jsx
import { toast, ToastContainer } from "react-toastify";
toast.success("...");
toast.error("...");
<ToastContainer />
```

## 11. Where and how CSV files are exported

UIL CSV export:
- Routes:
  - `GET /api/UIL/internships/export.csv`
  - `GET /api/UIL/companies/export.csv`
- Backend:
  - `exportInternshipsCsv` in `backend/controller/UILcontroller.js`
  - `exportCompaniesCsv` in `backend/controller/UILcontroller.js`
- It builds CSV with `buildCsvContent`, sets:
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="...csv"`
- It also logs export actions.

Frontend download:
- `Frontend/src/components/dashboard/uil/InternshipApprovals.jsx`
- `Frontend/src/components/dashboard/uil/OrgApprovals.jsx`
- Frontend requests `responseType: "blob"`, creates a Blob URL, then clicks a temporary `<a download>`.

Other CSV exports:
- Faculty stipend report: `backend/controller/facultyController.js` and `Frontend/src/components/dashboard/faculty/FacultyStipendManagementLive.jsx`.
- Admin export function exists in `backend/controller/adminDashboardController.js` as `exportAdminData`.

## 12. How and where default current password is generated when admin resets student password

Admin reset flow:
- Frontend: `Frontend/src/components/dashboard/admin/UserPasswordResets.jsx`.
- Route: `POST /api/admin/users/:role/:id/reset-password`.
- Backend route: `backend/routes/adminDashboardRoute.js`.
- Backend controller: `resetUserPassword` in `backend/controller/adminDashboardController.js`.

Password generation:
- `generateTemporaryPassword()` is in `backend/utils/passwordReset.js`.
- It builds a random temporary password using letters, digits, and symbols.
- `resetAccountPassword()` hashes it with bcrypt and stores it.
- It also sets `must_change_password = TRUE`.

After reset:
- If email is sent successfully, the temporary password is emailed.
- If email fails or no email exists, backend returns `temporary_password` in the API response so admin can give it to the user.
- The reset is logged as `PASSWORD_RESET_BY_ADMIN`.

## 13. What actions are stored in system logs?

System log writer:
- `backend/utils/systemLogService.js`
- Wrapper: `backend/utils/createLog.js`

Admin can view logs:
- Backend: `GET /api/admin/logs`
- Frontend: `Frontend/src/components/dashboard/admin/AuditLogs.jsx`

Logged actions include:
- `COMPANY_REGISTERED`
- `COMPANY_PROFILE_UPDATED`
- `COMPANY_ACCOUNT_DEACTIVATED`
- `COMPANY_MENTOR_CREATED`
- `COMPANY_MENTOR_UPDATED`
- `COMPANY_MENTOR_DEACTIVATED`
- `COMPANY_INVITE_SENT`
- `COMPANY_APPROVED`
- `COMPANY_REJECTED`
- `INTERNSHIP_APPROVED`
- `INTERNSHIP_REJECTED`
- `INTERNSHIP_CSV_EXPORTED`
- `COMPANY_CSV_EXPORTED`
- `RECOMMENDATION_LETTER_UPLOADED`
- `RECOMMENDATION_LETTER_REMOVED`
- `ACADEMIC_YEAR_CREATED`
- `ACADEMIC_YEAR_CLOSED`
- `COMPANY_RATING_ACTION`
- `STUDENT_PROFILE_UPDATED`
- `PASSWORD_RESET_BY_ADMIN`
- `SELF_SERVICE_PASSWORD_RESET`
- `ACCOUNT_DEACTIVATED`
- `FACULTY_UPDATED`
- `FACULTY_DEACTIVATED`
- `MAINTENANCE_MODE_UPDATED`
- `CSV_EXPORT_CREATED`
- `DATABASE_BACKUP_CREATED`

## 14. Where is security checking for input data like image, PDF, text, and link implemented?

Both frontend and backend do checks, but backend is the main security layer.

Images/PDFs:
- Frontend: `Frontend/src/utils/fileValidation.js` checks image/PDF type before submit.
- Backend: `backend/middleware/fileUploadLimits.js` checks MIME type and size with Multer.
- Backend routes use upload middleware and `uploadLimiter`.
- Cloudinary upload sanitizes public file names in `backend/utils/cloudinaryUpload.js`.

Text:
- Most database writes use parameterized SQL queries with `?` placeholders.
- Passwords are hashed with bcrypt.
- Email HTML values are escaped with `escapeHtml` from `backend/utils/security.js`.
- Request body size is limited in `backend/index.js`.

Links/URLs:
- Uploaded file URLs returned from Cloudinary are checked by `requireTrustedUrl` in `backend/utils/cloudinaryUpload.js`.
- Trusted hosts are defined in `backend/utils/security.js`.
- Company invitation frontend URL is validated against allowed frontend origins in `backend/controller/UILcontroller.js` before building the invite link.

Security middleware:
- `backend/middleware/security.js` uses Helmet, global rate limiting, auth rate limiting, upload rate limiting, and expensive action rate limiting.

## 15. Where does backed-up data store and what methods are used for backup?

Backup UI:
- `Frontend/src/components/dashboard/admin/DataBackup.jsx`

Backend routes:
- `GET /api/admin/backups`
- `POST /api/admin/backup`
- Both are in `backend/routes/adminDashboardRoute.js`.

Backend implementation:
- `backupDatabase` in `backend/controller/adminDashboardController.js`.
- Backup directory is `path.resolve("./backups")`.
- When the backend is run from the `backend` folder, this stores files in `backend/backups`.
- File name format is `backup_<timestamp>.sql`.

Backup method:
- Backend spawns `mysqldump`.
- It uses database environment variables:
  - `DB_HOST`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
- Output is streamed into a `.sql` file.
- On success, it logs `DATABASE_BACKUP_CREATED`.
- On failure, it deletes the incomplete backup file.

Existing backup/migration SQL files are visible in `backend/backups`.

## 16. Where and how is the student department minimum internship time/duration set?

The minimum duration rule is set in `backend/utils/internshipRules.js`.

Main function:
- `requiredInternshipMonths(department)`

How it decides:
- It normalizes the department name by trimming, lowercasing, and cleaning spaces.
- Computing-related departments require 2 months:
  - computer science
  - information technology
  - information system/information systems
  - cyber security/cybersecurity
  - IT education/information technology education
- All other departments require 4 months.

How duration is calculated:
- `durationMonthsFromDates(startDate, endDate)` calculates days between internship start and end date, then converts days to approximate months using `days / 30`.
- `durationMonthsForInternship(internship)` uses start/end dates first, then falls back to the internship `duration` field if dates are not available.

Where it is enforced:
- Company creates internship: `backend/controller/companyController.js` calls `validateMinimumInternshipDuration`.
- Company updates internship: `backend/controller/companyController.js` validates the updated dates/department again.
- Student applies: `backend/controller/studentController.js` checks `requiredInternshipMonths` and blocks the application if the internship is too short.

Where students see it:
- `Frontend/src/components/dashboard/student/InternshipOpportunities.jsx` shows required months and disables Apply when not eligible.
- `Frontend/src/components/dashboard/student/ApplicationPage.jsx` prevents submitting an application if the duration rule is not satisfied.

## 17. How and where is report submission date restricted?

Report submission is restricted by internship end date.

Frontend check:
- File: `Frontend/src/components/dashboard/student/InternshipReport.jsx`
- Function: `hasInternshipEnded(internship)`
- It checks `placement_end_date || end_date`.
- It only enables the report file input and Submit button when the end date has passed.
- Before the end date, the UI shows: "Report submission opens after ..."

Backend check:
- Route: `POST /api/student/uploadReport/:internship_id`
- Route file: `backend/routes/studentRoute.js`
- Middleware/handler chain:
  - `authStudent`
  - `uploadLimiter`
  - `uploadPDF.single("report")`
  - `uploadInternshipReport`
- Main handler: `uploadInternshipReport` in `backend/controller/studentController.js`.

How backend enforces it:
- It first confirms the student has that internship as a current active placement.
- It reads `si.end_date AS placement_end_date` and `i.end_date`.
- It uses:

```js
const internshipEndDate = activeInternship.placement_end_date || activeInternship.end_date;

if (!internshipEndDate || new Date(internshipEndDate) > new Date()) {
  return res.status(403).json({
    success: false,
    message: "You can submit an internship report only after the internship end date.",
  });
}
```

It also prevents duplicate report submission by checking `internship_report` for the same `student_id` and `internship_id`. If a report already exists, it returns `409`.

## 18. How and where is uploading more than one file restricted?

The upload count restriction is implemented with Multer in `backend/middleware/fileUploadLimits.js`.

Main limits:
- `pdfUpload`: `limits: { fileSize: 5 * MB, files: 1 }`
- `applicationFilesUpload`: `limits: { fileSize: 5 * MB, files: 2 }`
- `companyDocumentUpload`: `limits: { fileSize: 5 * MB, files: 2 }`
- `supportingDocumentUpload`: `limits: { fileSize: 5 * MB, files: 1 }`
- `spreadsheetUpload`: `limits: { fileSize: 3 * MB, files: 1 }`

Route-level examples:
- Student report upload uses `uploadPDF.single("report")` in `backend/routes/studentRoute.js`, so only one report file is accepted.
- Student internship application uses `uploadApplicationFiles`, defined in `backend/middleware/uploadApplicationFiles.js`, with:
  - `cv`, maxCount 1
  - `academic_doc`, maxCount 1
- Company registration uses `companyDocumentUpload.fields(...)` with:
  - `profileFile`, maxCount 1
  - `licenseFile`, maxCount 1
- UIL recommendation letter uses `uploadPDF.single("recommendationLetter")`.

If the user uploads too many files, Multer throws a `LIMIT_*` error. The global error handler in `backend/index.js` catches those errors and returns a clean upload error response.

## 19. How and where is password strength checked in organization registration?

Organization password strength is checked in the frontend registration step.

Frontend visual strength meter:
- File: `Frontend/src/components/signup/OrgInfoStep.jsx`
- Function: `calculateStrength(pass)`
- It recalculates whenever `formData.password` changes.
- It gives one score point for each of these:
  - password length is at least 8
  - contains an uppercase letter
  - contains a number
  - contains a special character
- It displays the strength label as `Weak`, `Fair`, `Good`, or `Strong`, with a colored progress bar.

Frontend required validation:
- Self-registration page: `Frontend/src/pages/auth/OrganizationSignUp.jsx`
- Invited company registration page: `Frontend/src/pages/auth/InvitedCompanySignUp.jsx`
- Both validate:
  - password is required
  - password must be at least 8 characters
  - password and confirm password must match

Backend validation:
- Self-registration backend: `registerCompany` in `backend/controller/companyController.js`
- Invited company backend: `completeCompanyRegistration` in `backend/controller/UILcontroller.js`
- Backend confirms password is present and matches `confirmPassword`, then hashes the password with bcrypt before storing it.

Important note for the evaluator:
- Strong/fair/good password scoring is currently a frontend guidance feature.
- The backend source of truth currently enforces presence and password confirmation, while the frontend enforces minimum 8 characters before submission.

## 20. How and where does internship suggestion work?

Internship suggestion is handled in the student backend controller and displayed in the student opportunities page.

Backend route:
- `GET /api/student/internships/suggested`
- Route file: `backend/routes/studentRoute.js`
- Handler: `suggestedInternships` in `backend/controller/studentController.js`

How the backend builds suggestions:
1. It reads the logged-in student's profile:
   - department
   - faculty
   - skills
   - technical skills
   - soft skills
   - languages
   - preferred location
2. It loads approved internships only:

```sql
SELECT i.*, c.company_name
FROM internship i
JOIN company c ON i.company_id = c.company_id
WHERE i.status = 'approved'
```

3. It compares the student profile with each internship using `internshipMatchesStudentProfile`.

Matching logic:
- Student profile terms are built from:
  - student department
  - faculty
  - department-related terms
  - skills
  - technical skills
  - soft skills
  - languages
- Internship terms are built from:
  - internship department
  - department-related terms
  - required skills
  - title
  - description

Scoring:
- Department match: `+5`
- Each matched profile term: `+2`
- General post with no target department: `+1`
- Preferred location match: `+1`

After scoring:
- Unrelated internships are removed with `.filter((internship) => internship.is_profile_related)`.
- Results are sorted by highest `match_score`.
- The response returns `suggestions`.

Duration eligibility:
- Suggestions also include `withDurationEligibility(...)`, so each suggested internship includes:
  - `duration_months`
  - `required_minimum_months`
  - `meets_duration_requirement`

Frontend:
- File: `Frontend/src/components/dashboard/student/InternshipOpportunities.jsx`
- It calls both:
  - `GET /api/student/internships`
  - `GET /api/student/internships/suggested`
- It stores suggestions in `suggestions`.
- It maps suggestions by `internship_id` and displays the `match_score`.
- It also shows labels like `Department Match`, `Profile Match`, or `General Post`, plus matched terms.
