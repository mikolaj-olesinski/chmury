import React, { useState, useEffect } from 'react';
import './App.css';

// Klucz API z zmiennych środowiskowych
const apiKey = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;

// Definicja warunków pogodowych i odpowiadających im stylów/ikon
const weatherConditions = {
  Thunderstorm: {
    color: 'linear-gradient(135deg, #616161, #9E9E9E)',
    title: 'Burza',
    subtitle: 'Uważaj na błyskawice!',
    icon: '⛈️'
  },
  Drizzle: {
    color: 'linear-gradient(135deg, #0044CC, #1976D2)',
    title: 'Mżawka',
    subtitle: 'Lekkie opady',
    icon: '🌦️'
  },
  Rain: {
    color: 'linear-gradient(135deg, #005BEA, #1E88E5)',
    title: 'Deszcz',
    subtitle: 'Weź parasol',
    icon: '🌧️'
  },
  Snow: {
    color: 'linear-gradient(135deg, #00d2ff, #3A8EFF)',
    title: 'Śnieg',
    subtitle: 'Ubierz się ciepło',
    icon: '❄️'
  },
  Clear: {
    color: 'linear-gradient(135deg, #f7b733, #fc4a1a)',
    title: 'Słonecznie',
    subtitle: 'Idealna pogoda!',
    icon: '☀️'
  },
  Clouds: {
    color: 'linear-gradient(135deg, #1F1C2C, #928DAB)',
    title: 'Pochmurno',
    subtitle: 'Może przejaśni się później',
    icon: '☁️'
  },
  Mist: {
    color: 'linear-gradient(135deg, #3CD3AD, #4CB8C4)',
    title: 'Mgła',
    subtitle: 'Uważaj na drodze',
    icon: '🌫️'
  },
  Fog: {
    color: 'linear-gradient(135deg, #3CD3AD, #4CB8C4)',
    title: 'Mgła',
    subtitle: 'Uważaj na drodze',
    icon: '🌫️'
  }
};

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sprawdzenie czy klucz API jest dostępny
  useEffect(() => {
    if (!apiKey) {
      setError('Brak klucza API. Dodaj REACT_APP_OPENWEATHERMAP_API_KEY do pliku .env');
    }
  }, []);

  // Funkcja do pobierania danych pogodowych z OpenWeatherMap API
  const getWeather = async (cityName = city) => {
    if (!cityName.trim()) {
      alert('Proszę wpisać nazwę miasta');
      return;
    }

    if (!apiKey) {
      setError('Brak klucza API. Zarejestruj się na OpenWeatherMap i dodaj klucz do .env');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName.trim()}&appid=${apiKey}&units=metric&lang=pl`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Nie znaleziono miasta. Sprawdź pisownię.');
        } else if (response.status === 401) {
          throw new Error('Nieprawidłowy klucz API.');
        } else {
          throw new Error(`Błąd HTTP: ${response.status}`);
        }
      }

      const data = await response.json();

      // Sprawdzenie, czy dane pogodowe są poprawne
      if (!data || !data.weather || data.weather.length === 0) {
        throw new Error('Nie udało się pobrać danych pogodowych.');
      }

      // Przekształcenie danych do naszego formatu
      const transformedData = {
        city: data.name,
        country: data.sys.country,
        weather: {
          main: data.weather[0].main,
          description: data.weather[0].description,
          temp: Math.round(data.main.temp),
          pressure: data.main.pressure,
          humidity: data.main.humidity,
          wind: { speed: data.wind.speed }
        }
      };

      setWeatherData(transformedData);
      setCity(''); // Wyczyść pole input
    } catch (error) {
      console.error('Błąd:', error);
      setError(error.message || 'Wystąpił błąd podczas pobierania danych');
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do pobierania pogody na podstawie geolokalizacji
  const getLocationWeather = () => {
    if (!navigator.geolocation) {
      alert('Twoja przeglądarka nie wspiera geolokalizacji');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pl`
          );

          if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status}`);
          }

          const data = await response.json();

          const transformedData = {
            city: data.name,
            country: data.sys.country,
            weather: {
              main: data.weather[0].main,
              description: data.weather[0].description,
              temp: Math.round(data.main.temp),
              pressure: data.main.pressure,
              humidity: data.main.humidity,
              wind: { speed: data.wind.speed }
            }
          };

          setWeatherData(transformedData);
        } catch (error) {
          console.error('Błąd:', error);
          setError(error.message || 'Wystąpił błąd podczas pobierania danych');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setError('Aby pobrać pogodę dla Twojej lokalizacji, musisz zezwolić na dostęp do lokalizacji.');
        } else {
          setError(`Błąd geolokalizacji: ${error.message}`);
        }
      }
    );
  };

  // Obsługa klawisza Enter w polu input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      getWeather();
    }
  };

  // Określenie stylu i ikon na podstawie warunków pogodowych
  const condition = weatherData && weatherData.weather
    ? weatherConditions[weatherData.weather.main] || weatherConditions.Clear
    : weatherConditions.Clear;

  return (
    <div className="App" style={{ background: condition.color }}>
      <h1>{condition.title}</h1>
      <h2>{condition.subtitle}</h2>

      <div className="search-container">
        <div className="input-button-row">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Wpisz nazwę miasta"
            disabled={loading}
          />
          <button onClick={() => getWeather()} disabled={loading}>
            {loading ? 'Ładowanie...' : 'Sprawdź pogodę'}
          </button>
        </div>
        <button
          className="location-btn"
          onClick={getLocationWeather}
          disabled={loading}
        >
          📍 Użyj mojej lokalizacji
        </button>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          Pobieranie danych pogodowych...
        </div>
      )}

      {weatherData && weatherData.weather && !loading && (
        <div id="weatherInfo">
          <h2>{weatherData.city}, {weatherData.country}</h2>
          <div className="weather-icon">
            <span>{condition.icon}</span>
            <span>{weatherData.weather.description}</span>
          </div>
          <div className="weather-details">
            <p><strong>Temperatura:</strong> {weatherData.weather.temp}°C</p>
            <p><strong>Ciśnienie:</strong> {weatherData.weather.pressure} hPa</p>
            <p><strong>Wilgotność:</strong> {weatherData.weather.humidity}%</p>
            <p><strong>Prędkość wiatru:</strong> {weatherData.weather.wind.speed} m/s</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;