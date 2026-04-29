





# 🌸 MindBloom

MindBloom is a mental health companion app that helps you track your mood, journal your thoughts, and get AI-powered insights.
<video src="https://github.com/user-attachments/assets/f11cab3b-8a46-48a5-9c86-d8177bebf5fd" controls="controls" style="max-width: 100%;">
</video>

## 🚀 Deployment Instructions

This project is set up as a monorepo with a Node.js backend and a React frontend.

### **1. Recommended Platform: Render**
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect this GitHub repository.
3. Use the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
   - **Start Command**: `node backend/server.js`
4. Add your **Environment Variables**:
   - `MONGODB_URI`: Your MongoDB Atlas string
   - `JWT_SECRET`: A long random string
   - `GROQ_API_KEY`: Your Groq API key
   - `NODE_ENV`: `production`

### **2. Recommended Platform: Railway**
1. Create a new project on [Railway](https://railway.app/).
2. Connect your GitHub repo.
3. Railway will automatically detect the `Procfile` and deploy.
4. Add the same Environment Variables as above.

## 🛠️ Local Development
1. Clone the repo.
2. Run `npm run install-all` in the root.
3. Set up `.env` files in both `backend/` and `frontend/`.
4. Run `npm run dev` in `backend/` and `npm start` in `frontend/`.
