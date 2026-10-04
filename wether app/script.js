const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const darkModeBtn = document.getElementById("darkModeBtn");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const weatherContainer = document.getElementById("weatherContainer");

const cityName = document.getElementById("cityName");
const weatherDate = document.getElementById("weatherDate");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const feelsLikeSmall = document.getElementById("feelsLikeSmall");

const hourlyContainer = document.getElementById("hourlyContainer");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const detailTemperature = document.getElementById("detailTemperature");
const detailHumidity = document.getElementById("detailHumidity");
const detailWind = document.getElementById("detailWind");
const windDirection = document.getElementById("windDirection");
const visibility = document.getElementById("visibility");
const pressure = document.getElementById("pressure");
const uvIndex = document.getElementById("uvIndex");
const coordinates = document.getElementById("coordinates");

const airQualityValue = document.getElementById("airQualityValue");
const airQualityStatus = document.getElementById("airQualityStatus");
const airQualityTitle = document.getElementById("airQualityTitle");
const airQualityDescription = document.getElementById("airQualityDescription");

const dailyContainer = document.getElementById("dailyContainer");

const sunTip = document.getElementById("sunTip");
const waterTip = document.getElementById("waterTip");
const rainTip = document.getElementById("rainTip");

const recentCities = document.getElementById("recentCities");
const weatherAnimation = document.getElementById("weatherAnimation");

let currentLatitude = null;
let currentLongitude = null;

const weatherCodes = {
    0: ["☀️", "Clear Sky"],
    1: ["🌤️", "Mainly Clear"],
    2: ["⛅", "Partly Cloudy"],
    3: ["☁️", "Overcast"],
    45: ["🌫️", "Foggy"],
    48: ["🌫️", "Rime Fog"],
    51: ["🌦️", "Light Drizzle"],
    53: ["🌦️", "Drizzle"],
    55: ["🌧️", "Heavy Drizzle"],
    56: ["🌧️", "Freezing Drizzle"],
    57: ["🌧️", "Heavy Freezing Drizzle"],
    61: ["🌦️", "Light Rain"],
    63: ["🌧️", "Rain"],
    65: ["🌧️", "Heavy Rain"],
    66: ["🌧️", "Freezing Rain"],
    67: ["🌧️", "Heavy Freezing Rain"],
    71: ["🌨️", "Light Snow"],
    73: ["🌨️", "Snow"],
    75: ["❄️", "Heavy Snow"],
    77: ["❄️", "Snow Grains"],
    80: ["🌦️", "Rain Showers"],
    81: ["🌧️", "Rain Showers"],
    82: ["⛈️", "Heavy Rain Showers"],
    85: ["🌨️", "Snow Showers"],
    86: ["❄️", "Heavy Snow Showers"],
    95: ["⛈️", "Thunderstorm"],
    96: ["⛈️", "Thunderstorm with Hail"],
    99: ["⛈️", "Severe Thunderstorm"]
};

function showLoading() {
    loading.style.display = "flex";
    weatherContainer.style.display = "none";
}

function hideLoading() {
    loading.style.display = "none";
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
}

function hideError() {
    errorMessage.style.display = "none";
}

function getWeatherInfo(code) {
    return weatherCodes[code] || ["🌤️", "Unknown Weather"];
}

function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function formatTime(timeString) {
    const date = new Date(timeString);

    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

function getWindDirection(degrees) {
    if (degrees === null || degrees === undefined) {
        return "--";
    }

    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];

    const index = Math.round(degrees / 45) % 8;

    return `${directions[index]} (${Math.round(degrees)}°)`;
}

function getAirQualityStatus(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return ["--", "Air quality data unavailable"];
    }

    if (value <= 20) {
        return ["Excellent", "Very clean air"];
    }

    if (value <= 40) {
        return ["Good", "Air quality is good"];
    }

    if (value <= 60) {
        return ["Moderate", "Acceptable air quality"];
    }

    if (value <= 80) {
        return ["Poor", "Sensitive people should be careful"];
    }

    if (value <= 100) {
        return ["Very Poor", "Consider reducing outdoor activity"];
    }

    return ["Unhealthy", "Outdoor exposure should be limited"];
}

