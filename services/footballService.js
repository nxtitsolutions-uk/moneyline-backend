// services/footballService.js
const axios = require("axios");
require("dotenv").config();

const api = axios.create({
  baseURL: "https://v2.api-football.com/", // v3 endpoint
  headers: {
    "x-apisports-key": process.env.API_FOOTBALL_KEY, // if using api-sports.com
    // OR "x-rapidapi-key": process.env.API_FOOTBALL_KEY, // if using rapidapi.com
    "x-rapidapi-host": "v2.football.api-sports.io",
  },
});

async function fetchData(endpoint) {
  try {
    const { data } = await api.get(endpoint);
    console.log("=====================API Response=====================", data);
    return data;
  } catch (err) {
    console.error("API Error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Football API request failed");
  }
}

module.exports = { fetchData };
