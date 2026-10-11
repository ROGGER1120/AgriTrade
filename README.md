# 🌾 AgriTrade - Smart Agricultural Trade & ERP Platform

AgriTrade is an integrated full-stack E-Business and Enterprise Resource Planning (ERP) platform tailored for the modern agricultural ecosystem. It connects farmers, agricultural suppliers, buyers, and warehouse managers in a unified system for commerce, inventory management, procurement, and analytics.

---

## 🌟 Key Features

- **🛒 Farmer & Buyer Storefront**: Product catalog for seeds, fertilizers, machinery, crop protection, with real-time cart and order placement.
- **📊 Real-time Dashboard & Analytics**: Key financial metrics, revenue trends, inventory levels, and visual charts powered by Recharts.
- **📦 Inventory & Storage Management**: Multi-category stock tracking, batch movements, audit logs, and low-stock alerts.
- **🤝 Procurement & Vendor Management**: Supplier directory, Purchase Orders (PO) lifecycle tracking, and automated stock receipt reconciliation.
- **💳 Sales Orders & POS**: Order management, payment tracking, and on-demand PDF invoice/receipt generation via jsPDF.
- **👥 Farmer & Customer CRM**: Directory with purchase history, credit/balance tracking, and contact details.
- **🔐 Role-Based Access Control (RBAC)**: Secure JWT authentication with Admin and Farmer roles, plus 1-click Demo Login.

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Document Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (Express 5)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs`
- **Logging**: Morgan HTTP logger

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.x or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.x or higher
- **MongoDB**: Local MongoDB instance running on port `27017` or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI

---

## 🚀 Getting Started & Setup Guide

### 1. Clone the Repository
```bash
git clone https://github.com/ROGGER1120/AgriTrade.git
cd AgriTrade
```

---

### 2. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file inside the `backend/` directory (you can copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   *Or manually create `backend/.env` with:*
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/agritrade
   JWT_SECRET=agritrade_super_secret_jwt_key_2026_cropbuddy_erp
   NODE_ENV=development
   ```

4. **Seed Database with Sample Data**:
   Populate initial products, categories, suppliers, orders, and demo accounts:
   ```bash
   npm run seed
   ```

5. **Start the Backend Server**:
   ```bash
   npm start
   ```
   The backend API will run at `http://localhost:5000`. You can verify by visiting `http://localhost:5000/api/health`.

---

### 3. Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite Development Server**:
   ```bash
   npm run dev
   ```
   The frontend application will start at `http://localhost:5173`.
   *(Vite is pre-configured to proxy `/api` requests directly to `http://localhost:5000`)*.

---

## 🔑 Demo Credentials

You can use the built-in **1-Click Demo Login** buttons on the login screen or enter the credentials below:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin / Manager** | `admin@agritrade.com` | `admin123password` |
| **Farmer / Customer** | `ramesh.farmer@gmail.com` | `farmer123password` |

---

## 📁 Project Structure

```text
AgriTrade/
├── backend/
│   ├── config/              # Database connection (Mongoose)
│   ├── controllers/         # Business logic for auth, products, orders, reports, etc.
│   ├── middleware/          # JWT auth & role authorization middlewares
│   ├── models/              # Mongoose data schemas (User, Product, Order, PO, etc.)
│   ├── routes/              # Express API route declarations
│   ├── .env.example         # Template for environment variables
│   ├── package.json         # Backend dependencies & scripts
│   ├── seed.js              # Initial sample dataset seeder
│   └── server.js            # Express application entry point
├── frontend/
│   ├── public/              # Static assets and icons
│   ├── src/
│   │   ├── api/             # Centralized API client (`client.js`)
│   │   ├── components/      # Reusable UI elements (Header, Sidebar, modals)
│   │   ├── context/         # AuthContext and CartContext state providers
│   │   ├── views/           # Views (Dashboard, Inventory, Procurement, Storefront, etc.)
│   │   ├── utils/           # Utility functions (PDF invoice generator)
│   │   ├── App.jsx          # Main application router/view switcher
│   │   └── main.jsx         # React application root
│   ├── package.json         # Frontend dependencies & scripts
│   └── vite.config.js       # Vite bundler & API proxy configuration
├── .gitignore               # Root git ignore rules
└── README.md                # Project documentation & setup instructions
```

---

## 🔌 API Endpoints Reference

| Module | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **System** | `/api/health` | GET | Check backend health status |
| **Auth** | `/api/auth/login` | POST | Login with email & password |
| **Auth** | `/api/auth/demo-login` | POST | 1-click login for demo roles |
| **Auth** | `/api/auth/me` | GET | Retrieve authenticated profile |
| **Products** | `/api/products` | GET, POST | List products / Add new product |
| **Products** | `/api/products/:id/adjust-stock` | POST | Adjust inventory quantity with reason |
| **Procurement** | `/api/procurement/suppliers` | GET, POST | Manage supplier directory |
| **Procurement** | `/api/procurement/purchases` | GET, POST | Manage Purchase Orders (PO) |
| **Procurement** | `/api/procurement/purchases/:id/receive` | POST | Receive goods and update stock |
| **Orders** | `/api/orders` | GET, POST | View and create customer sales orders |
| **Orders** | `/api/orders/:id/status` | PUT | Update order fulfillment status |
| **Customers** | `/api/customers` | GET, POST | Farmer and customer database |
| **Reports** | `/api/reports/dashboard` | GET | Summary analytics for dashboard |
| **Reports** | `/api/reports/sales` | GET | Sales breakdowns and revenue metrics |
| **Reports** | `/api/reports/inventory` | GET | Inventory valuation and stock status |

---

## 📜 License

This project is licensed under the [ISC License](LICENSE).