async function searchCity() {
    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    showLoading();
    hideError();

    try {
        const url =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("City search failed");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error("City not found");
        }

        const location = data.results[0];

        currentLatitude = location.latitude;
        currentLongitude = location.longitude;

        const displayName =
            location.name +
            (location.country ? `, ${location.country}` : "");

        const success = await getWeather(
            location.latitude,
            location.longitude,
            displayName
        );

        if (success) {
            saveRecentCity(location.name);
        }

    } catch (error) {
        hideLoading();
        showError(
            "City not found. Please check the spelling and try again."
        );
    }
}

async function getWeather(latitude, longitude, locationName) {
    showLoading();
    hideError();

    try {
        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m` +
            `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation_probability,visibility,uv_index` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max` +
            `&timezone=auto&forecast_days=6`;

        const response = await fetch(weatherUrl);

        if (!response.ok) {
            throw new Error("Weather request failed");
        }

        const data = await response.json();

        if (!data.current) {
            throw new Error("Weather data unavailable");
        }

        updateWeather(data, locationName);
        updateHourly(data);
        updateDaily(data);
        updateTips(data);

        await updateAirQuality(latitude, longitude);

        currentLatitude = latitude;
        currentLongitude = longitude;

        hideLoading();
        weatherContainer.style.display = "block";

        return true;

    } catch (error) {
        hideLoading();
        showError(
            "Unable to load weather data. Please check your internet connection."
        );

        return false;
    }
}

function updateWeather(data, locationName) {
    const current = data.current;

    const info = getWeatherInfo(current.weather_code);

    cityName.textContent = locationName;
    weatherDate.textContent = formatDate(current.time);

    weatherIcon.textContent = info[0];
    weatherDescription.textContent = info[1];

    temperature.textContent =
        Math.round(current.temperature_2m);

    feelsLike.textContent =
        Math.round(current.apparent_temperature);

    feelsLikeSmall.textContent =
        Math.round(current.apparent_temperature) + "°C";

    humidity.textContent =
        Math.round(current.relative_humidity_2m) + "%";

    windSpeed.textContent =
        Math.round(current.wind_speed_10m) + " km/h";

    detailTemperature.textContent =
        Math.round(current.temperature_2m) + "°C";

    detailHumidity.textContent =
        Math.round(current.relative_humidity_2m) + "%";

    detailWind.textContent =
        Math.round(current.wind_speed_10m) + " km/h";

    windDirection.textContent =
        getWindDirection(current.wind_direction_10m);

    pressure.textContent =
        Math.round(current.pressure_msl) + " hPa";

    coordinates.textContent =
        `${Number(data.latitude).toFixed(2)}, ${Number(data.longitude).toFixed(2)}`;

    const visibilityValue =
        data.hourly?.visibility?.[0];

    if (visibilityValue !== undefined) {
        visibility.textContent =
            (visibilityValue / 1000).toFixed(1) + " km";
    } else {
        visibility.textContent = "-- km";
    }

    const currentUV =
        data.hourly?.uv_index?.[0];

    uvIndex.textContent =
        currentUV !== undefined
            ? Number(currentUV).toFixed(1)
            : "--";

    if (data.daily?.sunrise?.[0]) {
        sunrise.textContent =
            formatTime(data.daily.sunrise[0]);
    }

    if (data.daily?.sunset?.[0]) {
        sunset.textContent =
            formatTime(data.daily.sunset[0]);
    }

    setWeatherBackground(
        current.weather_code,
        current.is_day
    );

    createWeatherAnimation(
        current.weather_code,
        current.is_day
    );
}

function updateHourly(data) {
    hourlyContainer.innerHTML = "";

    if (!data.hourly) {
        return;
    }

    const times = data.hourly.time;
    const temperatures = data.hourly.temperature_2m;
    const humidityData = data.hourly.relative_humidity_2m;
    const codes = data.hourly.weather_code;

    let startIndex = times.findIndex(
        time => new Date(time) >= new Date(data.current.time)
    );

    if (startIndex < 0) {
        startIndex = 0;
    }

    const endIndex = Math.min(
        startIndex + 12,
        times.length
    );

    for (let i = startIndex; i < endIndex; i++) {
        const info = getWeatherInfo(codes[i]);

        const card = document.createElement("div");
        card.className = "hourly-card";

        card.innerHTML = `
            <div class="time">
                ${formatTime(times[i])}
            </div>

            <div class="icon">
                ${info[0]}
            </div>

            <div class="temp">
                ${Math.round(temperatures[i])}°C
            </div>

            <div class="humidity">
                💧 ${Math.round(humidityData[i])}%
            </div>
        `;

        hourlyContainer.appendChild(card);
    }
}

