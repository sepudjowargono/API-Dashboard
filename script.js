// ==================== CONFIG & CONSTANTS ====================
const CONFIG = {
  locations: {
    toronto: { name: "Toronto, ON", lat: 43.7064, lon: -79.3986 },
    torontoSunrise: { lat: 43.6532, lon: -79.3832 },
  },
  pokemon: {
    maxId: 151,
  },
  apiEndpoints: {
    dog: "https://dog.ceo/api/breeds/image/random",
    cat: "https://api.thecatapi.com/v1/images/search",
    joke: "https://v2.jokeapi.dev/joke/Any?safe-mode",
    pokemon: "https://pokeapi.co/api/v2/pokemon",
    weather: "https://api.open-meteo.com/v1/forecast",
    airQuality: "https://air-quality-api.open-meteo.com/v1/air-quality",
    sunTimes: "https://api.sunrise-sunset.org/json",
    exchangeRates: "https://open.er-api.com/v6/latest/CAD",
  },
};

// ==================== OPERATION MAPPINGS ====================
const operations = [
  { buttonId: "dog-button", outputId: "dog-output", handler: "getDogImage", message: 'Click "Get Dog" to load an image.' },
  { buttonId: "cat-button", outputId: "cat-output", handler: "getCatImage", message: 'Click "Get Cat" to load an image.' },
  { buttonId: "joke-button", outputId: "joke-output", handler: "getJoke", message: 'Click "Get Joke" for a random joke.' },
  { buttonId: "pokemon-button", outputId: "pokemon-output", handler: "getPokemon", message: 'Click "Get Pokémon" for a random Pokémon.' },
  { buttonId: "weather-button", outputId: "weather-output", handler: "getWeather", message: 'Click "Get Weather" to load Toronto weather.' },
  { buttonId: "airquality-button", outputId: "airquality-output", handler: "getAirQuality", message: 'Click "Get Air Quality" to load Toronto air quality.' },
  { buttonId: "sun-button", outputId: "sun-output", handler: "getSunTimes", message: 'Click "Get Sun Times" to load sunrise and sunset data for Toronto.' },
  { buttonId: "currency-button", outputId: "currency-output", handler: "getExchangeRates", message: 'Click "Get Rates" to load USD exchange rates.' },
];

// ==================== CACHED DOM ELEMENTS ====================
const outputElements = {};
const buttons = {};
operations.forEach(op => {
  outputElements[op.handler] = document.getElementById(op.outputId);
  buttons[op.handler] = document.getElementById(op.buttonId);
});

// ==================== HELPER FUNCTIONS ====================
function setLoading(response, message = "Loading...") {
  response.innerHTML = `
    <div class="loading">
      <span class="spinner"></span>
      <span>${message}</span>
    </div>
  `;
}

function setError(response, message) {
  response.innerHTML = `<div class="error">❌ ${message}</div>`;
}

