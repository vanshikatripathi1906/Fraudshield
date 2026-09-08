import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import API_URL from "../config";

function TransactionDetails() {
  const { id } = useParams();

  const [transaction, setTransaction] = useState(null);
  const [fraudAlert, setFraudAlert] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await axios.get(
          `${API_URL}/api/transactions/${id}`,
          {
            withCredentials: true
          }
        );

        setTransaction(
          response.data?.transaction || null
        );

        setFraudAlert(
          response.data?.fraudAlert || null
        );
      } catch (error) {
        console.log(error);

        setErrorMessage(
          error.response?.data?.message ||
            "Unable to load transaction details."
        );
      } finally {
        setLoading(false);
      }
    };

    getTransactionDetails();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Navbar />

        <div className="details-state">
          <p>Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div>
        <Navbar />

        <div className="details-state">
          <p className="error-message">
            {errorMessage}
          </p>

          <Link
            to="/transactions"
            className="back-button"
          >
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div>
        <Navbar />

        <div className="details-state">
          <h3>Transaction not found</h3>

          <p>
            The requested transaction could not
            be found.
          </p>

          <Link
            to="/transactions"
            className="back-button"
          >
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  const riskScore =
    Number(fraudAlert?.riskScore || 0);

  const riskLevel =
    fraudAlert?.riskLevel || "LOW";

  const reasons =
    Array.isArray(fraudAlert?.reasons)
      ? fraudAlert.reasons
      : [];

  const riskPercentage = Math.min(
    (riskScore / 90) * 100,
    100
  );

  return (
    <div>
      <Navbar />

      <div className="dashboard-header">
        <div>
          <h1>Transaction Details</h1>

          <p>
            Review transaction information
            and fraud analysis.
          </p>
        </div>
      </div>

      <div className="transaction-details-card">

        {/* Transaction Information */}

        <div className="details-section">
          <h2>Transaction Information</h2>

          <div className="details-grid">

            <div className="detail-item">
              <span>Amount</span>

              <strong className="transaction-detail-amount">
                ₹
                {Number(
                  transaction.amount || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="detail-item">
              <span>Merchant</span>

              <strong>
                {transaction.merchant ||
                  "Unknown"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Payment Method</span>

              <strong>
                {transaction.paymentMethod ||
                  "Unknown"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Location</span>

              <strong>
                {transaction.location ||
                  "Unknown"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Device</span>

              <strong>
                {transaction.device ||
                  "Unknown"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Source</span>

              <strong>
                {transaction.source ||
                  "MANUAL"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Currency</span>

              <strong>
                {transaction.currency ||
                  "INR"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Transaction Date</span>

              <strong>
                {transaction.transactionTime
                  ? new Date(
                      transaction.transactionTime
                    ).toLocaleString()
                  : "Unknown"}
              </strong>
            </div>

          </div>

          <div className="transaction-id">
            <span>Transaction ID</span>

            <strong>
              {transaction._id}
            </strong>
          </div>
        </div>


        {/* Fraud Analysis */}

        <div className="details-section details-fraud-section">
          <h2>Fraud Analysis</h2>

          {fraudAlert ? (
            <>
              <div className="details-risk-header">

                <div>
                  <span className="details-label">
                    Risk Level
                  </span>

                  <h3
                    className={`risk-badge risk-${riskLevel.toLowerCase()}`}
                  >
                    {riskLevel}
                  </h3>
                </div>

                <div className="details-risk-score">
                  <span className="details-label">
                    Risk Score
                  </span>

                  <strong>
                    {riskScore}/90
                  </strong>
                </div>

              </div>

              <div className="risk-bar">
                <div
                  className="risk-bar-fill"
                  style={{
                    width: `${riskPercentage}%`
                  }}
                ></div>
              </div>

              <div className="details-analysis-info">

                <div>
                  <span>Priority</span>

                  <strong>
                    {fraudAlert.priority ||
                      riskLevel}
                  </strong>
                </div>

                <div>
                  <span>Status</span>

                  <strong>
                    {fraudAlert.status ||
                      "OPEN"}
                  </strong>
                </div>

              </div>

              <div className="details-reasons">
                <h3>
                  Why was this transaction
                  flagged?
                </h3>

                {reasons.length === 0 ? (
                  <p>
                    No specific reasons were
                    recorded.
                  </p>
                ) : (
                  <ul>
                    {reasons.map(
                      (reason, index) => (
                        <li key={index}>
                          {reason}
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div className="details-safe-section">
              <p className="analysis-safe">
                No fraud alert was generated
                for this transaction.
              </p>

              <p>
                This transaction has not been
                flagged by the current
                FraudShield detection rules.
              </p>
            </div>
          )}
        </div>


        {/* Navigation */}

        <Link
          to="/transactions"
          className="back-button"
        >
          Back to Transactions
        </Link>

      </div>
    </div>
  );
}

export default TransactionDetails;