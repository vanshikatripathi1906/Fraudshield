import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config";

function Register() {
  const navigate = useNavigate();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");

    const cleanName = name.trim();
    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      setErrorMessage(
        "Please fill in all fields."
      );

      return;
    }

    if (cleanName.length < 2) {
      setErrorMessage(
        "Name must be at least 2 characters."
      );

      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Password must be at least 8 characters."
      );

      return;
    }

    try {
      setLoading(true);

      await axios.post(
        
  `${API_URL}/api/auth/register`,
        {
          name: cleanName,
          email: cleanEmail,
          password: password
        }
      );

      alert(
        "Registration successful. Please login."
      );

      navigate("/login");

    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>
          Create Account
        </h1>

        <p>
          Create your FraudShield account.
        </p>

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label htmlFor="name">
              Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              autoComplete="name"
              disabled={loading}
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              disabled={loading}
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="new-password"
              minLength="8"
              disabled={loading}
              required
            />

          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Register;