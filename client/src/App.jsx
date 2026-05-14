import { Routes, Route, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SkillListings from "./pages/SkillListings";
import SkillDetail from "./pages/SkillDetail";
import Dashboard from "./pages/Dashboard";
import CrowdfundingProjectDetail from "./pages/CrowdfundingProjectDetail";
import ChallengeDetail from "./pages/ChallengeDetail";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import ProfilePage from "./pages/ProfilePage";
import AddSkill from "./pages/AddSkill";
import EditSkill from "./pages/EditSkill";
import SavedSkills from "./pages/SavedSkills";
import Requests from "./pages/Requests";
import Notes from "./pages/Notes";
import ProtectedRoute from "./components/ProtectedRoute";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/skills" element={<SkillListings />} />
    <Route path="/skills/:id" element={<SkillDetail />} />
    <Route path="/profile/:id" element={<ProfilePage />} />

    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/crowdfunding/:id" element={<ProtectedRoute><CrowdfundingProjectDetail /></ProtectedRoute>} />
    <Route path="/challenges/:id" element={<ProtectedRoute><ChallengeDetail /></ProtectedRoute>} />
    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/add-skill" element={<ProtectedRoute><AddSkill /></ProtectedRoute>} />
    <Route path="/edit-skill/:id" element={<ProtectedRoute><EditSkill /></ProtectedRoute>} />
    <Route path="/saved-skills" element={<ProtectedRoute><SavedSkills /></ProtectedRoute>} />
    <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
    <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
  </Routes>
);

const App = () => {
  const location = useLocation();
  const hideLayout = location.pathname === "/messages";
  if (hideLayout) return <AppRoutes />;
  return <MainLayout><AppRoutes /></MainLayout>;
};

export default App;
