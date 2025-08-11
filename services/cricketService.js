// services/cricketService.js
const { http, ENV_SUFFIX, ttlFromCacheControl } = require("./sportradarService");
const Snapshot = require("../models/snapshotModel");
const Latest = require("../models/latestModel");
const { hashOf } = require("../utils/hash");

const SPORT = "cricket";

/**
 * Non-live: fetch and persist schedules for a date.
 * resourceId example: "2025-08-10"
 */
async function getDailySchedule({ locale = "en", date }) {
  const feed = "schedules";
  const resourceId = date;

  // Check Latest first
  const existing = await Latest.findOne({ vendor: "sportradar", sport: SPORT, feed, resourceId, locale });
  if (existing && existing.validUntil && existing.validUntil > new Date()) {
    return { source: "db", payload: existing.payload };
  }

  // Pull from vendor
  const url = `/cricket${ENV_SUFFIX}/${locale}/schedules/${date}/schedule.json`;
  const res = await http.get(url);
  if (res.status >= 400) {
    const err = new Error(`Sportradar ${res.status}`);
    err.status = res.status;
    err.body = res.data;
    throw err;
  }

  const payload = res.data;
  const payloadHash = hashOf(payload);
  const validForSec = ttlFromCacheControl(res.headers["cache-control"]) || 300; // fallback TTL if none
  const fetchedAt = new Date();
  const validUntil = new Date(fetchedAt.getTime() + validForSec * 1000);

  // Snapshots (history)
  await Snapshot.create({
    vendor: "sportradar", sport: SPORT, feed, resourceId, locale,
    payload, payloadHash, fetchedAt, validForSec, isLive: false,
  });

  // Latest (upsert)
  await Latest.updateOne(
    { vendor: "sportradar", sport: SPORT, feed, resourceId, locale },
    { $set: { payload, payloadHash, fetchedAt, validUntil, isLive: false } },
    { upsert: true }
  );

  return { source: "origin", payload };
}

/**
 * Live-first read: lineups for a match.
 * If the match is live (status), *do not* use DB. Otherwise, you can fall back to Latest.
 */
async function getLineups({ locale = "en", matchUrn }) {
  const feed = "lineups";
  const resourceId = matchUrn;

  const url = `/cricket${ENV_SUFFIX}/${locale}/matches/${encodeURIComponent(matchUrn)}/lineups.json`;
  const res = await http.get(url);
  if (res.status >= 400) {
    // If vendor fails and we have a non-live Latest, serve that as last resort
    const latest = await Latest.findOne({ vendor: "sportradar", sport: SPORT, feed, resourceId, locale });
    if (latest && !latest.isLive) return { source: "db-fallback", payload: latest.payload };
    const err = new Error(`Sportradar ${res.status}`);
    err.status = res.status; err.body = res.data;
    throw err;
  }

  const payload = res.data;

  // Decide live vs not live (example: inspect payload if it carries status; adjust to actual field name)
  const isLive = !!payload?.sport_event_status?.match_status &&
                 ["live","delayed","suspended"].includes(String(payload.sport_event_status.match_status).toLowerCase());

  if (!isLive) {
    const payloadHash = hashOf(payload);
    const fetchedAt = new Date();
    const validForSec = ttlFromCacheControl(res.headers["cache-control"]) || 600;
    const validUntil = new Date(fetchedAt.getTime() + validForSec * 1000);

    await Snapshot.create({
      vendor: "sportradar", sport: SPORT, feed, resourceId, locale,
      payload, payloadHash, fetchedAt, validForSec, isLive: false
    });

    await Latest.updateOne(
      { vendor: "sportradar", sport: SPORT, feed, resourceId, locale },
      { $set: { payload, payloadHash, fetchedAt, validUntil, isLive: false } },
      { upsert: true }
    );
  }

  // For live, just return vendor payload (no backup).
  return { source: isLive ? "live" : "origin", payload };
}

module.exports = { getDailySchedule, getLineups };
