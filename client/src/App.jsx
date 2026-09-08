import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import TransactionDetails from "./pages/TransactionDetails";
import Alerts from "./pages/Alerts";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";


function AppLayout() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>

        {/* Public Pages */}

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


        {/* Protected Pages */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions/:id"
          element={
            <ProtectedRoute>
              <TransactionDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />


        {/* Admin Page */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        {/* Unknown URL */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </>
  );
}


function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;