function setMuted(response, message) {
  response.innerHTML = `<p class="muted-small">${message}</p>`;
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

function validateResponse(data, requiredFields) {
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// ==================== API FUNCTIONS ====================
async function getDogImage() {
  const response = outputElements.getDogImage;
  setLoading(response, "Fetching a random dog...");

  try {
    const data = await fetchJson(CONFIG.apiEndpoints.dog);
    validateResponse(data, ["message"]);
    response.innerHTML = `
      <div class="card-row">
        <img class="api-img" src="${data.message}" alt="Random dog" />
        <p class="muted-small">Source: Dog CEO API (https://dog.ceo/dog-api/)</p>
      </div>
    `;
  } catch (err) {
    setError(response, `Could not load dog image. ${err.message}`);
  }
}

async function getCatImage() {
  const response = outputElements.getCatImage;
  setLoading(response, "Fetching a random cat...");

  try {
    const data = await fetchJson(CONFIG.apiEndpoints.cat);
    validateResponse(data, ["0"]);
    response.innerHTML = `
      <div class="card-row">
        <img class="api-img" src="${data[0].url}" alt="Random cat" />
        <p class="muted-small">Source: TheCatAPI (https://developers.thecatapi.com/view-account/ylX4blBYT9FaoVd6OhvR?report=bOoHBz-8t)</p>
      </div>
    `;
  } catch (err) {
    setError(response, `Could not load cat image. ${err.message}`);
  }
}

async function getJoke() {
  const response = outputElements.getJoke;
  setLoading(response, "Fetching a joke...");

  try {
    const data = await fetchJson(CONFIG.apiEndpoints.joke);
    validateResponse(data, ["type"]);

    let jokeText = "";
    if (data.type === "single") {
      jokeText = data.joke;
    } else {
      jokeText = `${data.setup}<br/><br/><strong>${data.delivery}</strong>`;
    }

    response.innerHTML = `
      <div class="card-row">
        <div class="small">${jokeText}</div>
        <p class="muted-small">Source: JokeAPI (https://jokeapi.dev/)</p>
      </div>
    `;
  } catch (err) {
    setError(response, `Could not load a joke. ${err.message}`);
  }
}

async function getPokemon() {
  const response = outputElements.getPokemon;
  setLoading(response, "Fetching a random Pokémon...");

  try {
    const id = Math.floor(Math.random() * CONFIG.pokemon.maxId) + 1;
    const data = await fetchJson(`${CONFIG.apiEndpoints.pokemon}/${id}`);
    validateResponse(data, ["name", "types", "sprites", "height", "weight"]);

    const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
    const types = data.types.map(t => t.type.name).join(", ");
    const sprite = data.sprites.front_default;

    response.innerHTML = `
      <div class="card-row">
        ${sprite ? `<img class="api-img" src="${sprite}" alt="${name}" />` : ""}
        <div class="small">
          <p><strong>${name}</strong> <span class="muted">(#${id})</span></p>
          <p class="muted">Type: ${types}</p>
          <p class="muted">Height: ${data.height} | Weight: ${data.weight}</p>
        </div>
        <p class="muted-small">Source: PokéAPI (https://pokeapi.co/)</p>
      </div>
    `;
  } catch (err) {
    setError(response, `Could not load Pokémon. ${err.message}`);
  }
}

async function getWeather() {
  const response = outputElements.getWeather;
  setLoading(response, "Fetching weather (Toronto)...");

  try {
    const { lat, lon } = CONFIG.locations.toronto;
    const url =
      `${CONFIG.apiEndpoints.weather}?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,wind_speed_10m` +
      `&temperature_unit=celsius&wind_speed_unit=kmh`;

    const data = await fetchJson(url);
    validateResponse(data, ["current"]);
    const current = data.current;

    response.innerHTML = `
      <div class="card-row">
        <div>
          <span class="badge">City</span> ${CONFIG.locations.toronto.name}
        </div>
        <div class="small">
          🌡️ <strong>${current.temperature_2m}°C</strong>
          <span class="muted">(Feels like ${current.apparent_temperature}°C)</span><br/>
          💨 Wind: <strong>${current.wind_speed_10m} km/h</strong><br/>
          🕒 Updated: <span class="muted">${current.time}</span>
        </div>
        <p class="muted-small">Source: Open-Meteo (https://open-meteo.com/en/docs)</p>
      </div>
    `;
  } catch (err) {
    setError(response, `Could not load current Toronto weather. ${err.message}`);
  }
}

async function getAirQuality() {
  const response = outputElements.getAirQuality;
  setLoading(response, "Fetching Toronto air quality...");

  try {
    const { lat, lon } = CONFIG.locations.toronto;
    const url =
      `${CONFIG.apiEndpoints.airQuality}?latitude=${lat}&longitude=${lon}` +
      `&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone`;

    const data = await fetchJson(url);
    validateResponse(data, ["current"]);
    const current = data.current;

    response.innerHTML = `
      <div class="card-row small">
        <div><span class="badge">City</span> ${CONFIG.locations.toronto.name}</div>
        <div>🧪 US AQI: <strong>${current.us_aqi}</strong></div>
        <div>🌫️ PM2.5: <strong>${current.pm2_5}</strong> µg/m³</div>
        <div>🌫️ PM10: <strong>${current.pm10}</strong> µg/m³</div>
        <div>🧴 NO₂: <strong>${current.nitrogen_dioxide}</strong> µg/m³</div>
        <div>🟦 O₃: <strong>${current.ozone}</strong> µg/m³</div>
        <div class="muted">🕒 Updated: ${current.time}</div>
        <p class="muted-small">Source: Open-Meteo Air Quality (https://open-meteo.com/en/docs/air-quality-api)</p>
      </div>
    `;
  } catch (err) {
    setError(response, `Could not load air quality. ${err.message}`);
  }
}

async function getSunTimes() {
  const response = outputElements.getSunTimes;
  setLoading(response, "Fetching sun times for Toronto...");

  try {
    const { lat, lon } = CONFIG.locations.torontoSunrise;
    const url = `${CONFIG.apiEndpoints.sunTimes}?lat=${lat}&lng=${lon}&formatted=0`;
    const data = await fetchJson(url);
    validateResponse(data, ["results"]);

    const results = data.results;
    const sunrise = new Date(results.sunrise).toLocaleTimeString();
    const sunset = new Date(results.sunset).toLocaleTimeString();
    const solarNoon = new Date(results.solar_noon).toLocaleTimeString();
    const daylight = results.day_length;

    response.innerHTML = `
      <div class="card-row small">
        <div><span class="badge">City</span> ${CONFIG.locations.toronto.name}</div>
        <div>🌅 Sunrise: <strong>${sunrise}</strong></div>
        <div>🌇 Sunset: <strong>${sunset}</strong></div>
        <div>☀️ Solar Noon: <strong>${solarNoon}</strong></div>
        <div>⏱️ Day Length: <strong>${daylight}</strong></div>
        <p class="muted-small">Source: Sunrise-Sunset API (https://sunrise-sunset.org/api)</p>
      </div>
    `;
  } catch (err) {
    setError(response, `Could not load sun data. ${err.message}`);
  }
}

async function getExchangeRates() {
  const response = outputElements.getExchangeRates;
  setLoading(response, "Fetching exchange rates (USD)...");

  try {
    const data = await fetchJson(CONFIG.apiEndpoints.exchangeRates);
    validateResponse(data, ["rates"]);
    const rates = data.rates;

    const eur = rates.EUR;
    const usd = rates.USD;
    if (!eur || !usd) throw new Error("Rates missing in response");

    response.innerHTML = `
      <div class="card-row">
        <div class="small">
          <div><span class="badge">Base</span> CAD</div><br/>
          💶 CAD → EUR: <strong>${eur.toFixed(3)}</strong><br/>
          🍁 CAD → USD: <strong>${usd.toFixed(3)}</strong><br/>
          <span class="muted">Last Updated: ${data.time_last_update_utc}</span>
        </div>
        <p class="muted-small">Source: open.er-api.com (https://www.exchangerate-api.com/docs/free?ref=freepublicapis.com)</p>
      </div>
    `;
  } catch (err) {
    setError(response, `Could not load currency rates. ${err.message}`);
  }
}

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", () => {
  operations.forEach(op => {
    // Initialize output messages
    const outputElement = document.getElementById(op.outputId);
    setMuted(outputElement, op.message);

    // Attach event listeners
    const button = document.getElementById(op.buttonId);
    const handlerFunction = window[op.handler];
    button.addEventListener("click", handlerFunction);
  });
});