function updateDaily(data) {
    dailyContainer.innerHTML = "";

    if (!data.daily) {
        return;
    }

    const days = Math.min(
        5,
        data.daily.time.length
    );

    for (let i = 0; i < days; i++) {
        const info = getWeatherInfo(
            data.daily.weather_code[i]
        );

        const date = new Date(
            data.daily.time[i]
        );

        const dayName = date.toLocaleDateString(
            "en-IN",
            {
                weekday: "short"
            }
        );

        const card = document.createElement("div");
        card.className = "daily-card";

        card.innerHTML = `
            <div class="day">
                ${i === 0 ? "Today" : dayName}
            </div>

            <div class="icon">
                ${info[0]}
            </div>

            <div class="temps">
                <span class="max-temp">
                    ${Math.round(data.daily.temperature_2m_max[i])}°
                </span>

                <span class="min-temp">
                    ${Math.round(data.daily.temperature_2m_min[i])}°
                </span>
            </div>

            <div class="description">
                ${info[1]}
            </div>
        `;

        dailyContainer.appendChild(card);
    }
}

async function updateAirQuality(latitude, longitude) {
    try {
        const url =
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}` +
            `&hourly=pm10,pm2_5,us_aqi&timezone=auto&forecast_days=1`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Air quality request failed");
        }

        const data = await response.json();

        const aqi =
            data.hourly?.us_aqi?.[0];

        const pm25 =
            data.hourly?.pm2_5?.[0];

        if (aqi === undefined) {
            airQualityValue.textContent = "--";
            airQualityStatus.textContent =
                "Data unavailable";

            airQualityDescription.textContent =
                "Air quality information is currently unavailable.";

            return;
        }

        const status =
            getAirQualityStatus(aqi);

        airQualityTitle.textContent =
            "US Air Quality Index";

        airQualityValue.textContent =
            Math.round(aqi);

        airQualityStatus.textContent =
            status[0];

        airQualityDescription.textContent =
            `${status[1]}. Current PM2.5 level: ${
                pm25 !== undefined
                    ? Number(pm25).toFixed(1)
                    : "--"
            } µg/m³.`;

    } catch (error) {
        airQualityValue.textContent = "--";
        airQualityStatus.textContent =
            "Unavailable";

        airQualityDescription.textContent =
            "Air quality data could not be loaded.";
    }
}

function updateTips(data) {
    const current = data.current;

    const temp = current.temperature_2m;
    const humidityValue =
        current.relative_humidity_2m;

    const rainProbability =
        data.daily?.precipitation_probability_max?.[0] || 0;

    const uv =
        data.daily?.uv_index_max?.[0] || 0;

    if (uv >= 8) {
        sunTip.textContent =
            "UV levels are high. Try to avoid strong afternoon sunlight.";
    } else if (uv >= 5) {
        sunTip.textContent =
            "UV levels are moderate. Take basic sun protection outdoors.";
    } else {
        sunTip.textContent =
            "UV levels are relatively low today.";
    }

    if (temp >= 35) {
        waterTip.textContent =
            "It is hot today. Drink water regularly and avoid getting dehydrated.";
    } else if (humidityValue >= 75) {
        waterTip.textContent =
            "Humidity is high. Keep drinking water and stay comfortable.";
    } else {
        waterTip.textContent =
            "Keep drinking water regularly throughout the day.";
    }

    if (rainProbability >= 70) {
        rainTip.textContent =
            "High chance of rain today. Carry an umbrella if you go outside.";
    } else if (rainProbability >= 40) {
        rainTip.textContent =
            "There is a chance of rain today. Keep an umbrella nearby.";
    } else {
        rainTip.textContent =
            "Rain probability is low today.";
    }
}

function setWeatherBackground(code, isDay) {
    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "night"
    );

    if (!isDay) {
        document.body.classList.add("night");
        return;
    }

    if (
        code === 0 ||
        code === 1
    ) {
        document.body.classList.add("sunny");
    } else if (
        code === 2 ||
        code === 3 ||
        code === 45 ||
        code === 48
    ) {
        document.body.classList.add("cloudy");
    } else {
        document.body.classList.add("rainy");
    }
}

function createWeatherAnimation(code, isDay) {
    weatherAnimation.innerHTML = "";

    if (!isDay) {
        const moon = document.createElement("div");

        moon.style.width = "75px";
        moon.style.height = "75px";
        moon.style.borderRadius = "50%";
        moon.style.background =
            "radial-gradient(circle at 35% 35%, #fff, #cbd5e1)";
        moon.style.boxShadow =
            "0 0 35px rgba(255,255,255,0.35)";

        weatherAnimation.appendChild(moon);
        return;
    }

    if (code <= 1) {
        const sun = document.createElement("div");
        sun.className = "animated-sun";
        weatherAnimation.appendChild(sun);
        return;
    }

    if (code === 2 || code === 3 || code === 45 || code === 48) {
        const cloud = document.createElement("div");
        cloud.className = "animated-cloud";
        weatherAnimation.appendChild(cloud);
        return;
    }

    if (code >= 95) {
        const storm = document.createElement("div");
        storm.className = "storm-animation";
        weatherAnimation.appendChild(storm);
        return;
    }

    if (
        code >= 71 &&
        code <= 86
    ) {
        for (let i = 0; i < 7; i++) {
            const snow = document.createElement("div");

            snow.className = "snow-flake";

            snow.style.position = "absolute";
            snow.style.left = `${i * 15}px`;
            snow.style.animationDelay =
                `${i * 0.35}s`;

            weatherAnimation.appendChild(snow);
        }

        return;
    }

    for (let i = 0; i < 7; i++) {
        const drop = document.createElement("div");

        drop.className = "rain-drop";

        drop.style.position = "absolute";
        drop.style.left = `${i * 13}px`;
        drop.style.animationDelay =
            `${i * 0.15}s`;

        weatherAnimation.appendChild(drop);
    }
}

function saveRecentCity(city) {
    if (!city) {
        return;
    }

    let cities = [];

    try {
        cities =
            JSON.parse(
                localStorage.getItem("recentCities")
            ) || [];
    } catch {
        cities = [];
    }

    cities =
        cities.filter(
            item =>
                item.toLowerCase() !==
                city.toLowerCase()
        );

    cities.unshift(city);

    cities = cities.slice(0, 6);

    localStorage.setItem(
        "recentCities",
        JSON.stringify(cities)
    );

    displayRecentCities();
}

function displayRecentCities() {
    recentCities.innerHTML = "";

    let cities = [];

    try {
        cities =
            JSON.parse(
                localStorage.getItem("recentCities")
            ) || [];
    } catch {
        cities = [];
    }

    cities.forEach(city => {
        const button =
            document.createElement("button");

        button.textContent = city;

        button.addEventListener(
            "click",
            () => {
                cityInput.value = city;
                searchCity();
            }
        );

        recentCities.appendChild(button);
    });
}

function useMyLocation() {
    if (!navigator.geolocation) {
        showError(
            "Geolocation is not supported by this browser."
        );

        return;
    }

    showLoading();
    hideError();

    navigator.geolocation.getCurrentPosition(
        async position => {
            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            currentLatitude = latitude;
            currentLongitude = longitude;

            const success =
                await getWeather(
                    latitude,
                    longitude,
                    "My Location"
                );

            if (success) {
                cityInput.value = "";
            }
        },

        error => {
            hideLoading();

            if (error.code === 1) {
                showError(
                    "Location permission was denied. Allow location access and try again."
                );
            } else if (error.code === 2) {
                showError(
                    "Your location could not be detected. Check your internet or location settings."
                );
            } else if (error.code === 3) {
                showError(
                    "Location request timed out. Please try again."
                );
            } else {
                showError(
                    "Unable to detect your location. Please try again."
                );
            }
        },

        {
            enableHighAccuracy: false,
            timeout: 20000,
            maximumAge: 300000
        }
    );
}

function loadDarkMode() {
    const savedMode =
        localStorage.getItem("darkMode");

    if (savedMode === "true") {
        document.body.classList.add("dark-mode");
        darkModeBtn.textContent = "☀️";
    } else {
        document.body.classList.remove("dark-mode");
        darkModeBtn.textContent = "🌙";
    }
}

function toggleDarkMode() {
    const enabled =
        document.body.classList.toggle("dark-mode");

    localStorage.setItem(
        "darkMode",
        enabled
    );

    darkModeBtn.textContent =
        enabled ? "☀️" : "🌙";
}

searchBtn.addEventListener(
    "click",
    searchCity
);

cityInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            searchCity();
        }
    }
);

locationBtn.addEventListener(
    "click",
    useMyLocation
);

darkModeBtn.addEventListener(
    "click",
    toggleDarkMode
);

loadDarkMode();
displayRecentCities();