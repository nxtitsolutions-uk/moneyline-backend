// services/footballService.js
const axios = require("axios");
require("dotenv").config();

let key = process.env.API_SPORTS_KEY;
// console.log("👉 Using Key:", JSON.stringify(key));

const api = axios.create({
  baseURL: "https://v2.api-football.com/", // v3 endpoint
  headers: {
    "x-apisports-key": process.env.API_SPORTS_KEY, // if using api-sports.com
   
  },
});

async function fetchData(endpoint) {
  try {
    const { data } = await api.get(endpoint);
    console.log("👉 Fetching Football Data:", api.defaults.baseURL+endpoint);
    console.log("=====================API Response=====================", data);
    return data;
  } catch (err) {
    console.error("API Error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Football API request failed");
  }
}

module.exports = { fetchData };
