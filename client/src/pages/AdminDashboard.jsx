import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config";


function AdminDashboard() {

  const [stats, setStats] =
    useState(null);

  const [adminAlerts, setAdminAlerts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [alertsLoading, setAlertsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [alertsError, setAlertsError] =
    useState("");

  const [alertRiskFilter, setAlertRiskFilter] =
    useState("ALL");

  const [alertStatusFilter, setAlertStatusFilter] =
    useState("ALL");

  const [alertSearch, setAlertSearch] =
    useState("");

  const [selectedReasonFilter, setSelectedReasonFilter] =
    useState("ALL");

  const [dateFilter, setDateFilter] =
    useState("ALL");

  const [selectedAlert, setSelectedAlert] =
    useState(null);

  const [updatingAlert, setUpdatingAlert] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const [quickFilter, setQuickFilter] =
    useState("ALL");

  const [showReasonsOnly, setShowReasonsOnly] =
    useState(false);

  const [alertSort, setAlertSort] =
    useState("NEWEST");

  const [alertPage, setAlertPage] =
    useState(1);

  const [selectedAlertIds, setSelectedAlertIds] =
    useState([]);

  const alertsPerPage = 10;


  // ==========================================
  // GET ADMIN STATISTICS
  // ==========================================

  const getAdminStats = async () => {

    try {

      setLoading(true);

      setErrorMessage("");


      const response =
        await axios.get(
          `${API_URL}/api/admin/stats`,
          {
            withCredentials: true
          }
        );


      setStats(
        response.data
      );

      setLastUpdated(new Date());

    } catch (error) {

      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
        "Unable to load admin dashboard"
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // GET ADMIN ALERTS
  // ==========================================

  const getAdminAlerts = async () => {

    try {

      setAlertsLoading(true);

      setAlertsError("");


      const response =
        await axios.get(
          `${API_URL}/api/admin/alerts`,
          {
            params: {

              riskLevel:
                alertRiskFilter,

              status:
                alertStatusFilter,

              search:
                alertSearch

            },

            withCredentials: true

          }
        );


      setAdminAlerts(
        response.data.alerts
      );

      setLastUpdated(new Date());

    } catch (error) {

      console.log(error);

      setAlertsError(
        error.response?.data?.message ||
        "Unable to load admin alerts"
      );

    } finally {

      setAlertsLoading(false);

    }

  };


  // ==========================================
  // LOAD DASHBOARD STATS
  // ==========================================

  useEffect(() => {

    getAdminStats();

  }, []);


  // ==========================================
  // LOAD ALERTS WHEN FILTER CHANGES
  // ==========================================

  useEffect(() => {

    getAdminAlerts();

  }, [
    alertRiskFilter,
    alertStatusFilter
  ]);


  // ==========================================
  // QUICK ALERT FILTER
  // ==========================================

  const applyQuickFilter = (filter) => {

    setQuickFilter(filter);
    setSelectedReasonFilter("ALL");
    setDateFilter("ALL");
    setShowReasonsOnly(false);
    setSelectedAlertIds([]);
    setAlertPage(1);

    if (filter === "ALL") {

      setAlertRiskFilter("ALL");
      setAlertStatusFilter("ALL");

    }

    if (filter === "OPEN") {

      setAlertRiskFilter("ALL");
      setAlertStatusFilter("OPEN");

    }

    if (filter === "CRITICAL") {

      setAlertRiskFilter("CRITICAL");
      setAlertStatusFilter("ALL");

    }

    if (filter === "HIGH") {

      setAlertRiskFilter("HIGH");
      setAlertStatusFilter("ALL");

    }

  };


  // ==========================================
  // STAT CARD FILTER HELPER
  // ==========================================

  const filterFromDashboardCard = (risk, status) => {

    setAlertRiskFilter(risk);
    setAlertStatusFilter(status);
    setSelectedReasonFilter("ALL");
    setDateFilter("ALL");
    setShowReasonsOnly(false);
    setSelectedAlertIds([]);
    setAlertPage(1);

    if (risk === "CRITICAL") {
      setQuickFilter("CRITICAL");
    } else if (risk === "HIGH") {
      setQuickFilter("HIGH");
    } else if (status === "OPEN") {
      setQuickFilter("OPEN");
    } else {
      setQuickFilter("ALL");
    }

    setTimeout(() => {
      document
        .getElementById("admin-investigation-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);

  };

  const toggleReasonsOnly = () => {
    setShowReasonsOnly((currentValue) => !currentValue);
    setAlertPage(1);
  };

  const handleAlertSortChange = (event) => {
    setAlertSort(event.target.value);
    setAlertPage(1);
  };

  const goToPreviousAlertPage = () => {
    setAlertPage((currentPage) => Math.max(currentPage - 1, 1));
  };

  const goToNextAlertPage = (totalPages) => {
    setAlertPage((currentPage) =>
      Math.min(currentPage + 1, totalPages)
    );
  };

  const toggleAlertSelection = (alertId) => {
    const alert = adminAlerts.find((item) => item._id === alertId);

    if (!alert || alert.status !== "OPEN") {
      setActionMessage("Only OPEN alerts can be selected for bulk actions.");
      return;
    }

    setSelectedAlertIds((currentIds) =>
      currentIds.includes(alertId)
        ? currentIds.filter((id) => id !== alertId)
        : [...currentIds, alertId]
    );
  };

  const clearSelectedAlerts = () => {
    setSelectedAlertIds([]);
  };

  const handleReasonFilterChange = (event) => {
    setSelectedReasonFilter(event.target.value);
    setAlertPage(1);
    setSelectedAlertIds([]);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
    setAlertPage(1);
    setSelectedAlertIds([]);
  };

  
  const copyToClipboard = async (value, label) => {

    if (!value) {
      return;
    }

    try {

      await navigator.clipboard.writeText(
        String(value)
      );

      setActionMessage(
        `${label} copied to clipboard.`
      );

    } catch (error) {

      console.log(error);

      setActionMessage(
        `Unable to copy ${label.toLowerCase()}.`
      );

    }

  };

  const selectVisibleAlerts = () => {

    const visibleIds =
      paginatedAlerts
        .filter(
          (alert) =>
            alert.status === "OPEN"
        )
        .map(
          (alert) => alert._id
        );

    if (visibleIds.length === 0) {
      setActionMessage("There are no OPEN alerts on this page to select.");
      return;
    }

    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every(
        (id) =>
          selectedAlertIds.includes(id)
      );

    if (allVisibleSelected) {

      setSelectedAlertIds(
        (currentIds) =>
          currentIds.filter(
            (id) =>
              !visibleIds.includes(id)
          )
      );

      return;

    }

    setSelectedAlertIds(
      (currentIds) => [
        ...new Set([
          ...currentIds,
          ...visibleIds
        ])
      ]
    );

  };


  const exportAlertsToCSV = () => {

    if (sortedAlerts.length === 0) {

      setActionMessage(
        "There are no alerts to export."
      );

      return;

    }

    const headers = [
      "Alert ID",
      "Risk Score",
      "Risk Level",
      "Priority",
      "Status",
      "User",
      "Email",
      "Amount",
      "Currency",
      "Merchant",
      "Payment Method",
      "Source",
      "Location",
      "Device",
      "Transaction Time",
      "Alert Created",
      "Reasons"
    ];

    const escapeCSV = (value) => {

      const text =
        String(value ?? "");

      return `"${text.replace(
        /"/g,
        '""'
      )}"`;

    };

    const rows =
      sortedAlerts.map((alert) => {

        const transaction =
          alert.transactionId || {};

        return [
          alert._id,
          alert.riskScore,
          alert.riskLevel,
          alert.priority,
          alert.status,
          alert.userId?.name ||
            alert.user?.name ||
            "Unknown",
          alert.userId?.email ||
            alert.user?.email ||
            "Unknown",
          transaction.amount ??
            "",
          transaction.currency ||
            "INR",
          transaction.merchant ||
            "Unknown",
          transaction.paymentMethod ||
            "Unknown",
          transaction.source ||
            "Unknown",
          transaction.location ||
            "Unknown",
          transaction.device ||
            "Unknown",
          transaction.transactionTime
            ? new Date(
                transaction.transactionTime
              ).toISOString()
            : "",
          alert.createdAt
            ? new Date(
                alert.createdAt
              ).toISOString()
            : "",
          (alert.reasons || []).join(
            " | "
          )
        ].map(escapeCSV).join(",");

      });

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows
    ].join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `fraud-alerts-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setActionMessage(
      `${sortedAlerts.length} alert(s) exported successfully.`
    );

  };


  // ==========================================
  // REFRESH DASHBOARD
  // ==========================================

  const bulkUpdateAlertStatus = async (status) => {

    if (selectedAlertIds.length === 0) {
      return;
    }

    const openIds = adminAlerts
      .filter(
        (alert) =>
          selectedAlertIds.includes(alert._id) &&
          alert.status === "OPEN"
      )
      .map((alert) => alert._id);

    if (openIds.length === 0) {
      setActionMessage("Only OPEN alerts can be bulk updated.");
      return;
    }

    try {

      if (
        status === "DISMISSED" &&
        !window.confirm(
          `Dismiss ${openIds.length} selected OPEN alert(s)?`
        )
      ) {
        return;
      }

    setUpdatingAlert(true);

      await Promise.all(
        openIds.map((alertId) =>
          axios.put(
            `${API_URL}/api/admin/alerts/${alertId}`,
            { status },
            { withCredentials: true }
          )
        )
      );

      setActionMessage(
        `${openIds.length} alert(s) updated successfully.`
      );

      setSelectedAlertIds([]);

      await Promise.all([
        getAdminStats(),
        getAdminAlerts()
      ]);

    } catch (error) {

      setAlertsError(
        error.response?.data?.message ||
        "Unable to update selected alerts"
      );

    } finally {

      setUpdatingAlert(false);

    }

  };


  const refreshDashboard = async () => {

    if (loading || alertsLoading || updatingAlert) {
      return;
    }

    setActionMessage("");
    setErrorMessage("");
    setAlertsError("");

    await Promise.all([
      getAdminStats(),
      getAdminAlerts()
    ]);

    setActionMessage("Dashboard refreshed successfully.");

  };


  // ==========================================
  // SEARCH ALERTS
  // ==========================================

  const handleAlertSearch = () => {

    setActionMessage("");
    setAlertPage(1);
    setSelectedAlertIds([]);

    getAdminAlerts();

  };


  // ==========================================
  // CLEAR ALERT FILTERS
  // ==========================================

  const clearAlertFilters = () => {

    setAlertRiskFilter("ALL");

    setAlertStatusFilter("ALL");

    setAlertSearch("");

    setQuickFilter("ALL");

    setShowReasonsOnly(false);
    setSelectedReasonFilter("ALL");
    setDateFilter("ALL");
    setAlertSort("NEWEST");
    setAlertPage(1);
    setSelectedAlertIds([]);
    setActionMessage("All alert filters have been cleared.");

  };


  // ==========================================
  // UPDATE ADMIN ALERT STATUS
  // ==========================================

  const updateAdminAlertStatus =
    async (alertId, status) => {

      try {

        setUpdatingAlert(true);


        await axios.put(

          `${API_URL}/api/admin/alerts/${alertId}`,

          {
            status: status
          },

          {
            withCredentials: true
          }

        );


        setActionMessage(
          `Alert marked as ${status.toLowerCase()} successfully.`
        );

        setSelectedAlert(null);


        getAdminStats();

        getAdminAlerts();

      } catch (error) {

        console.log(error);

        setAlertsError(
          error.response?.data?.message ||
          "Unable to update alert"
        );

      } finally {

        setUpdatingAlert(false);

      }

    };


  // ==========================================
  // CLOSE INVESTIGATION WITH ESCAPE KEY
  // ==========================================

  useEffect(() => {

    if (
      selectedAlert &&
      !adminAlerts.some(
        (alert) => alert._id === selectedAlert._id
      )
    ) {
      setSelectedAlert(null);
    }

  }, [adminAlerts, selectedAlert]);

  useEffect(() => {

    const handleEscapeKey = (event) => {

      if (event.key === "Escape") {
        setSelectedAlert(null);
      }

    };

    document.addEventListener(
      "keydown",
      handleEscapeKey
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscapeKey
      );
    };

  }, []);


  // ==========================================
  // ANALYTICS CALCULATIONS
  // ==========================================

  const totalAlerts =
    stats?.totalFraudAlerts || 0;


  const criticalPercentage =
    totalAlerts > 0
      ? Math.round(
          (
            stats.criticalAlerts /
            totalAlerts
          ) * 100
        )
      : 0;


  const highPercentage =
    totalAlerts > 0
      ? Math.round(
          (
            stats.highAlerts /
            totalAlerts
          ) * 100
        )
      : 0;


  const mediumPercentage =
    totalAlerts > 0
      ? Math.round(
          (
            stats.mediumAlerts /
            totalAlerts
          ) * 100
        )
      : 0;


  const lowPercentage =
    totalAlerts > 0
      ? Math.round(
          (
            stats.lowAlerts /
            totalAlerts
          ) * 100
        )
      : 0;


  const openPercentage =
    totalAlerts > 0
      ? Math.round(
          (
            stats.openFraudAlerts /
            totalAlerts
          ) * 100
        )
      : 0;


  const reviewedPercentage =
    totalAlerts > 0
      ? Math.round(
          (
            stats.reviewedAlerts /
            totalAlerts
          ) * 100
        )
      : 0;


  const dismissedPercentage =
    totalAlerts > 0
      ? Math.round(
          (
            stats.dismissedAlerts /
            totalAlerts
          ) * 100
        )
      : 0;


  // ==========================================
  // PREPARE INVESTIGATION RESULTS
  // ==========================================

  const filteredAlerts = adminAlerts.filter((alert) => {

    if (showReasonsOnly && (!alert.reasons || alert.reasons.length === 0)) {
      return false;
    }

    if (
      selectedReasonFilter !== "ALL" &&
      (!alert.reasons || !alert.reasons.includes(selectedReasonFilter))
    ) {
      return false;
    }

    if (dateFilter !== "ALL") {
      const alertDate = new Date(alert.createdAt || alert.updatedAt || 0);
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      if (dateFilter === "TODAY" && alertDate < startOfToday) {
        return false;
      }

      if (dateFilter === "7_DAYS") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        if (alertDate < sevenDaysAgo) return false;
      }

      if (dateFilter === "30_DAYS") {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        if (alertDate < thirtyDaysAgo) return false;
      }
    }

    return true;

  });

  const sortedAlerts = [...filteredAlerts].sort((firstAlert, secondAlert) => {

    if (alertSort === "HIGHEST_RISK") {
      return (secondAlert.riskScore || 0) - (firstAlert.riskScore || 0);
    }

    if (alertSort === "OLDEST") {
      return new Date(firstAlert.createdAt || 0) - new Date(secondAlert.createdAt || 0);
    }

    return new Date(secondAlert.createdAt || 0) - new Date(firstAlert.createdAt || 0);

  });

  const availableReasons = Array.from(
    new Set(
      adminAlerts.flatMap((alert) =>
        Array.isArray(alert.reasons) ? alert.reasons : []
      )
    )
  ).sort();

  const activeAdvancedFilterCount =
    (selectedReasonFilter !== "ALL" ? 1 : 0) +
    (dateFilter !== "ALL" ? 1 : 0) +
    (showReasonsOnly ? 1 : 0);

  const totalAlertPages =
    Math.max(
      Math.ceil(sortedAlerts.length / alertsPerPage),
      1
    );

  const safeAlertPage =
    Math.min(alertPage, totalAlertPages);

  const paginatedAlerts =
    sortedAlerts.slice(
      (safeAlertPage - 1) * alertsPerPage,
      safeAlertPage * alertsPerPage
    );

  const visibleOpenAlertIds =
    paginatedAlerts
      .filter(
        (alert) =>
          alert.status === "OPEN"
      )
      .map(
        (alert) => alert._id
      );

  const selectedOpenAlertCount =
    selectedAlertIds.filter((id) =>
      adminAlerts.some(
        (alert) =>
          alert._id === id &&
          alert.status === "OPEN"
      )
    ).length;

  const allVisibleAlertsSelected =
    visibleOpenAlertIds.length > 0 &&
    visibleOpenAlertIds.every(
      (id) =>
        selectedAlertIds.includes(id)
    );


  return (
    <div>

     


      {/* =====================================
          ADMIN HEADER
      ====================================== */}

      <div className="admin-page-header">

        <div>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Monitor platform-wide transactions,
            users and fraud alerts.
          </p>

          {lastUpdated && (
            <p className="admin-last-updated">
              Last updated:{" "}
              {lastUpdated.toLocaleTimeString()}
            </p>
          )}

        </div>


        <button
          className="refresh-button"
          onClick={refreshDashboard}
          disabled={
            loading ||
            alertsLoading ||
            updatingAlert
          }
        >

          {loading || alertsLoading
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </div>


      {/* =====================================
          ADMIN STATISTICS
      ====================================== */}

      {loading ? (

        <p className="admin-loading">
          Loading admin statistics...
        </p>

      ) : errorMessage ? (

        <p className="error-message">
          {errorMessage}
        </p>

      ) : stats ? (

        <div className="dashboard-cards">


          <div
            className="dashboard-card admin-clickable-card clickable-alert"
            role="button"
            tabIndex={0}
            onClick={() =>
              filterFromDashboardCard("ALL", "ALL")
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                filterFromDashboardCard("ALL", "ALL");
              }
            }}
          >

            <h3>
              Total Users
            </h3>

            <p>
              {stats.totalUsers}
            </p>

          </div>


          <div
            className="dashboard-card admin-clickable-card clickable-alert"
            role="button"
            tabIndex={0}
            onClick={() =>
              filterFromDashboardCard("ALL", "ALL")
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                filterFromDashboardCard("ALL", "ALL");
              }
            }}
          >

            <h3>
              Total Transactions
            </h3>

            <p>
              {stats.totalTransactions}
            </p>

          </div>


          <div
            className="dashboard-card admin-clickable-card clickable-alert"
            role="button"
            tabIndex={0}
            onClick={() =>
              filterFromDashboardCard("ALL", "ALL")
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                filterFromDashboardCard("ALL", "ALL");
              }
            }}
          >

            <h3>
              Total Fraud Alerts
            </h3>

            <p>
              {stats.totalFraudAlerts}
            </p>

          </div>


          <div
            className="dashboard-card admin-clickable-card clickable-alert"
            role="button"
            tabIndex={0}
            onClick={() =>
              filterFromDashboardCard("ALL", "OPEN")
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                filterFromDashboardCard("ALL", "OPEN");
              }
            }}
          >

            <h3>
              Open Alerts
            </h3>

            <p>
              {stats.openFraudAlerts}
            </p>

          </div>


          <div
            className="dashboard-card admin-clickable-card clickable-alert"
            role="button"
            tabIndex={0}
            onClick={() =>
              filterFromDashboardCard("HIGH", "ALL")
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                filterFromDashboardCard("HIGH", "ALL");
              }
            }}
          >

            <h3>
              High Risk Alerts
            </h3>

            <p>
              {stats.highRiskAlerts}
            </p>

          </div>


        </div>

      ) : (

        <p className="admin-empty">
          No admin statistics available.
        </p>

      )}


      {/* =====================================
          RISK SUMMARY
      ====================================== */}

      {stats && (

        <div className="admin-risk-cards">


          <div
            className="admin-risk-card critical admin-clickable-card clickable-alert"
            role="button"
            tabIndex={0}
            onClick={() =>
              filterFromDashboardCard("CRITICAL", "ALL")
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                filterFromDashboardCard("CRITICAL", "ALL");
              }
            }}
          >

            <h3>
              Critical
            </h3>

            <p>
              {stats.criticalAlerts}
            </p>

          </div>


          <div
            className="admin-risk-card high admin-clickable-card clickable-alert"
            role="button"
            tabIndex={0}
            onClick={() =>
              filterFromDashboardCard("HIGH", "ALL")
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                filterFromDashboardCard("HIGH", "ALL");
              }
            }}
          >

            <h3>
              High
            </h3>

            <p>
              {stats.highAlerts}
            </p>

          </div>


          <div
            className="admin-risk-card medium admin-clickable-card clickable-alert"
            role="button"
            tabIndex={0}
            onClick={() =>
              filterFromDashboardCard("MEDIUM", "ALL")
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                filterFromDashboardCard("MEDIUM", "ALL");
              }
            }}
          >

            <h3>
              Medium
            </h3>

            <p>
              {stats.mediumAlerts}
            </p>

          </div>


          <div
            className="admin-risk-card low admin-clickable-card clickable-alert"
            role="button"
            tabIndex={0}
            onClick={() =>
              filterFromDashboardCard("LOW", "ALL")
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                filterFromDashboardCard("LOW", "ALL");
              }
            }}
          >

            <h3>
              Low
            </h3>

            <p>
              {stats.lowAlerts}
            </p>

          </div>


        </div>

      )}


      {/* =====================================
          ALERT STATUS OVERVIEW
      ====================================== */}

      {stats && (

        <div>

          <h2 className="dashboard-section-title">
            Alert Status Overview
          </h2>


          <div className="admin-status-cards">


            <div className="admin-status-card open">

              <h3>
                Open
              </h3>

              <p>
                {stats.openFraudAlerts}
              </p>

            </div>


            <div className="admin-status-card reviewed">

              <h3>
                Reviewed
              </h3>

              <p>
                {stats.reviewedAlerts}
              </p>

            </div>


            <div className="admin-status-card dismissed">

              <h3>
                Dismissed
              </h3>

              <p>
                {stats.dismissedAlerts}
              </p>

            </div>


          </div>

        </div>

      )}


      {/* =====================================
          SECURITY OVERVIEW
      ====================================== */}

      {stats && (

        <div className="admin-security-summary">

          <h3>
            Security Overview
          </h3>

          <p>

            High/Critical alerts represent{" "}

            <strong>

              {
                stats.totalFraudAlerts > 0
                  ? Math.round(
                      (
                        stats.highRiskAlerts /
                        stats.totalFraudAlerts
                      ) * 100
                    )
                  : 0
              }%

            </strong>

            {" "}of all detected fraud alerts.

          </p>

        </div>

      )}


      {/* =====================================
          FRAUD ANALYTICS
      ====================================== */}

      {stats && (

        <div>

          <h2 className="dashboard-section-title">
            Fraud Analytics
          </h2>


          <div className="admin-analytics-cards">


            <div className="admin-analytics-card">

              <h3>
                Average Risk Score
              </h3>

              <p>
                {stats.averageRiskScore}/90
              </p>

            </div>


            <div className="admin-analytics-card">

              <h3>
                Average Fraud Amount
              </h3>

              <p>

                ₹
                {Number(
                  stats.averageFraudAmount
                ).toLocaleString("en-IN")}

              </p>

            </div>


            <div className="admin-analytics-card">

              <h3>
                Most Common Fraud Reason
              </h3>

              <p className="analytics-reason">

                {stats.mostCommonReason}

              </p>

            </div>


          </div>

        </div>

      )}


      {/* =====================================
          RISK DISTRIBUTION
      ====================================== */}

      {stats && (

        <div className="analytics-section">

          <h2>
            Risk Distribution
          </h2>

          <p className="analytics-description">
            Distribution of detected fraud alerts
            by risk level.
          </p>


          {totalAlerts === 0 ? (

            <p className="analytics-empty">
              No fraud alert data available yet.
            </p>

          ) : (

            <div className="analytics-bars">


              {/* CRITICAL */}

              <div className="analytics-bar-item">

                <div className="analytics-bar-header">

                  <strong>
                    Critical
                  </strong>

                  <span>
                    {stats.criticalAlerts} alerts
                    {" "}
                    ({criticalPercentage}%)
                  </span>

                </div>


                <div className="analytics-progress-bar">

                  <div
                    className="analytics-progress-fill critical-fill"
                    style={{
                      width: `${criticalPercentage}%`
                    }}
                  ></div>

                </div>

              </div>


              {/* HIGH */}

              <div className="analytics-bar-item">

                <div className="analytics-bar-header">

                  <strong>
                    High
                  </strong>

                  <span>
                    {stats.highAlerts} alerts
                    {" "}
                    ({highPercentage}%)
                  </span>

                </div>


                <div className="analytics-progress-bar">

                  <div
                    className="analytics-progress-fill high-fill"
                    style={{
                      width: `${highPercentage}%`
                    }}
                  ></div>

                </div>

              </div>


              {/* MEDIUM */}

              <div className="analytics-bar-item">

                <div className="analytics-bar-header">

                  <strong>
                    Medium
                  </strong>

                  <span>
                    {stats.mediumAlerts} alerts
                    {" "}
                    ({mediumPercentage}%)
                  </span>

                </div>


                <div className="analytics-progress-bar">

                  <div
                    className="analytics-progress-fill medium-fill"
                    style={{
                      width: `${mediumPercentage}%`
                    }}
                  ></div>

                </div>

              </div>


              {/* LOW */}

              <div className="analytics-bar-item">

                <div className="analytics-bar-header">

                  <strong>
                    Low
                  </strong>

                  <span>
                    {stats.lowAlerts} alerts
                    {" "}
                    ({lowPercentage}%)
                  </span>

                </div>


                <div className="analytics-progress-bar">

                  <div
                    className="analytics-progress-fill low-fill"
                    style={{
                      width: `${lowPercentage}%`
                    }}
                  ></div>

                </div>

              </div>


            </div>

          )}

        </div>

      )}


      {/* =====================================
          ALERT WORKFLOW DISTRIBUTION
      ====================================== */}

      {stats && (

        <div className="analytics-section">

          <h2>
            Alert Workflow Distribution
          </h2>

          <p className="analytics-description">
            Current processing status of fraud alerts.
          </p>


          {totalAlerts === 0 ? (

            <p className="analytics-empty">
              No alert workflow data available yet.
            </p>

          ) : (

            <div className="analytics-bars">


              {/* OPEN */}

              <div className="analytics-bar-item">

                <div className="analytics-bar-header">

                  <strong>
                    Open
                  </strong>

                  <span>
                    {stats.openFraudAlerts} alerts
                    {" "}
                    ({openPercentage}%)
                  </span>

                </div>


                <div className="analytics-progress-bar">

                  <div
                    className="analytics-progress-fill open-fill"
                    style={{
                      width: `${openPercentage}%`
                    }}
                  ></div>

                </div>

              </div>


              {/* REVIEWED */}

              <div className="analytics-bar-item">

                <div className="analytics-bar-header">

                  <strong>
                    Reviewed
                  </strong>

                  <span>
                    {stats.reviewedAlerts} alerts
                    {" "}
                    ({reviewedPercentage}%)
                  </span>

                </div>


                <div className="analytics-progress-bar">

                  <div
                    className="analytics-progress-fill reviewed-fill"
                    style={{
                      width: `${reviewedPercentage}%`
                    }}
                  ></div>

                </div>

              </div>


              {/* DISMISSED */}

              <div className="analytics-bar-item">

                <div className="analytics-bar-header">

                  <strong>
                    Dismissed
                  </strong>

                  <span>
                    {stats.dismissedAlerts} alerts
                    {" "}
                    ({dismissedPercentage}%)
                  </span>

                </div>


                <div className="analytics-progress-bar">

                  <div
                    className="analytics-progress-fill dismissed-fill"
                    style={{
                      width: `${dismissedPercentage}%`
                    }}
                  ></div>

                </div>

              </div>


            </div>

          )}

        </div>

      )}


      {/* =====================================
          OPEN RISK SUMMARY
      ====================================== */}

      {stats && (

        <div className="admin-open-risk-summary">

          <h3>
            Alerts Requiring Attention
          </h3>


          <p>

            <strong>
              {stats.openHighRiskAlerts}
            </strong>{" "}

            high/critical alerts are
            currently open.

          </p>


          <p>

            <strong>
              {stats.openCriticalAlerts}
            </strong>{" "}

            critical alerts are currently open.

          </p>

        </div>

      )}


      {/* =====================================
          RESOLUTION RATE
      ====================================== */}

      {stats && (

        <div className="admin-resolution-card">

          <h3>
            Alert Resolution Rate
          </h3>


          <p className="resolution-number">

            {
              stats.totalFraudAlerts > 0
                ? Math.round(
                    (
                      (
                        stats.reviewedAlerts +
                        stats.dismissedAlerts
                      ) /
                      stats.totalFraudAlerts
                    ) * 100
                  )
                : 0
            }%

          </p>


          <p>
            Percentage of fraud alerts that
            have been processed by an admin.
          </p>

        </div>

      )}


      {/* =====================================
          CRITICAL ALERT WARNING
      ====================================== */}

      {stats &&
        stats.openCriticalAlerts > 0 && (

          <div className="admin-critical-warning">

            <strong>
              Critical alerts require attention
            </strong>

            <p>

              There are currently{" "}

              {stats.openCriticalAlerts}

              {" "}open critical fraud alerts
              in the system.

            </p>

          </div>

        )}


      {actionMessage && (

        <p className="success-message admin-action-message">
          {actionMessage}
        </p>

      )}


      {/* =====================================
          RECENT FRAUD ALERTS
      ====================================== */}

      <div className="section-header">

        <div>

          <h2>
            Recent Fraud Alerts
          </h2>

          <p>
            Latest suspicious activity detected
            across the platform.
          </p>

        </div>

      </div>


      {stats &&
      stats.recentAlerts &&
      stats.recentAlerts.length > 0 ? (

        stats.recentAlerts.map(
          (alert) => (

            <div
              key={alert._id}
              className={
                  selectedAlertIds.includes(alert._id)
                    ? "alert-card admin-alert-card clickable-alert selected-alert"
                    : "alert-card admin-alert-card clickable-alert"
                }
              role="button"
              tabIndex={0}
              aria-label="Open fraud alert investigation"
              onClick={() => {
                setSelectedAlert(alert);
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();
                  setSelectedAlert(alert);
                }
              }}
            >

              <div className="admin-alert-select">

                <input
                  type="checkbox"
                  checked={selectedAlertIds.includes(alert._id)}
                  onChange={() => toggleAlertSelection(alert._id)}
                  onClick={(event) => event.stopPropagation()}
                  aria-label={`Select alert ${alert._id}`}
                />

                <span>Select</span>

              </div>

              <h3
                className={`risk-badge risk-${alert.riskLevel.toLowerCase()}`}
              >
                {alert.riskLevel}
              </h3>


              <p className="risk-score">

                Risk Score:{" "}
                {alert.riskScore}/90

              </p>


              <div className="risk-bar">

                <div
                  className="risk-bar-fill"
                  style={{
                    width: `${Math.min(
                      (alert.riskScore / 90) * 100,
                      100
                    )}%`
                  }}
                ></div>

              </div>


              <p>

                <strong>
                  User:
                </strong>{" "}

                {alert.userId?.name ||
                  "Unknown"}

              </p>


              <p>

                <strong>
                  Email:
                </strong>{" "}

                {alert.userId?.email ||
                  "Unknown"}

              </p>


              <p>

                <strong>
                  Merchant:
                </strong>{" "}

                {alert.transactionId?.merchant ||
                  "Unknown"}

              </p>


              <p>

                <strong>
                  Amount:
                </strong>{" "}

                {alert.transactionId?.currency || "INR"}{" "}
                {Number(
                  alert.transactionId?.amount || 0
                ).toLocaleString("en-IN")}

              </p>


              <p>

                <strong>
                  Location:
                </strong>{" "}

                {alert.transactionId?.location ||
                  "Unknown"}

              </p>


              <p>

                <strong>
                  Device:
                </strong>{" "}

                {alert.transactionId?.device ||
                  "Unknown"}

              </p>

              <p>

                <strong>
                  Source:
                </strong>{" "}

                {alert.transactionId?.source ||
                  "Unknown"}

              </p>

              <p className="admin-alert-date">

                Alert created:{" "}

                {alert.createdAt
                  ? new Date(
                      alert.createdAt
                    ).toLocaleString()
                  : "Unknown"}

              </p>


              <p
                className={`alert-status status-${(
  alert.status || "UNKNOWN"
).toLowerCase()}`}
              >

                Status:{" "}
                {alert.status}

              </p>


              <h4>
                Why was this transaction flagged?
              </h4>


              <ul>

                {(alert.reasons || []).map(
                  (reason, index) => (

                    <li key={index}>
                      {reason}
                    </li>

                  )
                )}

              </ul>

            </div>

          )
        )

      ) : (

        <p className="admin-empty">
          No recent fraud alerts found.
        </p>

      )}


      {stats &&
        stats.recentAlerts &&
        stats.recentAlerts.length > 0 && (

          <p className="admin-alert-link">

            Showing the latest 5 alerts.

          </p>

        )}


      {/* =====================================
          FRAUD ALERT INVESTIGATION
      ====================================== */}

      <div
        id="admin-investigation-section"
        className="section-header"
      >

        <div>

          <h2>
            Fraud Alert Investigation
          </h2>

          <p>
            Search and filter alerts across
            all users on the platform.
          </p>

        </div>

      </div>


      {/* =====================================
          QUICK ALERT FILTERS
      ====================================== */}

      <div className="admin-quick-filters">

        <button
          type="button"
          className={
            quickFilter === "ALL"
              ? "quick-filter-button active"
              : "quick-filter-button"
          }
          onClick={() =>
            applyQuickFilter("ALL")
          }
        >
          All Alerts
        </button>

        <button
          type="button"
          className={
            quickFilter === "OPEN"
              ? "quick-filter-button active"
              : "quick-filter-button"
          }
          onClick={() =>
            applyQuickFilter("OPEN")
          }
        >
          Open
        </button>

        <button
          type="button"
          className={
            quickFilter === "CRITICAL"
              ? "quick-filter-button active"
              : "quick-filter-button"
          }
          onClick={() =>
            applyQuickFilter("CRITICAL")
          }
        >
          Critical
        </button>

        <button
          type="button"
          className={
            quickFilter === "HIGH"
              ? "quick-filter-button active"
              : "quick-filter-button"
          }
          onClick={() =>
            applyQuickFilter("HIGH")
          }
        >
          High
        </button>

        <button
          type="button"
          className={
            showReasonsOnly
              ? "quick-filter-button active"
              : "quick-filter-button"
          }
          onClick={toggleReasonsOnly}
        >
          With Reasons
        </button>

      </div>


      {/* =====================================
          ALERT FILTERS
      ====================================== */}

      {activeAdvancedFilterCount > 0 && (
        <p className="admin-alert-meta">
          {activeAdvancedFilterCount} advanced filter
          {activeAdvancedFilterCount === 1 ? "" : "s"} active
        </p>
      )}

      <div className="admin-alert-filter">


        <input
          type="text"
          placeholder="Search user, email, merchant, location..."
          value={alertSearch}
          onChange={(event) => {

            setAlertSearch(
              event.target.value
            );

          }}
          onKeyDown={(event) => {

            if (event.key === "Enter") {

              handleAlertSearch();

            }

          }}
        />


        <select
          value={alertRiskFilter}
          onChange={(event) => {

            setAlertRiskFilter(
              event.target.value
            );

          }}
        >

          <option value="ALL">
            All Risk
          </option>

          <option value="CRITICAL">
            Critical
          </option>

          <option value="HIGH">
            High
          </option>

          <option value="MEDIUM">
            Medium
          </option>

          <option value="LOW">
            Low
          </option>

        </select>


        <select
          value={alertStatusFilter}
          onChange={(event) => {

            setAlertStatusFilter(
              event.target.value
            );

          }}
        >

          <option value="ALL">
            All Status
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


        <select
          value={selectedReasonFilter}
          onChange={handleReasonFilterChange}
          aria-label="Filter by detection reason"
        >
          <option value="ALL">
            All Detection Reasons
          </option>

          {availableReasons.map((reason) => (
            <option
              key={reason}
              value={reason}
            >
              {reason}
            </option>
          ))}
        </select>

        <select
          value={dateFilter}
          onChange={handleDateFilterChange}
          aria-label="Filter alerts by date"
        >
          <option value="ALL">
            All Dates
          </option>

          <option value="TODAY">
            Today
          </option>

          <option value="7_DAYS">
            Last 7 Days
          </option>

          <option value="30_DAYS">
            Last 30 Days
          </option>
        </select>

        <select
          value={alertSort}
          onChange={handleAlertSortChange}
          aria-label="Sort fraud alerts"
        >

          <option value="NEWEST">Newest First</option>

          <option value="HIGHEST_RISK">Highest Risk</option>

          <option value="OLDEST">Oldest First</option>

        </select>


        <button
          type="button"
          className="refresh-button"
          onClick={handleAlertSearch}
        >
          Search
        </button>

        <button
          type="button"
          className="refresh-button"
          onClick={exportAlertsToCSV}
          disabled={sortedAlerts.length === 0 || alertsLoading}
        >
          Export CSV
        </button>

        {alertSearch && (
          <button
            type="button"
            className="admin-clear-button"
            onClick={() => {
              setAlertSearch("");
              setAlertPage(1);
              setSelectedAlertIds([]);
              getAdminAlerts();
            }}
          >
            Clear Search
          </button>
        )}


        <button
          type="button"
          className="admin-clear-button"
          onClick={clearAlertFilters}
        >
          Clear
        </button>

      

        {(selectedReasonFilter !== "ALL" ||
          dateFilter !== "ALL" ||
          showReasonsOnly) && (
          <button
            type="button"
            className="admin-clear-button"
            onClick={() => {
              setSelectedReasonFilter("ALL");
              setDateFilter("ALL");
              setShowReasonsOnly(false);
              setAlertPage(1);
              setSelectedAlertIds([]);
              setActionMessage("Advanced filters cleared.");
            }}
          >
            Clear Advanced Filters
          </button>
        )}
</div>


      {/* =====================================
          INVESTIGATION RESULTS
      ====================================== */}

      <div className="admin-selection-toolbar">

        <div>
          <strong>{selectedAlertIds.length}</strong> selected
        </div>

        <div className="admin-selection-actions">

          <button
            type="button"
            className="admin-clear-button"
            onClick={selectVisibleAlerts}
            disabled={paginatedAlerts.length === 0}
          >
            {allVisibleAlertsSelected
              ? "Unselect Visible"
              : "Select Visible"}
          </button>

          <button
            type="button"
            className="admin-clear-button"
            onClick={clearSelectedAlerts}
            disabled={selectedOpenAlertCount === 0}
          >
            Clear Selection
          </button>

          <button
            type="button"
            className="review-button"
            onClick={() => bulkUpdateAlertStatus("REVIEWED")}
            disabled={selectedOpenAlertCount === 0 || updatingAlert}
          >
            Mark Selected Reviewed
          </button>

          <button
            type="button"
            className="dismiss-button"
            onClick={() => bulkUpdateAlertStatus("DISMISSED")}
            disabled={selectedAlertIds.length === 0 || updatingAlert}
          >
            Dismiss Selected
          </button>

        </div>

      </div>


      {alertsLoading ? (

        <p className="admin-loading">
          Loading fraud alerts...
        </p>

      ) : alertsError ? (

        <p className="error-message">
          {alertsError}
        </p>

      ) : sortedAlerts.length === 0 ? (

        <div className="empty-state">

          <h3>
            No fraud alerts found
          </h3>

          <p>
            No alerts match the selected
            filters.
          </p>

        </div>

      ) : (

        <div>

          <p className="transaction-summary">

            Showing{" "}

            <strong>
              {sortedAlerts.length}
            </strong>{" "}

            matching alerts

            {selectedAlertIds.length > 0 && (
              <>
                {" "}• {selectedAlertIds.length} selected
              </>
            )}

          </p>

          <p className="admin-result-note">
            Page {safeAlertPage} of {totalAlertPages}
            {" • "}
            {sortedAlerts.length} alert(s)
          </p>


          <p className="admin-result-note">
            Showing the latest 50 matching alerts at most.
          </p>

          {(alertRiskFilter !== "ALL" ||
            alertStatusFilter !== "ALL") && (
            <p className="admin-result-note">
              Active filters:{" "}
              {alertRiskFilter !== "ALL" &&
                `Risk = ${alertRiskFilter}`}
              {alertRiskFilter !== "ALL" &&
                alertStatusFilter !== "ALL" &&
                " | "}
              {alertStatusFilter !== "ALL" &&
                `Status = ${alertStatusFilter}`}
            </p>
          )}


          {paginatedAlerts.map(
            (alert) => (

              <div
                key={alert._id}
                className="alert-card admin-alert-card clickable-alert"
                role="button"
                tabIndex={0}
                aria-label="Open fraud alert investigation"
                onClick={() => {

                  setSelectedAlert(alert);

                }}
                onKeyDown={(event) => {

                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {

                    event.preventDefault();

                    setSelectedAlert(alert);

                  }

                }}
              >

                <h3
                  className={`risk-badge risk-${alert.riskLevel.toLowerCase()}`}
                >
                  {alert.riskLevel}
                </h3>


                <p className="risk-score">

                  Risk Score:{" "}
                  {alert.riskScore}/90

                </p>


                <div className="risk-bar">

                  <div
                    className="risk-bar-fill"
                    style={{
                      width: `${Math.min(
                        (alert.riskScore / 90) * 100,
                        100
                      )}%`
                    }}
                  ></div>

                </div>


                <p>

                  <strong>
                    Alert ID:
                  </strong>{" "}

                  {alert._id
                    ? alert._id.slice(-8)
                    : "Unknown"}

                </p>


                <p>

                  <strong>
                    User:
                  </strong>{" "}

                  {alert.userId?.name ||
                    "Unknown"}

                </p>


                <p>

                  <strong>
                    Email:
                  </strong>{" "}

                  {alert.userId?.email ||
                    "Unknown"}

                </p>


                <p>

                  <strong>
                    Transaction Amount:
                  </strong>{" "}

                  ₹
                  {Number(
                    alert.transactionId?.amount ||
                    0
                  ).toLocaleString("en-IN")}

                </p>


                <p>

                  <strong>
                    Merchant:
                  </strong>{" "}

                  {alert.transactionId?.merchant ||
                    "Unknown"}

                </p>


                <p>

                  <strong>
                    Payment Method:
                  </strong>{" "}

                  {alert.transactionId?.paymentMethod ||
                    "Unknown"}

                </p>


                <p>

                  <strong>
                    Source:
                  </strong>{" "}

                  {alert.transactionId?.source ||
                    "Unknown"}

                </p>

                <p>

                  <strong>
                    Currency:
                  </strong>{" "}

                  {alert.transactionId?.currency ||
                    "INR"}

                </p>


                <p>

                  <strong>
                    Location:
                  </strong>{" "}

                  {alert.transactionId?.location ||
                    "Unknown"}

                </p>


                <p>

                  <strong>
                    Device:
                  </strong>{" "}

                  {alert.transactionId?.device ||
                    "Unknown"}

                </p>


                <p>

                  <strong>
                    Transaction Date:
                  </strong>{" "}

                  {alert.transactionId?.transactionTime
                    ? new Date(
                        alert.transactionId.transactionTime
                      ).toLocaleString()
                    : "Unknown"}

                </p>

                <p>

                  <strong>
                    Transaction Status:
                  </strong>{" "}

                  {alert.transactionId?.status ||
                    "Unknown"}

                </p>


                <p
                  className={`alert-status status-${alert.status.toLowerCase()}`}
                >

                  Status:{" "}
                  {alert.status}

                </p>


                <p>

                  <strong>
                    Priority:
                  </strong>{" "}

                  {alert.priority}

                </p>


                <h4>
                  Why was this transaction flagged?
                </h4>


                <ul>

                  {(alert.reasons || []).map(
                    (reason, index) => (

                      <li key={index}>
                        {reason}
                      </li>

                    )
                  )}

                </ul>


                <p className="admin-alert-date">

                  Alert created:{" "}

                  {new Date(
                    alert.createdAt
                  ).toLocaleString()}

                </p>


                <p className="click-alert-message">

                  Click this alert to investigate

                </p>

                <button
                  type="button"
                  className="refresh-button"
                  onClick={(event) => {

                    event.stopPropagation();

                    setSelectedAlert(alert);

                  }}
                >
                  View Investigation
                </button>

              </div>

            )
          )}


          <div className="admin-pagination">

            <button
              type="button"
              className="admin-clear-button"
              onClick={goToPreviousAlertPage}
              disabled={safeAlertPage === 1}
            >
              Previous
            </button>

            <span>
              Page {safeAlertPage} of {totalAlertPages}
            </span>

            <button
              type="button"
              className="admin-clear-button"
              onClick={() => goToNextAlertPage(totalAlertPages)}
              disabled={safeAlertPage === totalAlertPages}
            >
              Next
            </button>

          </div>

        </div>

      )}


      {/* =====================================
          INVESTIGATION PANEL
      ====================================== */}

      {selectedAlert && (

        <div
          className="investigation-overlay"
          onClick={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              setSelectedAlert(null);

            }

          }}
        >

          <div
            className="investigation-panel"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >


            {/* PANEL HEADER */}

            <button
              type="button"
              className="close-button"
              onClick={() =>
                setSelectedAlert(null)
              }
              aria-label="Close investigation"
              title="Close investigation"
            >
              ×
            </button>


            <div className="investigation-header">

              <div>

                <h2>
                  Alert Investigation
                </h2>

                <p>
                  Detailed fraud alert analysis
                </p>

                <p className="admin-alert-id">
                  Alert ID:{" "}
                  {selectedAlert._id || "Unknown"}
                </p>

                <button
                  type="button"
                  className="admin-clear-button"
                  onClick={() =>
                    copyToClipboard(
                      selectedAlert._id,
                      "Alert ID"
                    )
                  }
                >
                  Copy Alert ID
                </button>

                <button
                  type="button"
                  className="admin-clear-button"
                  onClick={() =>
                    copyToClipboard(
                      selectedAlert.transactionId?._id,
                      "Transaction ID"
                    )
                  }
                >
                  Copy Transaction ID
                </button>

              </div>


              <button
                className="close-button"
                onClick={() => {

                  setSelectedAlert(null);

                }}
              >
                X
              </button>

            </div>


            {/* RISK INFORMATION */}

            <div className="investigation-risk">

              <h3
                className={`risk-badge risk-${selectedAlert.riskLevel.toLowerCase()}`}
              >
                {selectedAlert.riskLevel}
              </h3>


              <p className="risk-score">

                Risk Score:{" "}
                {selectedAlert.riskScore}/90

              </p>


              <p>

                <strong>
                  Risk Percentage:
                </strong>{" "}

                {Math.round(
                  (
                    selectedAlert.riskScore /
                    90
                  ) * 100
                )}%

              </p>

              <p className="risk-interpretation">

                {selectedAlert.riskLevel === "CRITICAL"
                  ? "Immediate investigation recommended."
                  : selectedAlert.riskLevel === "HIGH"
                    ? "Priority investigation recommended."
                    : selectedAlert.riskLevel === "MEDIUM"
                      ? "Additional review may be required."
                      : "Low-risk activity detected."}

              </p>


              <div className="risk-bar">

                <div
                  className="risk-bar-fill"
                  style={{
                    width: `${Math.min(
                      (selectedAlert.riskScore / 90) * 100,
                      100
                    )}%`
                  }}
                ></div>

              </div>

            </div>


            {/* USER INFORMATION */}

            <div className="investigation-section">

              <h3>
                User Information
              </h3>


              <p>

                <strong>
                  Name:
                </strong>{" "}

                {selectedAlert.userId?.name ||
                  "Unknown"}

              </p>


              <p>

                <strong>
                  Email:
                </strong>{" "}

                {selectedAlert.userId?.email ||
                  "Unknown"}

              </p>

            </div>


            {/* TRANSACTION INFORMATION */}

            <div className="investigation-section">

              <h3>
                Transaction Information
              </h3>


              <p>

                <strong>
                  Transaction ID:
                </strong>{" "}

                {selectedAlert.transactionId?._id ||
                  "Unknown"}

              </p>


              <p>

                <strong>
                  Amount:
                </strong>{" "}

                {selectedAlert.transactionId?.currency || "INR"}{" "}
                {Number(
                  selectedAlert.transactionId?.amount ||
                  0
                ).toLocaleString("en-IN")}

              </p>


              <p>

                <strong>
                  Merchant:
                </strong>{" "}

                {selectedAlert.transactionId?.merchant ||
                  "Unknown"}

              </p>


              <p>

                <strong>
                  Payment Method:
                </strong>{" "}

                {selectedAlert.transactionId?.paymentMethod ||
                  "Unknown"}

              </p>


              <p>

                <strong>
                  Source:
                </strong>{" "}

                {selectedAlert.transactionId?.source ||
                  "Unknown"}

              </p>


              <p>

                <strong>
                  Location:
                </strong>{" "}

                {selectedAlert.transactionId?.location ||
                  "Unknown"}

              </p>


              <p>

                <strong>
                  Device:
                </strong>{" "}

                {selectedAlert.transactionId?.device ||
                  "Unknown"}

              </p>


              <p>

                <strong>
                  Transaction Time:
                </strong>{" "}

                {selectedAlert.transactionId?.transactionTime
                  ? new Date(
                      selectedAlert.transactionId.transactionTime
                    ).toLocaleString()
                  : "Unknown"}

              </p>

              <p>

                <strong>
                  Transaction Status:
                </strong>{" "}

                {selectedAlert.transactionId?.status ||
                  "Unknown"}

              </p>

            </div>


            {/* FRAUD REASONS */}

            <div className="investigation-section">

              <h3>
                Fraud Detection Reasons
              </h3>


              <p className="admin-alert-meta">

                {selectedAlert.reasons?.length || 0} detection reason
                {(selectedAlert.reasons?.length || 0) === 1 ? "" : "s"} identified.

              </p>


              <p className="reason-summary">

                These rules contributed to the transaction's risk score.

              </p>

              <ul>

                {(selectedAlert.reasons || []).map(
                  (reason, index) => (

                    <li key={index}>
                      {reason}
                    </li>

                  )
                )}

              </ul>

            </div>


            {/* ALERT STATUS */}

            <div className="investigation-section">

              <h3>
                Alert Status
              </h3>


              <p
                className={`alert-status status-${(
  selectedAlert.status || "UNKNOWN"
).toLowerCase()}`}
              >
                {selectedAlert.status}
              </p>


              <p>

                <strong>
                  Priority:
                </strong>{" "}

                {selectedAlert.priority}

              </p>

            </div>


            {/* ACTION BUTTONS */}

            {selectedAlert.status === "OPEN" && (

              <div className="investigation-actions">

                <p className="action-hint">
                  {selectedAlert.status === "OPEN"
                    ? "Review the evidence before choosing an action."
                    : "This alert has already been processed."}
                </p>

                <p className="action-hint">

                  {selectedAlert.status === "OPEN"
                    ? "Review the transaction evidence before choosing an action."
                    : "This alert has already been processed."}

                </p>


                <button
                  className="review-button"
                  disabled={updatingAlert}
                  onClick={() =>
                    updateAdminAlertStatus(
                      selectedAlert._id,
                      "REVIEWED"
                    )
                  }
                >

                  {updatingAlert
                    ? "Updating..."
                    : "Mark Reviewed"}

                </button>


                <button
                  className="dismiss-button"
                  disabled={updatingAlert}
                  onClick={() =>
                    updateAdminAlertStatus(
                      selectedAlert._id,
                      "DISMISSED"
                    )
                  }
                >

                  {updatingAlert
                    ? "Updating..."
                    : "Dismiss"}

                </button>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

/*
  Batch 23 CSS classes used by this component:
  .admin-selection-toolbar
  .admin-selection-actions
  .admin-alert-select
  .selected-alert
  .action-hint
  .success-message
*/


export default AdminDashboard;