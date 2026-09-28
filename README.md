# Adhi EduBuddy 🎓

Adhi EduBuddy is a modern, production-ready full-stack Learning Management System (LMS) built with the MERN stack (MongoDB, Express.js, React, Node.js). 

It features an elegant UI with glassmorphism aesthetics, comprehensive role-based access control (Student, Instructor, Admin), secure authentication, video processing with Cloudinary, and robust payment integration via Stripe.

## 🌟 Key Features

### 👤 User Roles
- **Students**: Browse courses, purchase securely, track progress, watch video lessons, and leave reviews.
- **Instructors**: Create and manage courses, upload lessons/videos, track earnings, and view analytics.
- **Admins**: Monitor platform health, manage users, courses, and overall system metrics.

### 💳 Payments & E-Commerce
- Stripe Integration for secure checkout.
- Webhook handling for automated enrollment processing.

### 🎨 Modern UI/UX
- Responsive design built with Tailwind CSS.
- Glassmorphism effects and modern animations using Framer Motion concepts (Tailwind animations).
- Toast notifications and modal overlays for seamless interaction.

## 🛠 Technology Stack

**Frontend:**
- React 18 (Vite)
- Tailwind CSS
- React Router DOM v6
- Axios
- Lucide React (Icons)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & bcryptjs
- Stripe API
- Cloudinary (Media upload)
- Jest & Supertest (Testing)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Stripe Account (for payments)
- Cloudinary Account (for media uploads)

### 1. Installation

Clone the repository and install dependencies concurrently:
```bash
# Install root, client, and server dependencies
npm install
```

### 2. Environment Variables

Create `.env` files based on the provided examples.

**Root (`/.env`)**:
Copy `/.env.example` to `/.env` and fill in the values.

**Server (`/server/.env`)**:
Copy `/server/.env.example` to `/server/.env`.
Requires MongoDB URI, JWT Secret, Stripe Secret/Webhook Keys, and Cloudinary Config.

**Client (`/client/.env`)**:
Copy `/client/.env.example` to `/client/.env`.
Requires Vite API URL and Stripe Publishable Key.

### 3. Database Seeding (Optional)

To populate the database with initial admin and instructor accounts, plus some sample courses:
```bash
npm run seed
```

### 4. Running the Application

Run both frontend and backend concurrently in development mode:
```bash
npm run dev
```
- Frontend runs on `http://localhost:5173`
- Backend API runs on `http://localhost:5000`

## 🧪 Testing

The backend includes a comprehensive test suite covering authentication, authorization, course management, enrollment, and reviews using `Jest`, `Supertest`, and `mongodb-memory-server`.

```bash
cd server
npm test
```

## 📦 Deployment

This application is configured for a **Single-Server Deployment**. The Express backend will automatically serve the compiled React frontend in production. You can easily deploy the entire stack for free on Render.com.

### Deploy to Render
1. Push your code to a GitHub repository.
2. Go to [Render.com](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the **Build Command** to: `npm run install:all && npm run build`
5. Set the **Start Command** to: `npm start`
6. Add all the Environment Variables from your local `server/.env` file.
   - Also add `NODE_ENV` and set it to `production`.
7. Click **Deploy**.

## 📄 License

This project is proprietary and built for demonstration purposes.
