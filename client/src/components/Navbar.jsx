import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";
import axios from "axios";
import API_URL from "../config";

function Navbar() {
  const [isAdmin, setIsAdmin] =
    useState(false);

  const [userName, setUserName] =
    useState("");

  const [logoutError, setLogoutError] =
    useState("");

  const navigate = useNavigate();
  const location = useLocation();

  /*
    Get logged-in user's profile
  */
  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/auth/profile`,
          {
            withCredentials: true
          }
        );

        const user =
          response.data.user;

        setIsAdmin(
          user?.role === "ADMIN"
        );

        setUserName(
          user?.name || ""
        );
      } catch (error) {
        console.log(error);

        setIsAdmin(false);
        setUserName("");
      }
    };

    getProfile();
  }, []);

  /*
    Logout user
  */
  const handleLogout = async () => {
    try {
      setLogoutError("");

      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true
        }
      );

      navigate("/login");
    } catch (error) {
      console.log(error);

      setLogoutError(
        "Unable to logout. Please try again."
      );
    }
  };

  /*
    Check whether navigation link
    is currently active
  */
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">

      {/* ================= BRAND ================= */}

      <div className="navbar-brand">

        <Link to="/dashboard">

          <div className="navbar-logo">
            FS
          </div>

          <div className="navbar-brand-text">

            <strong>
              FraudShield
            </strong>

            {/* <span>
              Financial Security
            </span> */}

          </div>

        </Link>

      </div>


      {/* ================= NAVIGATION ================= */}

      <div className="nav-links">

        <Link
          to="/dashboard"
          className={
            isActive("/dashboard")
              ? "nav-link active"
              : "nav-link"
          }
        >
          Dashboard
        </Link>


        <Link
          to="/transactions"
          className={
            isActive("/transactions")
              ? "nav-link active"
              : "nav-link"
          }
        >
          Transactions
        </Link>


        <Link
          to="/alerts"
          className={
            isActive("/alerts")
              ? "nav-link active"
              : "nav-link"
          }
        >
          Alerts
        </Link>


        {isAdmin && (
          <Link
            to="/admin"
            className={
              isActive("/admin")
                ? "nav-link active"
                : "nav-link"
            }
          >
            Admin
          </Link>
        )}

      </div>


      {/* ================= USER ACTIONS ================= */}

      <div className="nav-actions">

        {userName && (
          <div className="nav-user">

            {/* <div className="nav-user-avatar">
              {userName
                .charAt(0)
                .toUpperCase()}
            </div> */}

            <div className="nav-user-info">

              <span>
                Welcome
              </span>

              <strong>
                {userName}
              </strong>

            </div>

          </div>
        )}


        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>


      {/* ================= LOGOUT ERROR ================= */}

      {logoutError && (
        <div className="nav-error">
          {logoutError}
        </div>
      )}

    </nav>
  );
}

export default Navbar;