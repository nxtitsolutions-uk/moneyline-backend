// Helper function to calculate the expiry date based on subscription duration
function calculateExpiryDate(startDate, duration) {
  const msInDay = 24 * 60 * 60 * 1000; // Milliseconds in one day

  // Handle different subscription durations
  switch (duration.toLowerCase()) {
    case "monthly":
      return new Date(startDate.getTime() + 30 * msInDay); // 30 days for monthly

    case "quarterly": // Approx. 3 months = 90 days
      return new Date(startDate.getTime() + 90 * msInDay);

    case "bi-annual": // Approx. 6 months = 182 days
    case "biannual":
      return new Date(startDate.getTime() + 182 * msInDay);

    case "annual":
    case "yearly":
      return new Date(startDate.getTime() + 365 * msInDay); // 1 year

    default:
      return new Date(startDate.getTime() + 30 * msInDay); // Default to 1 month if no duration is given
  }
}


module.exports = {
  calculateExpiryDate,
};
