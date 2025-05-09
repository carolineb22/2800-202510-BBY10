require('dotenv').config();

navigator.geolocation.getCurrentPosition(success, error);

function success(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
  getWeather(latitude, longitude);
}

function error() {
  console.error("Unable to retrieve your location");
}

function getWeather(lat, lon) {
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log("Weather Data:", data);
        const temp = data.main.temp;
        const description = data.weather[0].description;
        document.getElementById("weather").textContent = `Temperature: ${temp}°C, ${description}`;
        document.getElementById("cords").textContent = `Latitude: ${lat}, Longitude: ${lon}`;
    })
      .catch(err => console.error("Weather API error:", err));
  }
  