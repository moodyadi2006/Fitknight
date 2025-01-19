# Project: FITKNIGHT

## Overview

**FITKNIGHT** is a full-stack application designed to help users find and connect with workout buddies and discover fitness groups that suit them. The project comprises:
- A **backend** built with **Node.js** and **Express**.
- A **frontend** built with **React** and **Vite**.

### Key Features:
- **User Authentication**: Secure sign-up, login, and session management using JWT (JSON Web Tokens).
- **Buddy Search**: Find compatible workout partners based on preferences like fitness goals, workout preferences, and location.
- **Group Creation**: Create and manage workout groups for collective fitness activities.
- **Real-Time Chat**: Communicate seamlessly with workout buddies and group members using WebSocket integration.
- **Satisfactory UI**: Optimized for desktop, ensuring an enhanced user experience.

---

## Website

Visit the application: [FITKNIGHT](https://fitknight-yz0a.onrender.com/)

---

## Tech Stack

### Backend:
- **Node.js**: Server-side JavaScript runtime.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing user and group data.
- **Mongoose**: ODM for MongoDB.
- **Socket.IO**: Enables real-time, bidirectional communication for chat functionality.

### Frontend:
- **React**: Library for building interactive user interfaces.
- **Vite**: Next-generation frontend tooling for fast builds and development.
- **Tailwind CSS**: Utility-first CSS framework for styling.

---

## Installation

### Prerequisites:
- **Node.js** (v16 or above)
- **MongoDB** instance running locally or remotely
- **Git**

### Steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Fitknight.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd Fitknight
   ```

3. **Install dependencies for the backend:**
   ```bash
   cd Backend
   npm install
   ```

4. **Install dependencies for the frontend:**
   ```bash
   cd ../Frontend
   npm install
   ```

5. **Configure environment variables:**
   - Create a `.env` file in the `Backend` directory and set the following variables:
     ```env
     PORT=3000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     ```

6. **Start the development servers:**

   - **Backend:**
     ```bash
     cd backend
     npm run dev
     ```
   
   - **Frontend:**
     ```bash
     cd ../Frontend
     npm run dev
     ```

---

## Usage

1. Open the frontend in your browser at `http://localhost:5173`.
2. Create an account or log in to access the application.
3. Search for workout buddies or create groups.
4. Use the chat feature to communicate in real-time.

---

**Make your fitness journey fun and social with FITKNIGHT!**

---

Feel free to reach out with any questions or feedback. Let’s build a stronger, fitter community together!

