import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">

      <section className="hero-section">

        <h1>
          FraudShield
        </h1>

        <h2>
          Personal Financial Security Platform
        </h2>

        <p>
          Monitor your financial transactions,
          identify suspicious activity, and
          understand why a transaction was flagged.
        </p>

        <div className="hero-buttons">

          <Link to="/login">
            <button
              type="button"
              className="primary-button"
            >
              Login
            </button>
          </Link>

          <Link to="/register">
            <button
              type="button"
              className="secondary-button"
            >
              Create Account
            </button>
          </Link>

        </div>

      </section>


      <section className="feature-section">

        <h2>
          Why FraudShield?
        </h2>

        <div className="feature-cards">

          <div className="feature-card">

            <h3>
              Transaction Monitoring
            </h3>

            <p>
              Keep track of your financial
              transactions from a single dashboard
              and review your recent activity.
            </p>

          </div>


          <div className="feature-card">

            <h3>
              Explainable Detection
            </h3>

            <p>
              Understand exactly why a transaction
              was flagged instead of receiving only
              an unexplained risk score.
            </p>

          </div>


          <div className="feature-card">

            <h3>
              Secure Alerts
            </h3>

            <p>
              Review suspicious transactions and
              manage fraud alerts from one place.
            </p>

          </div>

        </div>

      </section>


      <section className="home-security-section">

        <h2>
          Your Financial Security, Simplified
        </h2>

        <p>
          FraudShield uses transparent rule-based
          checks to identify unusual transaction
          behaviour and provide understandable
          fraud alerts.
        </p>

      </section>

    </div>
  );
}

export default Home;