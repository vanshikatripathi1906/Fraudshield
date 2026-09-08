import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage(
        "Please enter your email and password."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email: email.trim(),
          password: password
        },
        {
          withCredentials: true
        }
      );

      if (response.data?.user) {
        setIsLoggedIn(true);

        navigate("/dashboard");
      } else {
        setErrorMessage(
          "Login was unsuccessful. Please try again."
        );
      }
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to login. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-header">
          <h1>
            Welcome to FraudShield
          </h1>

          <p>
            Sign in to monitor your
            financial security.
          </p>
        </div>

        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;