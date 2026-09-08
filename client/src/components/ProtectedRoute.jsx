import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";

function ProtectedRoute({
  children,
  adminOnly = false
}) {
  const [loading, setLoading] =
    useState(true);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [isAdmin, setIsAdmin] =
    useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response =
          await axios.get(
            `${API_URL}/api/auth/profile`,
            {
              withCredentials: true
            }
          );

        const user =
          response.data?.user;

        if (!user) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          return;
        }

        setIsAuthenticated(true);

        setIsAdmin(
          user.role === "ADMIN"
        );
      } catch (error) {
        console.log(error);

        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  if (loading) {
    return (
      <p>
        Checking login...
      </p>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    adminOnly &&
    !isAdmin
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;