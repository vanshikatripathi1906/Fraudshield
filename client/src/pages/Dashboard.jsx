import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import TransactionForm from "../components/TransactionForm";
import CSVUpload from "../components/CSVUpload";
import API_URL from "../config";

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const getDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [
        transactionsResponse,
        alertsResponse
      ] = await Promise.all([
        axios.get(
          `${API_URL}/api/transactions`,
          {
            withCredentials: true
          }
        ),

        axios.get(
          `${API_URL}/api/fraud-alerts`,
          {
            withCredentials: true
          }
        )
      ]);

      setTransactions(
        Array.isArray(
          transactionsResponse.data.transactions
        )
          ? transactionsResponse.data.transactions
          : []
      );

      setAlerts(
        Array.isArray(
          alertsResponse.data.alerts
        )
          ? alertsResponse.data.alerts
          : []
      );

    } catch (error) {
      console.error(
        "Unable to load dashboard:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load dashboard data"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const totalTransactions =
    transactions.length;

  const totalAlerts =
    alerts.length;

  const openAlerts =
    alerts.filter(
      (alert) =>
        alert.status === "OPEN"
    ).length;

  const mediumRiskAlerts =
    alerts.filter(
      (alert) =>
        alert.riskLevel === "MEDIUM"
    ).length;

  const highRiskAlerts =
    alerts.filter(
      (alert) =>
        alert.riskLevel === "HIGH"
    ).length;

  const criticalRiskAlerts =
    alerts.filter(
      (alert) =>
        alert.riskLevel === "CRITICAL"
    ).length;

  const recentTransactions =
    transactions.slice(0, 5);

  const recentAlerts =
    alerts.slice(0, 5);

  return (
    <main className="dashboard-page">

      {/* Dashboard Header */}
      <section className="dashboard-header">

        <div>

          <h1>
            FraudShield Dashboard
          </h1>

          <p className="dashboard-subtitle">
            Monitor your transactions and
            detected fraud alerts in one place.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh-button"
          onClick={getDashboardData}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh Dashboard"}
        </button>

      </section>

      {/* Error */}
      {errorMessage && (
        <section className="dashboard-error">

          <div>
            <strong>
              Unable to load dashboard
            </strong>

            <p>
              {errorMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={getDashboardData}
          >
            Try Again
          </button>

        </section>
      )}

      {/* Loading */}
      {loading ? (
        <section className="dashboard-loading">
          <div className="dashboard-loading-card">
            <p>
              Loading your financial activity...
            </p>
          </div>
        </section>
      ) : (
        <>

          {/* Statistics */}
          <section className="dashboard-stats">

            <div className="stat-card">
              <span className="stat-label">
                Total Transactions
              </span>

              <strong className="stat-value">
                {totalTransactions}
              </strong>

              <span className="stat-description">
                Transactions recorded
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">
                Fraud Alerts
              </span>

              <strong className="stat-value">
                {totalAlerts}
              </strong>

              <span className="stat-description">
                Suspicious activity detected
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">
                Open Alerts
              </span>

              <strong className="stat-value">
                {openAlerts}
              </strong>

              <span className="stat-description">
                Require your attention
              </span>
            </div>

            <div className="stat-card stat-medium">
              <span className="stat-label">
                Medium Risk
              </span>

              <strong className="stat-value">
                {mediumRiskAlerts}
              </strong>

              <span className="stat-description">
                Medium-risk activity
              </span>
            </div>

            <div className="stat-card stat-high">
              <span className="stat-label">
                High Risk
              </span>

              <strong className="stat-value">
                {highRiskAlerts}
              </strong>

              <span className="stat-description">
                High-risk activity
              </span>
            </div>

            <div className="stat-card stat-critical">
              <span className="stat-label">
                Critical Risk
              </span>

              <strong className="stat-value">
                {criticalRiskAlerts}
              </strong>

              <span className="stat-description">
                Critical-risk activity
              </span>
            </div>

          </section>

          {/* Quick Actions */}
          <section className="dashboard-section">

            <div className="section-heading">
              <div>
                <h2>
                  Manage your activity
                </h2>

                <p>
                  Add transactions or import
                  your statement to analyze activity.
                </p>
              </div>
            </div>

            <div className="dashboard-action-grid">

              <div className="dashboard-action-card">

                <div className="action-icon">
                  +
                </div>

                <div>
                  <h3>
                    Add Transaction
                  </h3>

                  <p>
                    Manually record a transaction
                    for fraud analysis.
                  </p>
                </div>

              </div>

              <div className="dashboard-action-card">

                <div className="action-icon">
                  ↑
                </div>

                <div>
                  <h3>
                    Upload Statement
                  </h3>

                  <p>
                    Import multiple transactions
                    using a CSV statement.
                  </p>
                </div>

              </div>

            </div>

            <div className="dashboard-input-grid">

              <div className="dashboard-form-card">
                <TransactionForm
                  onTransactionAdded={
                    getDashboardData
                  }
                />
              </div>

              <div className="dashboard-form-card">
                <CSVUpload
                  onUploadComplete={
                    getDashboardData
                  }
                />
              </div>

            </div>

          </section>

          {/* Recent Activity */}
          <section className="dashboard-section">

            <div className="section-heading">

              <div>
                <h2>
                  Recent Activity
                </h2>

                <p>
                  Your latest transactions and
                  fraud alerts.
                </p>
              </div>

              <Link
                to="/transactions"
                className="section-link"
              >
                View Transactions →
              </Link>

            </div>

            <div className="dashboard-activity-grid">

              {/* Recent Transactions */}
              <div className="dashboard-activity-section">

                <div className="activity-header">
                  <h3>
                    Recent Transactions
                  </h3>

                  <span>
                    {totalTransactions} total
                  </span>
                </div>

                {recentTransactions.length === 0 ? (
                  <div className="dashboard-empty">
                    <strong>
                      No transactions yet
                    </strong>

                    <p>
                      Add a transaction or upload
                      a statement to get started.
                    </p>
                  </div>
                ) : (
                  <div className="dashboard-activity-list">

                    {recentTransactions.map(
                      (transaction) => (
                        <div
                          key={transaction._id}
                          className="dashboard-transaction"
                        >

                          <div>
                            <strong>
                              {transaction.merchant ||
                                "Unknown Merchant"}
                            </strong>

                            <span>
                              {transaction.paymentMethod ||
                                "Unknown payment"}
                              {" · "}
                              {transaction.location ||
                                "Unknown location"}
                            </span>

                            <small>
                              {transaction.transactionTime
                                ? new Date(
                                    transaction.transactionTime
                                  ).toLocaleString()
                                : "Unknown date"}
                            </small>
                          </div>

                          <div className="transaction-amount">
                            ₹
                            {Number(
                              transaction.amount || 0
                            ).toLocaleString("en-IN")}
                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* Recent Alerts */}
              <div className="dashboard-activity-section">

                <div className="activity-header">

                  <h3>
                    Recent Fraud Alerts
                  </h3>

                  <Link
                    to="/alerts"
                    className="section-link"
                  >
                    View All →
                  </Link>

                </div>

                {recentAlerts.length === 0 ? (
                  <div className="dashboard-empty safe-empty">

                    <strong>
                      No suspicious activity
                    </strong>

                    <p>
                      FraudShield has not detected
                      any suspicious activity yet.
                    </p>

                  </div>
                ) : (
                  <div className="dashboard-activity-list">

                    {recentAlerts.map(
                      (alert) => {

                        const reasons =
                          Array.isArray(
                            alert.reasons
                          )
                            ? alert.reasons
                            : [];

                        return (
                          <div
                            key={alert._id}
                            className="dashboard-alert"
                          >

                            <div className="alert-top-row">

                              <div>
                                <strong>
                                  {alert.transactionId
                                    ?.merchant ||
                                    "Unknown Merchant"}
                                </strong>

                                <span>
                                  Risk score:{" "}
                                  {alert.riskScore}/90
                                </span>
                              </div>

                              <span
                                className={`risk-badge risk-${(
                                  alert.riskLevel ||
                                  "LOW"
                                ).toLowerCase()}`}
                              >
                                {alert.riskLevel}
                              </span>

                            </div>

                            {reasons.length > 0 && (
                              <div className="alert-reason-preview">
                                {reasons[0]}
                              </div>
                            )}

                            <div className="alert-bottom-row">

                              <span>
                                Status:{" "}
                                {alert.status}
                              </span>

                              <span>
                                Priority:{" "}
                                {alert.priority}
                              </span>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </div>

            </div>

          </section>

        </>
      )}

    </main>
  );
}

export default Dashboard;