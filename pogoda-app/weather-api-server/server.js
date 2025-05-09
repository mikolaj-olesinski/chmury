// Importujemy Express
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware do obsługi JSON i CORS
app.use(express.json());
app.use(cors());

// Dane - lista miast i ich pogody
const weatherData = [
  { 
    id: 1, 
    city: "Warszawa", 
    country: "PL",
    weather: {
      main: "Clear",
      description: "bezchmurnie",
      temp: 22.5,
      pressure: 1013,
      humidity: 45,
      wind: { speed: 3.2 }
    }
  },
  { 
    id: 2, 
    city: "Kraków", 
    country: "PL",
    weather: {
      main: "Clouds",
      description: "pochmurno",
      temp: 20.1,
      pressure: 1015,
      humidity: 60,
      wind: { speed: 2.8 }
    }
  },
  { 
    id: 3, 
    city: "Gdańsk", 
    country: "PL",
    weather: {
      main: "Rain",
      description: "lekki deszcz",
      temp: 17.8,
      pressure: 1009,
      humidity: 75,
      wind: { speed: 5.1 }
    }
  }
];

// Endpoint do pobierania wszystkich danych pogodowych
app.get('/weather', (req, res) => {
  res.json(weatherData);
});

// Endpoint do pobierania pogody dla konkretnego miasta
app.get('/weather/:city', (req, res) => {
  const city = req.params.city.toLowerCase();
  const cityData = weatherData.find(data => data.city.toLowerCase() === city);

  if (cityData) {
    res.json(cityData);
  } else {
    res.status(404).json({ message: "Nie znaleziono danych pogodowych dla tego miasta." });
  }
});

// Endpoint do dodawania nowych danych pogodowych
app.post('/weather', (req, res) => {
  const { city, country, weather } = req.body;
  
  if (!city || !country || !weather || !weather.main || !weather.temp) {
    return res.status(400).json({ message: "Brak wymaganych danych." });
  }
  
  const newWeatherData = { 
    id: weatherData.length + 1, 
    city, 
    country, 
    weather 
  };
  
  weatherData.push(newWeatherData);
  res.status(201).json(newWeatherData);
});

// Endpoint do aktualizacji danych pogodowych
app.put('/weather/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { weather } = req.body;
  
  const weatherItem = weatherData.find(item => item.id === id);
  
  if (!weatherItem) {
    return res.status(404).json({ message: "Dane pogodowe nie znalezione." });
  }
  
  if (weather) weatherItem.weather = { ...weatherItem.weather, ...weather };
  
  res.json(weatherItem);
});

// Endpoint do usuwania danych pogodowych
app.delete('/weather/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = weatherData.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: "Dane pogodowe nie znalezione." });
  }
  
  weatherData.splice(index, 1);
  res.json({ message: "Dane pogodowe usunięte." });
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Serwer REST API działa na http://localhost:${port}`);
});