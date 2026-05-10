# CraftLink 🚀

### Link People Via Their Craft

CraftLink is a modern full-stack Skill Exchange and Freelance Community Platform where users can showcase their skills, connect with others, collaborate on projects, and exchange services through barter or paid models.

Built with the MERN Stack, CraftLink focuses on community-driven networking, real-time interaction, and seamless collaboration between learners, freelancers, and professionals.

---

## ✨ Features

- 🔐 JWT Authentication & Authorization
- 👤 User Registration & Login System
- 🛠️ Create, Edit & Delete Skill Listings
- 🔎 Browse & Search Skills
- 📂 Skill Categories & Tags
- 📊 Personalized Dashboard
- 💬 Real-Time Chat System (Socket.io Ready)
- ⭐ Ratings & Reviews System
- 📱 Fully Responsive UI
- ⚡ Fast & Modern React Frontend
- 🌐 REST API Architecture
- 🔒 Protected Routes & Secure Backend

---

## 🖥️ Tech Stack

| Frontend | Backend | Database | Authentication | Other |
|----------|----------|----------|----------------|-------|
| React.js | Node.js | MongoDB | JWT | Socket.io |
| CSS3 | Express.js | Mongoose | bcryptjs | GitHub |
| Vite | REST API | MongoDB Atlas | Middleware | Render/Vercel |

---

## 📁 Project Structure

```bash
craftlink/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── App.jsx
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
└── README.md
```

---

## 🚀 Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/craftlink.git
```

---

### 2️⃣ Install Frontend Dependencies

```bash
cd client
npm install
```

---

### 3️⃣ Install Backend Dependencies

```bash
cd ../server
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `server/` folder.

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

---

## ▶️ Run Frontend

```bash
cd client
npm run dev
```

---

## ▶️ Run Backend

```bash
cd server
npm run server
```

---

## 🌍 API Routes

### Auth Routes

| Method | Endpoint |
|--------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| GET | /api/auth/me |

### Skill Routes

| Method | Endpoint |
|--------|----------|
| GET | /api/skills |
| POST | /api/skills |
| DELETE | /api/skills/:id |

---

## 🎯 Project Goals

CraftLink aims to solve the problem of skill discovery and collaboration by creating a centralized platform where users can:

- Share their expertise
- Discover talented individuals
- Exchange services
- Build professional connections
- Collaborate on real-world projects

---

## 📸 Screenshots

Add your project screenshots here.

```md
![Home Page](./screenshots/home.png)
![Dashboard](./screenshots/dashboard.png)
```

---

## 🌐 Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## 👨‍💻 Developer

### Jai

Full Stack Developer passionate about building scalable and modern web applications using JavaScript technologies.

---

## 📌 Future Enhancements

- 🔔 Notifications System
- 📁 Portfolio Uploads
- 🌙 Dark Mode
- 💳 Payment Integration
- 🤝 AI Skill Matching
- 📈 Analytics Dashboard

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!

---

## 📜 License

This project is developed for learning and educational purposes.
