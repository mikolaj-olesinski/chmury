import React, { useState, useEffect } from 'react';
import { WiDaySunny, WiRain, WiSnow, WiCloudy, WiThunderstorm, WiFog } from 'react-icons/wi';
import './App.css';

// URL naszego lokalnego API
const API_URL = 'http://localhost:3000';

// Definicja warunków pogodowych i odpowiadających im stylów/ikon
const weatherConditions = {
  Thunderstorm: {
    color: '#616161',
    title: 'Burza',
    subtitle: 'Uważaj na błyskawice!',
    icon: <WiThunderstorm size={64} />
  },
  Drizzle: {
    color: '#0044CC',
    title: 'Mżawka',
    subtitle: 'Lekkie opady',
    icon: <WiRain size={64} />
  },
  Rain: {
    color: '#005BEA',
    title: 'Deszcz',
    subtitle: 'Weź parasol',
    icon: <WiRain size={64} />
  },
  Snow: {
    color: '#00d2ff',
    title: 'Śnieg',
    subtitle: 'Ubierz się ciepło',
    icon: <WiSnow size={64} />
  },
  Clear: {
    color: '#f7b733',
    title: 'Słonecznie',
    subtitle: 'Idealna pogoda!',
    icon: <WiDaySunny size={64} />
  },
  Clouds: {
    color: '#1F1C2C',
    title: 'Pochmurno',
    subtitle: 'Może przejaśni się później',
    icon: <WiCloudy size={64} />
  },
  Mist: {
    color: '#3CD3AD',
    title: 'Mgła',
    subtitle: 'Uważaj na drodze',
    icon: <WiFog size={64} />
  }
};

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [cities, setCities] = useState([]);

  // Pobierz listę dostępnych miast przy pierwszym renderowaniu
  useEffect(() => {
    fetch(`${API_URL}/weather`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Błąd HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setCities(data);
      })
      .catch(error => {
        console.error('Błąd:', error);
      });
  }, []);

  // Funkcja do pobierania danych pogodowych z lokalnego API
  const getWeather = async () => {
    if (!city.trim()) {
      alert('Proszę wpisać nazwę miasta');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/weather/${city.trim()}`);

      if (!response.ok) {
        throw new Error(`Nie znaleziono miasta: ${response.status}`);
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Błąd:', error);
      alert(error.message || 'Wystąpił błąd podczas pobierania danych');
    }
  };

  // Dodawanie nowych danych pogodowych
  const addWeatherData = async () => {
    const newWeatherData = {
      city: "Nowe Miasto",
      country: "PL",
      weather: {
        main: "Clear",
        description: "bezchmurnie",
        temp: 24.5,
        pressure: 1012,
        humidity: 40,
        wind: { speed: 2.5 }
      }
    };

    try {
      const response = await fetch(`${API_URL}/weather`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWeatherData)
      });

      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }

      const data = await response.json();
      alert(`Dodano dane pogodowe dla miasta: ${data.city}`);
      
      // Odśwież listę miast
      const citiesResponse = await fetch(`${API_URL}/weather`);
      const citiesData = await citiesResponse.json();
      setCities(citiesData);
    } catch (error) {
      console.error('Błąd:', error);
      alert(error.message || 'Wystąpił błąd podczas dodawania danych');
    }
  };

  // Określenie stylu i ikon na podstawie warunków pogodowych
  const condition = weatherData && weatherData.weather
    ? weatherConditions[weatherData.weather.main] || weatherConditions.Clear
    : weatherConditions.Clear;

  return (
    <div className="App" style={{ backgroundColor: condition.color }}>
      <h1>{condition.title}</h1>
      <h2>{condition.subtitle}</h2>
      
      <div className="search-container">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Wpisz nazwę miasta"
        />
        <button onClick={getWeather}>Sprawdź pogodę</button>
        <button onClick={addWeatherData}>Dodaj przykładowe miasto</button>
      </div>
      
      <div className="cities-list">
        <h3>Dostępne miasta:</h3>
        <ul>
          {cities.map(city => (
            <li key={city.id} onClick={() => {
              setCity(city.city);
              setWeatherData(city);
            }}>
              {city.city}, {city.country}
            </li>
          ))}
        </ul>
      </div>
      
      {weatherData && weatherData.weather && (
        <div id="weatherInfo">
          <h2>{weatherData.city}, {weatherData.country}</h2>
          <p className="weather-icon">{condition.icon} {weatherData.weather.description}</p>
          <p>Temperatura: {weatherData.weather.temp}°C</p>
          <p>Ciśnienie: {weatherData.weather.pressure} hPa</p>
          <p>Wilgotność: {weatherData.weather.humidity}%</p>
          <p>Prędkość wiatru: {weatherData.weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  );
}

export default App;