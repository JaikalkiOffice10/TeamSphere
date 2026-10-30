# TeamSphere - React frontend

React 18 + Vite + React Router + Axios. Works with the FastAPI backend (`company_api`) that uses JWT login
and the roles admin / manager / employee.

## Run (Windows)

Start the backend first (`uvicorn app.main:app --reload`, port 8000), then in this folder:

```bat
npm install
copy .env.example .env
npm run dev
```

Open http://localhost:5173. If the API runs elsewhere, change `VITE_API_URL` in `.env`.
The backend allows CORS from `localhost:5173`.

## First-time walkthrough

1. Open the app and click **Set up the admin account** (only works while no users exist). You become the admin.
2. **Companies** -> add a company.
3. **Employees** -> add employee records (people's HR data; they can't log in yet).
4. **Users** -> **Add user**, pick a role, and link the account to an employee record.
   Tell the person their email and the password you chose.
5. They log in at `/login` and see only what their role allows.

## What each role sees

| Menu / action | admin | manager | employee |
|---|---|---|---|
| Companies | all, add/edit/delete | own company, view only | hidden |
| Employees | all, add/edit/delete | own company, add/edit/delete (not self) | hidden |
| Projects | all, add/edit/delete | own company, add/edit | own company, read-only, no budget |
| Users | yes | hidden | hidden |
| My profile | yes | yes | yes |

The backend enforces all of this; the UI just hides what you can't do. Opening a forbidden page directly shows a
"no permission" message.

## Structure

```
src/
├── api/          client.js (JWT header, 401 handling), authApi, companyApi, employeeApi, projectApi, userApi
├── context/      AuthContext.jsx   (login, logout, current user + role flags)
├── hooks/        usePagedList, useFormModal, useDebounce, useCompanies
├── components/   Layout, RouteGuards, Modal, Pagination, tables and forms
├── pages/        Login, Setup, Profile, Companies, CompanyDetail, Employees, Projects, Users
├── utils/        form.js, format.js
├── App.jsx       routes
└── main.jsx
```

## Notes

- The token is kept in `localStorage` so a refresh keeps you logged in. Any 401 from the API logs you out.
- There is no change-password screen because the backend has no such endpoint yet.
- The employee picker on the Users page loads up to 100 employee records (the API's page limit).
- The department filter matches exactly, as in the API.
- Amounts are shown in INR; change `CURRENCY` in `src/utils/format.js` if needed.
