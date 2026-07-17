import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Reminders fire ahead of due time (addendum §5). 15-minute sweep is well
// within the "human-paced" footprint budget.
crons.interval("scan task reminders", { minutes: 15 }, internal.notify.scanReminders, {});

export default crons;
