const getWeather = async (req, res) => {
    try {
        let cityInput = req.params.city || req.query.city || 'Karachi';
        
        // Extract city from "City, Country" format and trim
        const rawCity = cityInput.split(',')[0].trim();
        const displayCity = rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLowerCase();
        
        console.log(`🌤️ Live Weather requested for: "${displayCity}"`);

        let weatherData = null;

        // 1. Try OpenWeatherMap if key is available
        if (process.env.OPENWEATHER_API_KEY) {
            try {
                console.log(`📡 Querying OpenWeatherMap for ${displayCity}...`);
                const owmUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(displayCity)}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
                const response = await fetch(owmUrl);
                if (response.ok) {
                    const data = await response.json();
                    
                    // OpenWeatherMap does not return UV index in standard current weather API,
                    // we will estimate UV index based on clouds/temp as a backup, or pull from Open-Meteo.
                    weatherData = {
                        city: `${data.name}, ${data.sys.country}`,
                        temp: `${Math.round(data.main.temp)}°C`,
                        tempNum: Math.round(data.main.temp),
                        feelsLike: `${Math.round(data.main.feels_like)}°C`,
                        humidity: `${data.main.humidity}%`,
                        wind: `${Math.round(data.wind.speed * 3.6)} km/h`, // convert m/s to km/h
                        condition: data.weather[0]?.main || 'Clear',
                        uvVal: data.main.temp > 30 ? 8 : (data.main.temp > 20 ? 4 : 1) // basic estimation
                    };
                }
            } catch (owmError) {
                console.warn('⚠️ OpenWeatherMap failed, falling back to Open-Meteo:', owmError.message);
            }
        }

        // 2. Fallback or primary: Open-Meteo (Billing/Key-free API)
        if (!weatherData) {
            try {
                console.log(`📡 Querying Open-Meteo Geocoding for ${displayCity}...`);
                const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(displayCity)}&count=1&language=en&format=json`;
                const geoRes = await fetch(geoUrl);
                if (!geoRes.ok) throw new Error('Geocoding API failed');
                const geoData = await geoRes.json();

                if (!geoData.results || geoData.results.length === 0) {
                    throw new Error(`City "${displayCity}" not found`);
                }

                const location = geoData.results[0];
                const { latitude, longitude, name, country } = location;
                const fullLocationName = country ? `${name}, ${country}` : name;

                console.log(`📡 Querying Open-Meteo Forecast for [Lat: ${latitude}, Lon: ${longitude}]...`);
                const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=uv_index`;
                const forecastRes = await fetch(forecastUrl);
                if (!forecastRes.ok) throw new Error('Forecast API failed');
                
                const forecastData = await forecastRes.json();
                const current = forecastData.current;
                const currentHour = new Date().getHours();
                const uvVal = forecastData.hourly?.uv_index?.[currentHour] || 0;

                // Map Open-Meteo WMO Codes
                const mapWeatherCode = (code) => {
                    if (code === 0) return 'Sunny';
                    if (code >= 1 && code <= 3) return 'Cloudy';
                    if (code === 45 || code === 48) return 'Foggy';
                    if (code >= 51 && code <= 57) return 'Drizzle';
                    if (code >= 61 && code <= 67) return 'Rainy';
                    if (code >= 71 && code <= 77) return 'Snowy';
                    if (code >= 80 && code <= 82) return 'Showers';
                    if (code >= 85 && code <= 86) return 'Snow Showers';
                    if (code >= 95 && code <= 99) return 'Thunderstorm';
                    return 'Cloudy';
                };

                weatherData = {
                    city: fullLocationName,
                    temp: `${Math.round(current.temperature_2m)}°C`,
                    tempNum: Math.round(current.temperature_2m),
                    feelsLike: `${Math.round(current.apparent_temperature)}°C`,
                    humidity: `${current.relative_humidity_2m}%`,
                    wind: `${Math.round(current.wind_speed_10m)} km/h`,
                    condition: mapWeatherCode(current.weather_code),
                    uvVal: uvVal
                };
            } catch (meteoError) {
                console.error('❌ Open-Meteo weather fetch failed:', meteoError);
                return res.status(500).json({ message: 'Unable to fetch weather right now' });
            }
        }

        // Map UV Index to string Category
        let uvIndexCategory = 'Low';
        if (weatherData.uvVal >= 11) uvIndexCategory = 'Extreme';
        else if (weatherData.uvVal >= 8) uvIndexCategory = 'Very High';
        else if (weatherData.uvVal >= 6) uvIndexCategory = 'High';
        else if (weatherData.uvVal >= 3) uvIndexCategory = 'Moderate';

        let tip = '';
        let recommendation = '';

        // Category-specific messages matching design
        switch (uvIndexCategory) {
            case 'Extreme':
                tip = `Extreme UV in ${weatherData.city}`;
                recommendation = 'Major sun alert! Stay indoors and use SPF 50+ if out.';
                break;
            case 'Very High':
                tip = `Intense Sun in ${weatherData.city}`;
                recommendation = 'Strong sun today. Reapply sunscreen every 2 hours.';
                break;
            case 'High':
                tip = `High UV in ${weatherData.city}`;
                recommendation = 'Sun protection needed. Wear a hat and use SPF 30+.';
                break;
            case 'Moderate':
                tip = `Moderate UV in ${weatherData.city}`;
                recommendation = 'Sun is out but manageable. Use a light moisturizer with SPF.';
                break;
            case 'Low':
            default:
                if (weatherData.condition.includes('Cloudy') || weatherData.condition.includes('Rain') || weatherData.condition.includes('Overcast') || weatherData.condition.includes('Showers')) {
                    tip = `${weatherData.condition} in ${weatherData.city}`;
                    recommendation = 'Low UV today. Good for your skin, but keep it hydrated!';
                } else {
                    tip = `Gentle weather in ${weatherData.city}`;
                    recommendation = 'Low UV levels. Great for outdoor skin health!';
                }
                break;
        }

        res.json({
            city: weatherData.city, 
            temp: weatherData.temp,
            condition: weatherData.condition,
            uvIndex: uvIndexCategory,
            uvVal: weatherData.uvVal,
            feelsLike: weatherData.feelsLike,
            humidity: weatherData.humidity,
            wind: weatherData.wind,
            tip: tip,
            recommendation: recommendation,
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    } catch (error) {
        console.error('Weather error:', error);
        res.status(500).json({ message: 'Unable to fetch weather right now' });
    }
};

module.exports = { getWeather };
