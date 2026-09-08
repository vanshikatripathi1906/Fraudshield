import { useRef, useState } from "react";
import axios from "axios";
import API_URL from "../config";

function CSVUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const downloadSampleCSV = () => {
    const csvContent =
      "amount,location,device,merchant,paymentMethod,transactionTime\n" +
      "500,Delhi,Chrome-Windows,Amazon,UPI,2026-09-05T10:30:00\n" +
      "650,Delhi,Chrome-Windows,Flipkart,UPI,2026-09-05T11:00:00\n" +
      "800,Delhi,Chrome-Windows,Swiggy,UPI,2026-09-05T12:00:00\n" +
      "700,Delhi,Chrome-Windows,BookMyShow,UPI,2026-09-05T13:00:00\n" +
      "9500,Mumbai,Android-Samsung,Unknown Merchant,CARD,2026-09-05T03:15:00";

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "sample-transactions.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  const handleFileChange = (event) => {
    setMessage("");
    setErrorMessage("");

    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    /*
      Check file extension.
    */

    const fileName =
      selectedFile.name.toLowerCase();

    if (!fileName.endsWith(".csv")) {
      setFile(null);

      setErrorMessage(
        "Please select a CSV file only"
      );

      event.target.value = "";

      return;
    }

    /*
      Check file size.
    */

    if (
      selectedFile.size >
      2 * 1024 * 1024
    ) {
      setFile(null);

      setErrorMessage(
        "CSV file must be smaller than 2 MB"
      );

      event.target.value = "";

      return;
    }

    setFile(selectedFile);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!file) {
      setErrorMessage(
        "Please select a CSV file"
      );

      return;
    }

    if (loading) {
      return;
    }

    /*
      Double-check file extension
      before sending to backend.
    */

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setErrorMessage(
        "Please select a CSV file only"
      );

      return;
    }

    /*
      Double-check file size.
    */

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      setErrorMessage(
        "CSV file must be smaller than 2 MB"
      );

      return;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    try {
      setLoading(true);

      const response =
        await axios.post(
          `${API_URL}/api/upload/csv`,
          formData,
          {
            withCredentials: true
          }
        );

      const importedTransactions =
        Number(
          response.data
            ?.importedTransactions || 0
        );

      const fraudAlerts =
        Number(
          response.data
            ?.fraudAlerts || 0
        );

      const skippedRows =
        Number(
          response.data
            ?.skippedRows || 0
        );

      let uploadMessage =
        `${importedTransactions} transactions imported, ${fraudAlerts} fraud alerts detected.`;

      if (skippedRows > 0) {
        uploadMessage +=
          ` ${skippedRows} rows skipped.`;
      }

      setMessage(
        uploadMessage
      );

      /*
        Clear selected file
        after successful upload.
      */

      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      /*
        Refresh Dashboard data.
      */

      if (onUploadComplete) {
        onUploadComplete();
      }

    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
        "CSV upload failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-card">

      <h2>
        Upload Bank Statement
      </h2>

      <p>
        Upload your CSV transaction statement
        to analyze multiple transactions at once.
      </p>

      <p className="csv-help">

        <strong>
          Required columns:
        </strong>{" "}
        amount, location, device

        <br />

        <strong>
          Optional columns:
        </strong>{" "}
        merchant, paymentMethod, transactionTime

      </p>

      <button
        type="button"
        className="sample-button"
        onClick={downloadSampleCSV}
      >
        Download Sample CSV
      </button>

      <form onSubmit={handleUpload}>

        <div className="form-group">

          <label>
            Select CSV File
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            disabled={loading}
          />

        </div>

        {file && (
          <p className="selected-file">

            Selected file:{" "}

            <strong>
              {file.name}
            </strong>

            <br />

            Size:{" "}
            {formatFileSize(
              file.size
            )}

          </p>
        )}

        <button
          type="submit"
          disabled={
            loading || !file
          }
        >

          {loading
            ? "Uploading..."
            : "Upload CSV"}

        </button>

      </form>

      {message && (
        <div className="upload-result">

          <strong>
            Import Complete
          </strong>

          <p className="success-message">
            {message}
          </p>

        </div>
      )}

      {errorMessage && (
        <p className="error-message">
          {errorMessage}
        </p>
      )}

    </div>
  );
}

export default CSVUpload;