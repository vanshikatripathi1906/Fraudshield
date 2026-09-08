const Transaction =
  require("../models/transaction");


// ==========================================
// FRAUD DETECTION ENGINE
// ==========================================

const checkTransaction =
  async (transaction) => {

    // ==========================================
    // VALIDATE TRANSACTION
    // ==========================================

    if (!transaction) {
      throw new Error(
        "Transaction is required"
      );
    }


    if (!transaction.userId) {
      throw new Error(
        "Transaction user is required"
      );
    }


    // ==========================================
    // VALIDATE AMOUNT
    // ==========================================

    const amount =
      Number(transaction.amount);


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      throw new Error(
        "Invalid transaction amount"
      );

    }


    // ==========================================
    // VALIDATE TRANSACTION TIME
    // ==========================================

    const transactionTime =
      new Date(
        transaction.transactionTime
      );


    if (
      Number.isNaN(
        transactionTime.getTime()
      )
    ) {

      throw new Error(
        "Invalid transaction time"
      );

    }


    // ==========================================
    // GET PREVIOUS TRANSACTIONS
    // ==========================================

    const previousTransactions =
      await Transaction.find({

        userId:
          transaction.userId,

        // Do not analyse the current
        // transaction as historical data

        _id: {
          $ne: transaction._id
        }

      })
      .sort({
        transactionTime: -1
      })
      .limit(100);


    // ==========================================
    // INITIAL SCORE
    // ==========================================

    let score = 0;

    const reasons = [];


    // ==========================================
    // RULE 1
    // AMOUNT ANOMALY
    // +25 POINTS
    // ==========================================

    if (
      previousTransactions.length >= 3
    ) {

      const totalAmount =
        previousTransactions.reduce(
          (total, item) => {

            return (
              total +
              Number(item.amount || 0)
            );

          },
          0
        );


      const averageAmount =
        totalAmount /
        previousTransactions.length;


      if (
        averageAmount > 0 &&
        amount >
          averageAmount * 3
      ) {

        score += 25;

        reasons.push(
          "Transaction amount is significantly higher than the user's previous average"
        );

      }

    }


    // ==========================================
    // RULE 2
    // NEW DEVICE
    // +20 POINTS
    // ==========================================

    if (
      previousTransactions.length > 0 &&
      transaction.device
    ) {

      const knownDevices =
        previousTransactions.map(
          (item) =>
            item.device
        );


      if (
        !knownDevices.includes(
          transaction.device
        )
      ) {

        score += 20;

        reasons.push(
          "Transaction was made from a new device"
        );

      }

    }


    // ==========================================
    // RULE 3
    // NEW LOCATION
    // +20 POINTS
    // ==========================================

    if (
      previousTransactions.length > 0 &&
      transaction.location
    ) {

      const knownLocations =
        previousTransactions.map(
          (item) =>
            item.location
        );


      if (
        !knownLocations.includes(
          transaction.location
        )
      ) {

        score += 20;

        reasons.push(
          "Transaction occurred from a new location"
        );

      }

    }


    // ==========================================
    // RULE 4
    // UNUSUAL TRANSACTION TIME
    // +10 POINTS
    // ==========================================

    const hour =
      transactionTime.getHours();


    if (
      hour >= 0 &&
      hour < 5
    ) {

      score += 10;

      reasons.push(
        "Transaction occurred during unusual hours"
      );

    }


    // ==========================================
    // RULE 5
    // HIGH TRANSACTION FREQUENCY
    // +15 POINTS
    // ==========================================

    const tenMinutesAgo =
      new Date(
        transactionTime.getTime() -
        10 * 60 * 1000
      );


    const recentTransactions =
      previousTransactions.filter(
        (item) => {

          const itemTime =
            new Date(
              item.transactionTime
            );


          return (
            itemTime >= tenMinutesAgo &&
            itemTime < transactionTime
          );

        }
      );


    if (
      recentTransactions.length >= 3
    ) {

      score += 15;

      reasons.push(
        "Multiple transactions occurred within a short time period"
      );

    }


    // ==========================================
    // CAP SCORE
    // ==========================================

    score =
      Math.min(score, 90);


    // ==========================================
    // DETERMINE RISK LEVEL
    // ==========================================

    let riskLevel = "LOW";


    if (score >= 80) {

      riskLevel = "CRITICAL";

    } else if (score >= 60) {

      riskLevel = "HIGH";

    } else if (score >= 30) {

      riskLevel = "MEDIUM";

    }


    // ==========================================
    // PRIORITY
    // ==========================================

    const priority =
      riskLevel;


    // ==========================================
    // RETURN RESULT
    // ==========================================

    return {

      riskScore:
        score,

      riskLevel:
        riskLevel,

      priority:
        priority,

      reasons:
        reasons

    };

  };


module.exports =
  checkTransaction;