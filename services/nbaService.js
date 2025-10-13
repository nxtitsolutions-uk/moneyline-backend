// services/nbaService.js
const axios = require("axios");
require("dotenv").config();

let key = process.env.API_SPORTS_KEY;
console.log("👉 Using Key:", JSON.stringify(key));

const api = axios.create({
  baseURL: "https://v2.nba.api-sports.io",
  headers: {
    // "x-apisports-key": process.env.API_SPORTS_KEY,
    "x-rapidapi-key": process.env.API_SPORTS_KEY, // if using rapidapi.com
    "x-rapidapi-host": "v2.nba.api-sports.io", // if using rapidapi.com
  },
});

async function fetchNBAData(endpoint) {
  try {
    console.log("👉 Fetching NBA Data:", api.defaults.baseURL + endpoint);
    const { data } = await api.get(endpoint);
    console.log("👉 Fetching NBA Data:", api.defaults.baseURL + endpoint);
    console.log("=====================NBA API Response=====================", data);
    return data;
  } catch (err) {
    console.error("NBA API Error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "NBA API request failed");
  }
}

module.exports = { fetchNBAData };

