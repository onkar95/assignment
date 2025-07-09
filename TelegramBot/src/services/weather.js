const axios = require('axios');
const { getSettings } = require('../database/database');

// Get weather data from API
const getWeatherData = async (location) => {
    try {
        const settings = await getSettings();
        const apiKey = settings.weather_api_key;

        if (!apiKey || apiKey === 'YOUR_WEATHER_API_KEY') {
            console.error('Weather API key not set');
            return null;
        }

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        return null;
    }
};

// Format weather message
const formatWeatherMessage = (data) => {
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const city = data.name;
    const country = data.sys.country;

    return `
🌤️ Weather in ${city}, ${country}

🌡️ Temperature: ${temp}°C (feels like ${feelsLike}°C)
☁️ Condition: ${description}
💧 Humidity: ${humidity}%
    `;
};

module.exports = {
    getWeatherData,
    formatWeatherMessage
};