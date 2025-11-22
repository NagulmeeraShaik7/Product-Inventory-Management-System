# Product Inventory Management System

A full-stack web application for managing products and inventory logs. This repository contains a Node.js/Express backend and a React frontend (Create React App).

**Tech stack**: Node.js, Express, Jest (backend), React (frontend).

**Contents**
- `backend/`: API server, tests, utilities, sample CSV data (`products_csv.csv`).
- `frontend/`: React app (UI) that consumes the backend API.

**Quick Start (Windows / PowerShell)**

1) Backend

- Open a terminal and run:

```powershell
cd backend
npm install
```

- Create a `.env` file in the `backend/` folder (see example below).
- Start the backend server:

```powershell
npm start
# or, if you prefer to run tests/watch during development
npm test
```

2) Frontend

- In a separate terminal run:

```powershell
cd frontend
npm install
npm start
```

This will open the React app in your browser (default `http://localhost:3000`).

**Backend / Frontend URLs**

- Frontend (React dev server): `http://localhost:3000` (default CRA port)
- Backend API: the backend server listens on the port defined by the `PORT` variable in `backend/.env`. If `PORT` is not set, the application will use the default port defined in the backend code (commonly `3001` or `5000`). Check `backend/package.json` `scripts` or your `backend/src/index.js` to confirm.

API base example (if you set `PORT=3001`):

  `http://localhost:3001/api` (exact endpoints are under `src/routes/`)

**Deployed URLs**

- Backend (API docs): `https://product-inventory-management-system-37hp.onrender.com/api-docs/`
- Frontend (deployed): `https://product-inventory-management-system-orcin.vercel.app/`

Use the deployed frontend URL to access the running UI; the frontend will call the deployed backend API when configured to do so (see `frontend/src/api/config.js`).

**Folder & Project Structure**

- Root
  - `backend/`
    - `.env` (local, not included)
    - `babel.config.json`
    - `jest.config.js`
    - `jsconfig.json`
    - `package.json`
    - `products_csv.csv`
    - `coverage/`
    - `src/`
      - `index.js` (app entry)
      - `controllers/` (API controllers)
      - `infrastructures/` (config / swagger)
      - `middlewares/` (auth, upload)
      - `repositories/` (data layer)
      - `routes/` (express routes)
      - `usecases/` (business logic)
      - `utils/` (helpers: csv, auth, error-handler)

  - `frontend/`
    - `package.json`
    - `public/` (static assets)
    - `src/`
      - `index.js` / `App.js`
      - `api/` (API config and clients)
      - `components/` (UI components)
      - `pages/` (Login, Products)
      - `routes/`

This structure mirrors the folders in this repository. For details, open the folders listed above.

**Environment variables (.env) — example**

Create `backend/.env` with contents like the example below. Adjust values to your environment and keep secrets out of source control.

```
# Server
PORT=3001

# Auth
JWT_SECRET=your_jwt_secret_here

# Admin user (used by the app for the sample/login flow)
ADMIN_USERNAME=admin@inventory.com
ADMIN_PASSWORD=securepassword123


```

Notes:
- The repository includes `products_csv.csv` in the `backend/` folder for sample product import. The app may use CSV import utilities found in `src/utils/csv.util.js`.
- If the backend stores the sample admin credentials elsewhere, use the `.env` values above or create the admin user via the API (see endpoints).

**Default / Example Login Credentials**

- User Name: `admin@inventory.com`
- Password: `securepassword123`

Place these in `backend/.env` as `ADMIN_EMAIL` and `ADMIN_PASSWORD` (or create a user with those credentials using the API).

**Config the Frontend API URL**

- The frontend calls the backend API using its API configuration in `frontend/src/api/config.js`. If your backend runs on a non-default port, update the `BASE_URL` or equivalent there to point to your backend (for example `http://localhost:3001`).

**Run Tests**

- Backend tests (Jest)

```powershell
cd backend
npm test
```

- Frontend tests (Create React App)

```powershell
cd frontend
npm test
```

**CSV Sample Data**

- The repository contains `backend/products_csv.csv` as an example CSV for bulk product import. Check `backend/src/utils/csv.util.js` and upload middleware if you want to import it.

**Troubleshooting**

- If `npm start` fails on the backend:
  - Confirm you ran `npm install` inside `backend/`.
  - Check the `backend/.env` for a valid `PORT` and `JWT_SECRET`.
  - Inspect the backend `package.json` `scripts` to confirm the start command.

- If frontend cannot reach backend:
  - Ensure backend is running and `BASE_URL` in `frontend/src/api/config.js` matches the backend URL.
  - If running both on localhost and you have CORS errors, confirm backend enables CORS (check `src/index.js` / middleware).

**Deploying / Next Steps**

- For production, build the frontend (`npm run build` in `frontend/`) and host the static files with a web server or serve them from the backend.
- Replace example secrets in `.env` with secure values and store them using your deployment platform's secret management.

**Where to look in the code**

- Backend entrypoint: `backend/src/index.js`
- Backend routes: `backend/src/routes/`
- Backend controllers: `backend/src/controllers/`
- Frontend API config: `frontend/src/api/config.js`
- Frontend pages and components: `frontend/src/pages/` and `frontend/src/components/`

-------
