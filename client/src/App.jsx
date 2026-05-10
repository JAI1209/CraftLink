import {
  
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SkillListings from "./pages/SkillListings";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import AddSkill from "./pages/AddSkill";
import ProtectedRoute from "./components/ProtectedRoute";


const App = () => {
  return (
    
      <MainLayout>
        <Routes>
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
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
            element={<SkillListings />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/add-skill"
            element={<AddSkill />}
          />

        </Routes>
      </MainLayout>
    
  );
};

export default App;