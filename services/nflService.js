// services/americanFootballService.js
const axios = require("axios");
require("dotenv").config();

let key = process.env.API_SPORTS_KEY;
// console.log("👉 Using Key:", JSON.stringify(key));

const api = axios.create({
  baseURL: "https://v1.american-football.api-sports.io/",
  headers: {
    "x-apisports-key": process.env.API_SPORTS_KEY,
  },
});

async function fetchAmericanFootballData(endpoint) {
  try {
    const { data } = await api.get(endpoint);
    console.log("👉 Fetching NFL Data:", api.defaults.baseURL + endpoint);
    console.log("=====================NFL API Response=====================", data);
    return data;
  } catch (err) {
    console.error("NFL API Error:", err.response?.data || err.message);
    throw new Error(
      err.response?.data?.message || "American Football API request failed"
    );
  }
}

module.exports = { fetchAmericanFootballData };
