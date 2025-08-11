// services/sportradar.js
const axios = require("axios");
const axiosRetry = require("axios-retry").default;

const BASE = process.env.SPORTRADAR_BASE || "https://api.sportradar.com";
const ENV_SUFFIX = process.env.SPORTRADAR_ENV_SUFFIX || "-t2"; // trial example

const http = axios.create({
  baseURL: BASE,
  timeout: 10000,
  validateStatus: s => s >= 200 && s < 500,
});
http.interceptors.request.use(cfg => {
  cfg.headers = {
    ...cfg.headers,
    "x-api-key": process.env.SPORTRADAR_API_KEY,
    "accept": "application/json",
  };
  return cfg;
});
axiosRetry(http, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: err => !err.response || err.response.status >= 500,
});

function ttlFromCacheControl(h) {
  if (!h) return 0;
  const m = /max-age=(\d+)/i.exec(h);
  return m ? parseInt(m[1], 10) : 0;
}

module.exports = { http, ENV_SUFFIX, ttlFromCacheControl };
