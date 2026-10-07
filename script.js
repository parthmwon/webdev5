// Uses the free Open-Meteo APIs (no API key required)
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const weatherCard = document.getElementById("weatherCard");

const weatherCodes = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog",
  51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail"
};

async function getWeather(city) {
  message.textContent = "Loading...";
  weatherCard.classList.add("hidden");
  try {
    // Step 1: convert city name to latitude and longitude
    const geoResponse = await fetch(GEO_URL + "?name=" + encodeURIComponent(city) + "&count=1");
    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Please check the spelling.");
    }
    const place = geoData.results[0];

    // Step 2: fetch real-time weather for those coordinates
    const url = WEATHER_URL + "?latitude=" + place.latitude + "&longitude=" + place.longitude +
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m";
    const weatherResponse = await fetch(url);
    if (!weatherResponse.ok) throw new Error("Unable to fetch weather data.");
    const data = await weatherResponse.json();

    showWeather(place, data.current);
    message.textContent = "";
  } catch (error) {
    message.textContent = error.message;
  }
}

function showWeather(place, current) {
  document.getElementById("cityName").textContent = place.name + ", " + place.country;
  document.getElementById("description").textContent = weatherCodes[current.weather_code] || "Unknown";
  document.getElementById("temperature").textContent = Math.round(current.temperature_2m) + "\u00B0C";
  document.getElementById("feelsLike").textContent = Math.round(current.apparent_temperature) + "\u00B0C";
  document.getElementById("humidity").textContent = current.relative_humidity_2m + "%";
  document.getElementById("wind").textContent = current.wind_speed_10m + " km/h";
  weatherCard.classList.remove("hidden");
}

searchBtn.addEventListener("click", function () {
  const city = cityInput.value.trim();
  if (city === "") {
    message.textContent = "Please enter a city name.";
    return;
  }
  getWeather(city);
});

cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") searchBtn.click();
});
