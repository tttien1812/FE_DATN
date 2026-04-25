import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Admin from "./pages/Admin/AdminLayout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import UserLayout from "./pages/User/Userlayout.jsx";
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <Admin />
          </PrivateRoute>
        }
      />

      <Route
        path="/user"
        element={
          <PrivateRoute>
            <UserLayout />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
