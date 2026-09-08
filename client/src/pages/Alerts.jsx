import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config";

function Alerts() {
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingAlert, setUpdatingAlert] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [riskFilter, setRiskFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [searchText, setSearchText] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState("NEWEST");

  /*
    Get all fraud alerts
  */
  const getAlerts = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.get(
  `${API_URL}/api/fraud-alerts`,
        {
          withCredentials: true
        }
      );

      setAlerts(
        Array.isArray(
          response.data.alerts
        )
          ? response.data.alerts
          : []
      );
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load fraud alerts"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
    Load alerts when page opens
  */
  useEffect(() => {
    const loadAlerts = async () => {
      await getAlerts();
    };

    loadAlerts();
  }, []);

  /*
    Update alert status
  */
  const updateAlertStatus = async (
    alertId,
    status
  ) => {
    try {
      setUpdatingAlert(alertId);
      setErrorMessage("");
      setSuccessMessage("");

      await axios.put(
  `${API_URL}/api/fraud-alerts/${alertId}`,
        {
          status: status
        },
        {
          withCredentials: true
        }
      );

      setSuccessMessage(
        `Alert marked as ${status.toLowerCase()}.`
      );

      await getAlerts();
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to update alert"
      );
    } finally {
      setUpdatingAlert(null);
    }
  };

  /*
    Search and filter alerts
  */
  const search =
    searchText.toLowerCase().trim();

  const filteredAlerts = alerts.filter(
    (alert) => {
      const matchesRisk =
        riskFilter === "ALL" ||
        alert.riskLevel === riskFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        alert.status === statusFilter;

      const reasons =
        Array.isArray(alert.reasons)
          ? alert.reasons
          : [];

      const merchant =
        alert.transactionId?.merchant
          ?.toLowerCase() || "";

      const location =
        alert.transactionId?.location
          ?.toLowerCase() || "";

      const device =
        alert.transactionId?.device
          ?.toLowerCase() || "";

      const matchesSearch =
        search === "" ||
        merchant.includes(search) ||
        location.includes(search) ||
        device.includes(search) ||
        reasons.some((reason) =>
          String(reason)
            .toLowerCase()
            .includes(search)
        );

      return (
        matchesRisk &&
        matchesStatus &&
        matchesSearch
      );
    }
  );

  /*
    Sort alerts
  */
  const sortedAlerts = [
    ...filteredAlerts
  ].sort((a, b) => {
    if (
      sortOrder === "HIGHEST_RISK"
    ) {
      return (
        Number(b.riskScore || 0) -
        Number(a.riskScore || 0)
      );
    }

    if (
      sortOrder === "OLDEST"
    ) {
      return (
        new Date(a.createdAt) -
        new Date(b.createdAt)
      );
    }

    return (
      new Date(b.createdAt) -
      new Date(a.createdAt)
    );
  });

  /*
    Summary numbers
  */
  const totalAlerts =
    alerts.length;

  const openAlerts =
    alerts.filter(
      (alert) =>
        alert.status === "OPEN"
    ).length;

  const reviewedAlerts =
    alerts.filter(
      (alert) =>
        alert.status === "REVIEWED"
    ).length;

  const dismissedAlerts =
    alerts.filter(
      (alert) =>
        alert.status === "DISMISSED"
    ).length;

  const criticalAlerts =
    alerts.filter(
      (alert) =>
        alert.riskLevel === "CRITICAL"
    ).length;

  /*
    Clear all filters
  */
  const clearFilters = () => {
    setRiskFilter("ALL");
    setStatusFilter("ALL");
    setSearchText("");
    setSortOrder("NEWEST");
  };

  /*
    Risk CSS class
  */
  const getRiskClass = (
    riskLevel
  ) => {
    if (
      riskLevel === "CRITICAL"
    ) {
      return "risk-critical";
    }

    if (
      riskLevel === "HIGH"
    ) {
      return "risk-high";
    }

    if (
      riskLevel === "MEDIUM"
    ) {
      return "risk-medium";
    }

    return "risk-low";
  };

  /*
    Status CSS class
  */
  const getStatusClass = (
    status
  ) => {
    if (
      status === "REVIEWED"
    ) {
      return "status-reviewed";
    }

    if (
      status === "DISMISSED"
    ) {
      return "status-dismissed";
    }

    return "status-open";
  };

  return (
    <div className="alerts-page">

      <main className="alerts-container">

        {/* ================= HEADER ================= */}

        <section className="alerts-header">

          <div>
            <h1>
              Fraud Alerts
            </h1>

            <p>
              Review suspicious transactions
              detected by FraudShield.
            </p>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={getAlerts}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh Alerts"}
          </button>

        </section>


        {/* ================= MESSAGES ================= */}

        {errorMessage && (
          <div className="dashboard-error">

            <div>
              <strong>
                Something went wrong
              </strong>

              <p>
                {errorMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={getAlerts}
            >
              Try Again
            </button>

          </div>
        )}


        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}


        {/* ================= SUMMARY ================= */}

        <section className="alert-summary">

          <div className="alert-summary-card">
            <span>
              Total Alerts
            </span>

            <strong>
              {totalAlerts}
            </strong>
          </div>

          <div className="alert-summary-card">
            <span>
              Open
            </span>

            <strong>
              {openAlerts}
            </strong>
          </div>

          <div className="alert-summary-card">
            <span>
              Reviewed
            </span>

            <strong>
              {reviewedAlerts}
            </strong>
          </div>

          <div className="alert-summary-card">
            <span>
              Dismissed
            </span>

            <strong>
              {dismissedAlerts}
            </strong>
          </div>

          <div className="alert-summary-card">
            <span>
              Critical
            </span>

            <strong>
              {criticalAlerts}
            </strong>
          </div>

        </section>


        {/* ================= FILTERS ================= */}

        <section className="alerts-filter-section">

          <div className="filter-header">

            <div>
              <h2>
                Find Alerts
              </h2>

              <p className="filter-description">
                Search and filter suspicious
                transactions.
              </p>
            </div>

            <button
              type="button"
              className="clear-filter-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>


          <div className="alerts-filters">

            {/* SEARCH */}

            <div className="filter-group">

              <label htmlFor="alert-search">
                Search
              </label>

              <input
                id="alert-search"
                type="text"
                placeholder="Merchant, location, device or reason..."
                value={searchText}
                onChange={(event) =>
                  setSearchText(
                    event.target.value
                  )
                }
              />

            </div>


            {/* RISK FILTER */}

            <div className="filter-group">

              <label htmlFor="risk-filter">
                Risk Level
              </label>

              <select
                id="risk-filter"
                value={riskFilter}
                onChange={(event) =>
                  setRiskFilter(
                    event.target.value
                  )
                }
              >
                <option value="ALL">
                  All Risk Levels
                </option>

                <option value="LOW">
                  Low
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="CRITICAL">
                  Critical
                </option>
              </select>

            </div>


            {/* STATUS FILTER */}

            <div className="filter-group">

              <label htmlFor="status-filter">
                Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="OPEN">
                  Open
                </option>

                <option value="REVIEWED">
                  Reviewed
                </option>

                <option value="DISMISSED">
                  Dismissed
                </option>
              </select>

            </div>


            {/* SORT */}

            <div className="filter-group">

              <label htmlFor="sort-filter">
                Sort By
              </label>

              <select
                id="sort-filter"
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(
                    event.target.value
                  )
                }
              >
                <option value="NEWEST">
                  Newest First
                </option>

                <option value="OLDEST">
                  Oldest First
                </option>

                <option value="HIGHEST_RISK">
                  Highest Risk
                </option>
              </select>

            </div>

          </div>


          <div className="filter-result">

            Showing{" "}

            <strong>
              {sortedAlerts.length}
            </strong>

            {" "}of{" "}

            <strong>
              {totalAlerts}
            </strong>

            {" "}alerts

          </div>

        </section>


        {/* ================= CONTENT ================= */}

        {loading ? (

          <section className="dashboard-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading fraud alerts...
            </p>

          </section>

        ) : alerts.length === 0 ? (

          <section className="dashboard-empty">

            <h2>
              No Fraud Alerts
            </h2>

            <p>
              FraudShield has not detected
              any suspicious activity yet.
            </p>

          </section>

        ) : sortedAlerts.length === 0 ? (

          <section className="dashboard-empty">

            <h2>
              No Matching Alerts
            </h2>

            <p>
              No alerts match your current
              search or filters.
            </p>

            <button
              type="button"
              className="clear-filter-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </section>

        ) : (

          <section className="alerts-list">

            {sortedAlerts.map(
              (alert) => {

                const reasons =
                  Array.isArray(
                    alert.reasons
                  )
                    ? alert.reasons
                    : [];

                const riskScore =
                  Number(
                    alert.riskScore || 0
                  );

                const riskClass =
                  getRiskClass(
                    alert.riskLevel
                  );

                return (

                  <article
                    key={alert._id}
                    className="alert-detail-card"
                  >

                    {/* =================
                        RISK LEVEL
                    ================= */}

                    <div className="risk-level-section">

                      <p className="risk-level-label">
                        Risk Level
                      </p>

                      <h2
                        className={`risk-level-value ${riskClass}`}
                      >
                        {alert.riskLevel ||
                          "UNKNOWN"}
                      </h2>

                    </div>


                    {/* =================
                        ALERT SUMMARY
                    ================= */}

                    <div className="alert-status-row">

                      <div>

                        <span className="card-label">
                          Status
                        </span>

                        <span
                          className={`status-badge ${getStatusClass(
                            alert.status
                          )}`}
                        >
                          {alert.status ||
                            "OPEN"}
                        </span>

                      </div>


                      <div>

                        <span className="card-label">
                          Priority
                        </span>

                        <strong>
                          {alert.priority ||
                            alert.riskLevel ||
                            "UNKNOWN"}
                        </strong>

                      </div>


                      <div>

                        <span className="card-label">
                          Detected
                        </span>

                        <strong>
                          {alert.createdAt
                            ? new Date(
                                alert.createdAt
                              ).toLocaleString()
                            : "Unknown"}
                        </strong>

                      </div>


                      <div>

                        <span className="card-label">
                          Risk Score
                        </span>

                        <strong>
                          {riskScore}/90
                        </strong>

                      </div>

                    </div>


                    {/* =================
                        TRANSACTION
                    ================= */}

                    <div className="alert-transaction">

                      <div className="section-heading">

                        <div>

                          

                          <h3>
                            Transaction Details
                          </h3>

                        </div>

                      </div>


                      <div className="alert-transaction-grid">

                        <div>

                          <span>
                            Amount
                          </span>

                          <strong>
                            ₹
                            {Number(
                              alert
                                .transactionId
                                ?.amount || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Merchant
                          </span>

                          <strong>
                            {alert
                              .transactionId
                              ?.merchant ||
                              "Unknown"}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Payment Method
                          </span>

                          <strong>
                            {alert
                              .transactionId
                              ?.paymentMethod ||
                              "Unknown"}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Location
                          </span>

                          <strong>
                            {alert
                              .transactionId
                              ?.location ||
                              "Unknown"}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Device
                          </span>

                          <strong>
                            {alert
                              .transactionId
                              ?.device ||
                              "Unknown"}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Source
                          </span>

                          <strong>
                            {alert
                              .transactionId
                              ?.source ||
                              "MANUAL"}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Transaction Time
                          </span>

                          <strong>
                            {alert
                              .transactionId
                              ?.transactionTime
                              ? new Date(
                                  alert
                                    .transactionId
                                    .transactionTime
                                ).toLocaleString()
                              : "Unknown"}
                          </strong>

                        </div>

                      </div>

                    </div>


                    {/* =================
                        WHY FLAGGED
                    ================= */}

                    <div className="alert-explanation">

                      <h3>
                        Why Was This Transaction
                        Flagged?
                      </h3>


                      {reasons.length === 0 ? (

                        <p>
                          No specific detection
                          reasons were recorded.
                        </p>

                      ) : (

                        <ul>

                          {reasons.map(
                            (
                              reason,
                              index
                            ) => (

                              <li
                                key={index}
                              >

                                <span className="reason-number">
                                  {index + 1}
                                </span>

                                <span>
                                  {reason}
                                </span>

                              </li>

                            )
                          )}

                        </ul>

                      )}

                    </div>


                    {/* =================
                        ACTIONS
                    ================= */}

                    {alert.status ===
                      "OPEN" && (

                      <div className="alert-actions">

                        <button
                          type="button"
                          className="review-button"
                          onClick={() =>
                            updateAlertStatus(
                              alert._id,
                              "REVIEWED"
                            )
                          }
                          disabled={
                            updatingAlert ===
                            alert._id
                          }
                        >
                          {updatingAlert ===
                          alert._id
                            ? "Updating..."
                            : "Mark as Reviewed"}
                        </button>


                        <button
                          type="button"
                          className="dismiss-button"
                          onClick={() =>
                            updateAlertStatus(
                              alert._id,
                              "DISMISSED"
                            )
                          }
                          disabled={
                            updatingAlert ===
                            alert._id
                          }
                        >
                          {updatingAlert ===
                          alert._id
                            ? "Updating..."
                            : "Dismiss Alert"}
                        </button>

                      </div>

                    )}

                  </article>

                );
              }
            )}

          </section>

        )}

      </main>

    </div>
  );
}

export default Alerts;