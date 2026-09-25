const cron = require("node-cron");
const Borrowing = require("../models/Borrowing");

/**
 * Checks for all borrowings whose status is 'BORROWED' and dueDate has passed,
 * updating their status to 'OVERDUE'.
 */
const checkAndMarkOverdueBooks = async () => {
  try {
    const result = await Borrowing.updateMany(
      {
        status: "BORROWED",
        dueDate: { $lt: new Date() },
      },
      {
        $set: { status: "OVERDUE" },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[Cron] Marked ${result.modifiedCount} borrowing(s) as OVERDUE.`);
    }
  } catch (error) {
    console.error("[Cron Error] Failed to update overdue books:", error.message);
  }
};

/**
 * Initializes the daily cron job (runs daily at midnight 00:00)
 * and performs an initial check at server startup.
 */
const initOverdueCron = () => {
  // Run once immediately on start
  checkAndMarkOverdueBooks();

  // Run daily at midnight
  cron.schedule("0 0 * * *", () => {
    console.log("[Cron] Running daily check for overdue borrowings...");
    checkAndMarkOverdueBooks();
  });
};

module.exports = {
  initOverdueCron,
  checkAndMarkOverdueBooks,
};
