import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_URL from "../config";

function Transactions() {
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchText, setSearchText] = useState("");

  /*
    Get all transactions
  */
  const getTransactions = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.get(
        `${API_URL}/api/transactions`,
        {
          withCredentials: true
        }
      );

      setTransactions(
        Array.isArray(
          response.data.transactions
        )
          ? response.data.transactions
          : []
      );
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
    Load transactions when page opens
  */
  useEffect(() => {
    const loadTransactions = async () => {
      await getTransactions();
    };

    loadTransactions();
  }, []);

  /*
    Search text
  */
  const search =
    searchText.toLowerCase().trim();

  /*
    Filter transactions
  */
  const filteredTransactions =
    transactions.filter(
      (transaction) => {
        if (search === "") {
          return true;
        }

        const merchant =
          transaction.merchant
            ?.toLowerCase() || "";

        const location =
          transaction.location
            ?.toLowerCase() || "";

        const device =
          transaction.device
            ?.toLowerCase() || "";

        const paymentMethod =
          transaction.paymentMethod
            ?.toLowerCase() || "";

        const source =
          transaction.source
            ?.toLowerCase() || "";

        const amount =
          String(
            transaction.amount || ""
          );

        return (
          merchant.includes(search) ||
          location.includes(search) ||
          device.includes(search) ||
          paymentMethod.includes(search) ||
          source.includes(search) ||
          amount.includes(search)
        );
      }
    );

  /*
    Clear search
  */
  const clearSearch = () => {
    setSearchText("");
  };

  return (
    <div className="transactions-page">

     

      <main className="transactions-container">

        {/* ================= HEADER ================= */}

        <section className="transactions-header">

          <div>

            

            <h1>
              Transactions
            </h1>

            <p>
              View and search your financial
              transactions monitored by FraudShield.
            </p>

          </div>


          <button
            type="button"
            className="refresh-button"
            onClick={getTransactions}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh Transactions"}
          </button>

        </section>


        {/* ================= ERROR ================= */}

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
              onClick={getTransactions}
            >
              Try Again
            </button>

          </div>
        )}


        {/* ================= SUMMARY ================= */}

        {!loading && (
          <section className="transaction-summary-card">

            <div>

              <span>
                Total Transactions
              </span>

              <strong>
                {transactions.length}
              </strong>

            </div>


            <div>

              <span>
                Showing
              </span>

              <strong>
                {filteredTransactions.length}
              </strong>

            </div>


            <div>

              <span>
                Data Source
              </span>

              <strong>
                Multiple
              </strong>

            </div>

          </section>
        )}


        {/* ================= SEARCH ================= */}

        <section className="transaction-search-section">

          <div className="section-heading">

            <div>

             
              <h2>
                Find a Transaction
              </h2>

            </div>

          </div>


          <div className="transaction-search-box">

            <input
              type="text"
              placeholder="Search merchant, location, device, payment method, source or amount..."
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
            />


            {searchText && (
              <button
                type="button"
                onClick={clearSearch}
                className="clear-search-button"
              >
                Clear
              </button>
            )}

          </div>

        </section>


        {/* ================= LOADING ================= */}

        {loading ? (

          <section className="dashboard-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading transactions...
            </p>

          </section>

        ) : transactions.length === 0 ? (

          /* ================= NO TRANSACTIONS ================= */

          <section className="dashboard-empty">

            <h2>
              No Transactions Yet
            </h2>

            <p>
              You have not added any transactions.
            </p>

            <p>
              Add a transaction from the Dashboard
              or upload a CSV statement.
            </p>

            <Link
              to="/dashboard"
              className="empty-state-link"
            >
              Go to Dashboard →
            </Link>

          </section>

        ) : filteredTransactions.length === 0 ? (

          /* ================= NO MATCH ================= */

          <section className="dashboard-empty">

            <h2>
              No Matching Transactions
            </h2>

            <p>
              No transaction matches your
              current search.
            </p>

            <button
              type="button"
              className="clear-filter-button"
              onClick={clearSearch}
            >
              Clear Search
            </button>

          </section>

        ) : (

          /* ================= TRANSACTION TABLE ================= */

          <section className="transactions-table-section">

            <div className="table-header">

              <div>

               

                <h2>
                  All Transactions
                </h2>

              </div>

              <span className="table-count">
                {filteredTransactions.length} transaction
                {filteredTransactions.length !== 1
                  ? "s"
                  : ""}
              </span>

            </div>


            <div className="transactions-table-container">

              <table className="transactions-table">

                <thead>

                  <tr>

                    <th>
                      Amount
                    </th>

                    <th>
                      Merchant
                    </th>

                    <th>
                      Payment Method
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Device
                    </th>

                    <th>
                      Source
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredTransactions.map(
                    (transaction) => {

                      const source =
                        transaction.source ||
                        "MANUAL";

                      return (

                        <tr
                          key={
                            transaction._id
                          }
                        >

                          {/* AMOUNT */}

                          <td className="transaction-amount">

                            ₹
                            {Number(
                              transaction.amount ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </td>


                          {/* MERCHANT */}

                          <td>

                            <strong>
                              {transaction.merchant ||
                                "Unknown"}
                            </strong>

                          </td>


                          {/* PAYMENT METHOD */}

                          <td>

                            {transaction.paymentMethod ||
                              "Unknown"}

                          </td>


                          {/* LOCATION */}

                          <td>

                            {transaction.location ||
                              "Unknown"}

                          </td>


                          {/* DEVICE */}

                          <td>

                            {transaction.device ||
                              "Unknown"}

                          </td>


                          {/* SOURCE */}

                          <td>

                            <span
                              className={`source-badge source-${source.toLowerCase()}`}
                            >
                              {source}
                            </span>

                          </td>


                          {/* DATE */}

                          <td>

                            {transaction.transactionTime
                              ? new Date(
                                  transaction.transactionTime
                                ).toLocaleString()
                              : "Unknown"}

                          </td>


                          {/* ACTION */}

                          <td>

                            <Link
                              to={`/transactions/${transaction._id}`}
                              className="transaction-view-link"
                            >
                              View →
                            </Link>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default Transactions;