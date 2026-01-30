# Expense Track — Fullstack (Express + Prisma + Postgres + React)

Aplicación fullstack para **gestionar gastos personales** con autenticación y rutas protegidas.  
Incluye CRUD de gastos, filtros básicos y sesión con **JWT en cookie HTTP-only**.

> Objetivo del proyecto: practicar un backend real con TypeScript (Express), Prisma + PostgreSQL y un frontend moderno con React + Vite + shadcn/ui.

---

## ✨ Features

### Backend
- ✅ Registro / Login / Logout
- ✅ Sesión persistente con `JWT` en **cookie HTTP-only**
- ✅ Rutas protegidas (solo usuarios autenticados)
- ✅ CRUD de gastos por usuario (nadie puede ver/modificar gastos de otro)
- ✅ Validación con **Zod**
- ✅ Filtros por query (fecha, monto, categoría, búsqueda, `limit`)
- ✅ PostgreSQL + Prisma (migraciones incluidas)

### Frontend
- ✅ Auth flow (register/login/logout)
- ✅ `ProtectedRoute` + `AuthContext` con `/auth/me`
- ✅ Dashboard con listado de gastos
- ✅ Crear/editar/eliminar gastos
- ✅ UI con shadcn/ui + Tailwind

---

## 🧱 Stack

**Backend:** TypeScript, Node.js, Express, Prisma, PostgreSQL, Zod, bcrypt, jsonwebtoken, cors, cookie-parser  
**Frontend:** React, Vite, React Router, Tailwind, shadcn/ui, Radix UI  
**DB:** PostgreSQL (Docker Compose opcional)

---
## 📂 Estructura del repo
```text
backend/
frontend/
  expense-track/
```
> Nota: El frontend real vive en `frontend/expense-track`.

---

## Requisitos
- Node.js + npm
- PostgreSQL (o Docker + Docker Compose)

## 🚀 Quick Start (Local)

### 1) Clonar
```bash
git clone https://github.com/FranklyBautista/Expense-Track.git
cd Expense-Track
```

### 2) Levantar PostgreSQL (Docker) — recomendado
```bash
cd backend
docker compose up -d
```
### 3) Variables de entorno (backend/.env)

```env
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://expense_user:expense_pass@localhost:5432/expense_db?schema=public"
JWT_SECRET="cambia_esto_por_un_secreto_largo"
```

### Frontend (frontend/expense-track/.env)
```env
VITE_API_URL=http://localhost:3000
```

### Backend: instalar + migrar + correr

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```


### Frontend: instalar + correr
```bash
cd ../frontend/expense-track
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000


---

## 🔐 API (Endpoints)

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (protegida)
- `POST /auth/logout`

### Expenses (protegidas)
- `GET /expenses`
- `GET /expenses/:id`
- `POST /expenses`
- `PATCH /expenses/:id`
- `DELETE /expenses/:id`

La sesión se maneja con cookie token (HTTP-only). En el frontend se envía con `credentials: "include"`.



