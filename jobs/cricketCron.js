// jobs/cron.js
const cron = require("node-cron");
const { getDailySchedule } = require("../services/cricketService");

// Example: refresh today's and tomorrow's schedules every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  const locale = "en";
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2,"0");
  const dd = String(now.getDate()).padStart(2,"0");
  const today = `${yyyy}-${mm}-${dd}`;

  const tmr = new Date(now.getTime() + 24*60*60*1000);
  const yyyy2 = tmr.getFullYear();
  const mm2 = String(tmr.getMonth()+1).padStart(2,"0");
  const dd2 = String(tmr.getDate()).padStart(2,"0");
  const tomorrow = `${yyyy2}-${mm2}-${dd2}`;

  try { await getDailySchedule({ locale, date: today }); } catch(e){ console.error("schedule today", e.message); }
  try { await getDailySchedule({ locale, date: tomorrow }); } catch(e){ console.error("schedule tmr", e.message); }
});
