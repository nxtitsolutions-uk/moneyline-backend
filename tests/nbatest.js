const axios = require("axios");

const api = axios.create({
  // baseURL: "https://v2.api-football.com/",
  // baseURL: "https://v3.baseball.api-sports.io/",
  // baseURL: "https://v1.basketball.api-sports.io",
  // baseURL: "https://v1.hockey.api-sports.io",
  // baseURL: "https://v2.nba.api-sports.io",
  // baseURL: "https://v1.american-football.api-sports.io/",
  headers: {
    "x-apisports-key": "7b8717513e2ba83d6a63bca86acdb546",
  },
});

async function test() {
  const { data } = await api.get("/status");
  console.log(data);
}

test();
