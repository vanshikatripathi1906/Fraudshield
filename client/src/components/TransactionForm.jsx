import { useState } from "react";
import axios from "axios";
import API_URL from "../config";

function TransactionForm({ onTransactionAdded }) {
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("");
  const [device, setDevice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [merchant, setMerchant] = useState("");
  const [transactionTime, setTransactionTime] = useState("");

  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationMessage, setValidationMessage] =
    useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setResult(null);
    setErrorMessage("");
    setValidationMessage("");

    /*
      ============================
      AMOUNT VALIDATION
      ============================
    */

    if (amount === "") {
      setValidationMessage(
        "Amount is required"
      );

      return;
    }

    if (!Number.isFinite(Number(amount))) {
      setValidationMessage(
        "Amount must be a valid number"
      );

      return;
    }

    if (Number(amount) <= 0) {
      setValidationMessage(
        "Amount must be greater than 0"
      );

      return;
    }

    if (Number(amount) > 10000000) {
      setValidationMessage(
        "Amount cannot exceed ₹1,00,00,000"
      );

      return;
    }

    /*
      ============================
      MERCHANT VALIDATION
      ============================
    */

    if (!merchant.trim()) {
      setValidationMessage(
        "Merchant name is required"
      );

      return;
    }

    /*
      ============================
      LOCATION VALIDATION
      ============================
    */

    if (!location.trim()) {
      setValidationMessage(
        "Location is required"
      );

      return;
    }

    /*
      ============================
      DEVICE VALIDATION
      ============================
    */

    if (!device.trim()) {
      setValidationMessage(
        "Device is required"
      );

      return;
    }

    /*
      ============================
      DATE VALIDATION
      ============================
    */

    if (transactionTime) {
      const selectedTime =
        new Date(transactionTime);

      const currentTime =
        new Date();

      if (
        Number.isNaN(
          selectedTime.getTime()
        )
      ) {
        setValidationMessage(
          "Please enter a valid transaction date and time"
        );

        return;
      }

      if (selectedTime > currentTime) {
        setValidationMessage(
          "Transaction time cannot be in the future"
        );

        return;
      }
    }

    /*
      ============================
      SEND TRANSACTION
      ============================
    */

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/transactions`,
        {
          amount: Number(amount),

          currency: "INR",

          source: "MANUAL",

          location: location.trim(),

          device: device.trim(),

          paymentMethod,

          merchant: merchant.trim(),

          transactionTime:
            transactionTime || undefined
        },
        {
          withCredentials: true
        }
      );

      /*
        Store fraud analysis returned
        by the backend.
      */

      setResult(
        response.data.fraudAnalysis
      );

      /*
        Clear form after successful
        transaction creation.
      */

      setAmount("");
      setLocation("");
      setDevice("");
      setPaymentMethod("UPI");
      setMerchant("");
      setTransactionTime("");

      /*
        Tell Dashboard that a new
        transaction was added.
      */

      if (onTransactionAdded) {
        onTransactionAdded();
      }

    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
        "Transaction failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <h2>
        Add Transaction
      </h2>

      <form onSubmit={handleSubmit}>

        {/* ==========================
            AMOUNT
        ========================== */}

        <div className="form-group">

          <label>
            Amount (₹)
          </label>

          <input
            type="number"
            placeholder="Enter transaction amount"
            value={amount}
            onChange={(event) => {
              setAmount(
                event.target.value
              );
            }}
            min="1"
            max="10000000"
            step="0.01"
            required
          />

        </div>


        {/* ==========================
            PAYMENT METHOD
        ========================== */}

        <div className="form-group">

          <label>
            Payment Method
          </label>

          <select
            value={paymentMethod}
            onChange={(event) => {
              setPaymentMethod(
                event.target.value
              );
            }}
          >

            <option value="UPI">
              UPI
            </option>

            <option value="CARD">
              Card
            </option>

            <option value="BANK_TRANSFER">
              Bank Transfer
            </option>

            <option value="CASH">
              Cash
            </option>

            <option value="OTHER">
              Other
            </option>

          </select>

        </div>


        {/* ==========================
            MERCHANT
        ========================== */}

        <div className="form-group">

          <label>
            Merchant
          </label>

          <input
            type="text"
            placeholder="Enter merchant name"
            value={merchant}
            onChange={(event) => {
              setMerchant(
                event.target.value
              );
            }}
            required
          />

        </div>


        {/* ==========================
            LOCATION
        ========================== */}

        <div className="form-group">

          <label>
            Location
          </label>

          <input
            type="text"
            placeholder="Example: Delhi"
            value={location}
            onChange={(event) => {
              setLocation(
                event.target.value
              );
            }}
            required
          />

        </div>


        {/* ==========================
            DEVICE
        ========================== */}

        <div className="form-group">

          <label>
            Device
          </label>

          <input
            type="text"
            placeholder="Example: Chrome-Windows"
            value={device}
            onChange={(event) => {
              setDevice(
                event.target.value
              );
            }}
            required
          />

        </div>


        {/* ==========================
            TRANSACTION TIME
        ========================== */}

        <div className="form-group">

          <label>
            Transaction Date & Time
          </label>

          <input
            type="datetime-local"
            value={transactionTime}
            max={
              new Date()
                .toISOString()
                .slice(0, 16)
            }
            onChange={(event) => {
              setTransactionTime(
                event.target.value
              );
            }}
          />

          <small>
            Leave empty to use the current
            date and time.
          </small>

        </div>


        {/* ==========================
            VALIDATION MESSAGE
        ========================== */}

        {validationMessage && (
          <p className="error-message">
            {validationMessage}
          </p>
        )}


        {/* ==========================
            SUBMIT BUTTON
        ========================== */}

        <button
          type="submit"
          disabled={loading}
        >

          {loading
            ? "Analyzing..."
            : "Add Transaction"}

        </button>

      </form>


      {/* ==========================
          BACKEND ERROR
      ========================== */}

      {errorMessage && (
        <p className="error-message">
          {errorMessage}
        </p>
      )}


      {/* ==========================
          FRAUD ANALYSIS
      ========================== */}

      {result && (
        <div className="transaction-analysis">

          <p className="success-message">
            Transaction added successfully.
          </p>


          <h2>
            Transaction Analysis
          </h2>


          {/* Risk Level */}

          <h3
            className={`risk-badge risk-${result.riskLevel.toLowerCase()}`}
          >
            {result.riskLevel}
          </h3>


          {/* Risk Score */}

          <p className="risk-score">

            Risk Score:{" "}

            {result.riskScore}/90

          </p>


          {/* Risk Score Bar */}

          <div className="risk-bar">

            <div
              className="risk-bar-fill"
              style={{
                width: `${Math.min(
                  (result.riskScore / 90) * 100,
                  100
                )}%`
              }}
            >
            </div>

          </div>


          {/* Priority */}

          <p>

            <strong>
              Priority:
            </strong>{" "}

            {result.priority}

          </p>


          {/* Risk Explanation */}

          <p>

            <strong>
              Risk Explanation:
            </strong>{" "}

            {result.riskLevel === "CRITICAL" &&
              "Multiple strong fraud indicators were detected."}

            {result.riskLevel === "HIGH" &&
              "Several suspicious indicators were detected."}

            {result.riskLevel === "MEDIUM" &&
              "Some unusual transaction behaviour was detected."}

            {result.riskLevel === "LOW" &&
              "No significant suspicious behaviour was detected."}

          </p>


          {/* Detection Reasons */}

          {Array.isArray(result.reasons) &&
          result.reasons.length > 0 ? (

            <div>

              <h4>
                Why was this transaction flagged?
              </h4>

              <ul>

                {result.reasons.map(
                  (reason, index) => (

                    <li key={index}>
                      {reason}
                    </li>

                  )
                )}

              </ul>

            </div>

          ) : (

            <p className="analysis-safe">

              No suspicious indicators
              were detected.

            </p>

          )}

        </div>
      )}

    </div>
  );
}

export default TransactionForm;