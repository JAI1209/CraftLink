import {
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SkillListings from "./pages/SkillListings";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import AddSkill from "./pages/AddSkill";

import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <MainLayout>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/skills"
          element={
            <SkillListings />
          }
        />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-skill"
          element={
            <ProtectedRoute>
              <AddSkill />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MainLayout>
  );
};

export default App;