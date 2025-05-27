import React, { useState, useEffect } from 'react';
import {
  WiDaySunny,
  WiRain,
  WiSnow,
  WiCloudy,
  WiThunderstorm,
  WiFog,
  WiHumidity,
  WiBarometer,
  WiStrongWind,
  WiThermometer
} from 'react-icons/wi';
import {
  IoSearch,
  IoLocationSharp,
  IoRefresh
} from 'react-icons/io5';
import './App.css';

// Klucz API z zmiennych środowiskowych
const apiKey = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;

// Definicja warunków pogodowych z logiką kolorów opartą zawsze na Celsjuszach
const getWeatherStyle = (weatherMain, tempCelsius) => {
  const baseConditions = {
    Thunderstorm: {
      title: 'Burza',
      subtitle: 'Uważaj na błyskawice!',
      icon: WiThunderstorm,
      color: 'linear-gradient(135deg, #2C3E50, #34495E)'
    },
    Drizzle: {
      title: 'Mżawka',
      subtitle: 'Lekkie opady',
      icon: WiRain,
      color: 'linear-gradient(135deg, #3498DB, #5DADE2)'
    },
    Rain: {
      title: 'Deszcz',
      subtitle: 'Weź parasol',
      icon: WiRain,
      color: 'linear-gradient(135deg, #2980B9, #3498DB)'
    },
    Snow: {
      title: 'Śnieg',
      subtitle: 'Ubierz się ciepło',
      icon: WiSnow,
      color: 'linear-gradient(135deg, #85C1E9, #AED6F1)'
    },
    Clear: {
      title: 'Słonecznie',
      subtitle: 'Idealna pogoda!',
      icon: WiDaySunny,
      color: tempCelsius > 25 ? 'linear-gradient(135deg, #F39C12, #E67E22)' : // Gorąco - pomarańczowy
        tempCelsius > 15 ? 'linear-gradient(135deg, #F4D03F, #F7DC6F)' : // Ciepło - żółty
          tempCelsius > 5 ? 'linear-gradient(135deg, #85C1E9, #AED6F1)' : // Chłodno - jasnoniebieski
            'linear-gradient(135deg, #5DADE2, #85C1E9)' // Zimno - niebieski
    },
    Clouds: {
      title: 'Pochmurno',
      subtitle: 'Może przejaśni się później',
      icon: WiCloudy,
      color: tempCelsius > 20 ? 'linear-gradient(135deg, #95A5A6, #BDC3C7)' : // Ciepło i pochmurnie
        tempCelsius > 10 ? 'linear-gradient(135deg, #7F8C8D, #95A5A6)' : // Umiarkowanie
          'linear-gradient(135deg, #5D6D7E, #85929E)' // Zimno i pochmurnie
    },
    Mist: {
      title: 'Mgła',
      subtitle: 'Uważaj na drodze',
      icon: WiFog,
      color: 'linear-gradient(135deg, #BDC3C7, #D5DBDB)'
    },
    Fog: {
      title: 'Mgła',
      subtitle: 'Uważaj na drodze',
      icon: WiFog,
      color: 'linear-gradient(135deg, #BDC3C7, #D5DBDB)'
    }
  };

  return baseConditions[weatherMain] || baseConditions.Clear;
};

// Domyślny gradient dla ekranu powitalnego
const defaultGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

function App() {
  // Stan podstawowy
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Stan dla funkcji dodatkowych
  const [unit, setUnit] = useState('metric'); // metric/imperial
  const [recentSearches, setRecentSearches] = useState([]);

  // Ładowanie ostatnich wyszukiwań z localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentWeatherSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Sprawdzenie klucza API
  useEffect(() => {
    if (!apiKey && hasSearched) {
      setError('Brak klucza API. Dodaj REACT_APP_OPENWEATHERMAP_API_KEY do pliku .env');
    }
  }, [hasSearched]);

  // Funkcja do zapisywania ostatnich wyszukiwań
  const saveToRecentSearches = (cityName) => {
    const updated = [cityName, ...recentSearches.filter(item => item !== cityName)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentWeatherSearches', JSON.stringify(updated));
  };

  // Główna funkcja pobierania pogody - zawsze w jednostkach metrycznych
  const getWeather = async (cityName = city, coordinates = null) => {
    if (!cityName?.trim() && !coordinates) {
      setError('Proszę wpisać nazwę miasta');
      return;
    }

    if (!apiKey) {
      setError('Brak klucza API. Zarejestruj się na OpenWeatherMap i dodaj klucz do .env');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      let url;
      if (coordinates) {
        // Zawsze pobieramy w jednostkach metrycznych (Celsjusz)
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}&units=metric&lang=pl`;
      } else {
        // Zawsze pobieramy w jednostkach metrycznych (Celsjusz)
        url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName.trim()}&appid=${apiKey}&units=metric&lang=pl`;
      }

      const response = await fetch(url);

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

      if (!data || !data.weather || data.weather.length === 0) {
        throw new Error('Nie udało się pobrać danych pogodowych.');
      }

      // Przekształcenie danych - wszystkie temperatury w Celsjuszach (oryginalnych z API)
      const transformedData = {
        city: data.name,
        country: data.sys.country,
        weather: {
          main: data.weather[0].main,
          description: data.weather[0].description,
          // Przechowujemy oryginalne temperatury w Celsjuszach
          temp_celsius: Math.round(data.main.temp),
          feels_like_celsius: Math.round(data.main.feels_like),
          temp_min_celsius: Math.round(data.main.temp_min),
          temp_max_celsius: Math.round(data.main.temp_max),
          pressure: data.main.pressure,
          humidity: data.main.humidity,
          wind: {
            speed_ms: data.wind.speed, // m/s
            deg: data.wind.deg
          },
          visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
          clouds: data.clouds.all
        },
        sys: {
          sunrise: new Date(data.sys.sunrise * 1000),
          sunset: new Date(data.sys.sunset * 1000)
        }
      };

      setWeatherData(transformedData);
      if (!coordinates && cityName) {
        saveToRecentSearches(cityName.trim());
      }
      setCity('');
    } catch (error) {
      console.error('Błąd:', error);
      setError(error.message || 'Wystąpił błąd podczas pobierania danych');
    } finally {
      setLoading(false);
    }
  };

  // Geolokalizacja
  const getLocationWeather = () => {
    if (!navigator.geolocation) {
      setError('Twoja przeglądarka nie wspiera geolokalizacji');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeather(null, { lat: latitude, lon: longitude });
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

  // Przełączanie jednostek - tylko zmiana wyświetlania, bez ponownego pobierania
  const toggleUnit = (newUnit) => {
    if (newUnit !== unit) {
      setUnit(newUnit);
      // Nie pobieramy ponownie danych - tylko zmieniamy jednostki wyświetlania
    }
  };

  // Funkcje konwersji temperatury
  const convertTemp = (tempCelsius, toUnit) => {
    if (toUnit === 'imperial') {
      return Math.round((tempCelsius * 9 / 5) + 32);
    }
    return tempCelsius;
  };

  const convertSpeed = (speedMs, toUnit) => {
    if (toUnit === 'imperial') {
      return Math.round(speedMs * 2.237); // m/s to mph
    }
    return speedMs;
  };

  // Obsługa klawisza Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      getWeather();
    }
  };

  // Formatowanie jednostek
  const getTemperatureUnit = () => unit === 'metric' ? '°C' : '°F';
  const getSpeedUnit = () => unit === 'metric' ? 'm/s' : 'mph';

  // Formatowanie czasu
  const formatTime = (date) => {
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Określenie stylu na podstawie pogody i temperatury (zawsze w Celsjuszach)
  const condition = weatherData && weatherData.weather
    ? getWeatherStyle(weatherData.weather.main, weatherData.weather.temp_celsius)
    : null;

  const backgroundStyle = {
    background: condition ? condition.color : defaultGradient
  };

  // Funkcje do wyświetlania temperatury w odpowiednich jednostkach
  const displayTemp = (tempCelsius) => convertTemp(tempCelsius, unit);
  const displaySpeed = (speedMs) => convertSpeed(speedMs, unit);

  // Auto-ukrywanie komunikatów
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="App" style={backgroundStyle}>
      <div className="header">
        <h1>Prognoza Pogody</h1>
        <p>Sprawdź aktualną pogodę w dowolnym miejscu na świecie</p>
      </div>

      {/* Ekran powitalny - pokazuje się tylko gdy nie ma danych i nie wyszukiwano */}
      {!weatherData && !hasSearched && (
        <div className="welcome-screen">
          <div className="welcome-icon">
            🌍
          </div>
          <h2>Witaj w aplikacji pogodowej!</h2>
          <p>
            Poznaj aktualną pogodę w swoim mieście lub dowolnym miejscu na świecie.
            Wyszukaj miasto lub użyj swojej lokalizacji.
          </p>
        </div>
      )}

      {/* Kontener wyszukiwania */}
      <div className="search-container">
        <div className="search-main">
          <div className="input-wrapper">
            <IoSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Wpisz nazwę miasta..."
              disabled={loading}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => getWeather()}
            disabled={loading}
          >
            {loading ? <IoRefresh className="loading-spinner" /> : 'Szukaj'}
          </button>
        </div>

        <button
          className="btn btn-location"
          onClick={getLocationWeather}
          disabled={loading}
        >
          <IoLocationSharp />
          Użyj mojej lokalizacji
        </button>

        {/* Kontrolki jednostek */}
        <div className="controls-row">
          <button
            className={`unit-toggle ${unit === 'metric' ? 'active' : ''}`}
            onClick={() => toggleUnit('metric')}
          >
            Celsjusz
          </button>
          <button
            className={`unit-toggle ${unit === 'imperial' ? 'active' : ''}`}
            onClick={() => toggleUnit('imperial')}
          >
            Fahrenheit
          </button>
        </div>

        {/* Ostatnie wyszukiwania */}
        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <h4>Ostatnie wyszukiwania</h4>
            <div className="recent-items">
              {recentSearches.map((item, index) => (
                <span
                  key={index}
                  className="recent-item"
                  onClick={() => getWeather(item)}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Komunikaty o błędach */}
      {error && (
        <div className="status-message error">
          ⚠️ {error}
        </div>
      )}

      {/* Komunikat ładowania */}
      {loading && (
        <div className="status-message loading">
          <IoRefresh className="loading-spinner" />
          Pobieranie danych pogodowych...
        </div>
      )}

      {/* Karta pogodowa */}
      {weatherData && weatherData.weather && !loading && (
        <div className="weather-card">
          <div className="weather-header">
            <h2>{weatherData.city}, {weatherData.country}</h2>
          </div>

          <div className="weather-main">
            <div className="weather-icon-large">
              {React.createElement(condition.icon, { size: 120 })}
            </div>
            <div className="weather-temp">
              <div className="temp-main">
                {displayTemp(weatherData.weather.temp_celsius)}{getTemperatureUnit()}
              </div>
              <div className="temp-description">
                {weatherData.weather.description}
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.8, marginTop: '0.5rem' }}>
                Odczuwalna: {displayTemp(weatherData.weather.feels_like_celsius)}{getTemperatureUnit()}
              </div>
            </div>
          </div>

          <div className="weather-details">
            <div className="detail-card">
              <div className="detail-icon">
                <WiThermometer />
              </div>
              <div className="detail-label">Min/Max</div>
              <div className="detail-value">
                {displayTemp(weatherData.weather.temp_min_celsius)}° / {displayTemp(weatherData.weather.temp_max_celsius)}°
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <WiHumidity />
              </div>
              <div className="detail-label">Wilgotność</div>
              <div className="detail-value">
                {weatherData.weather.humidity}%
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <WiBarometer />
              </div>
              <div className="detail-label">Ciśnienie</div>
              <div className="detail-value">
                {weatherData.weather.pressure} hPa
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <WiStrongWind />
              </div>
              <div className="detail-label">Wiatr</div>
              <div className="detail-value">
                {displaySpeed(weatherData.weather.wind.speed_ms)} {getSpeedUnit()}
              </div>
            </div>

            {weatherData.weather.visibility && (
              <div className="detail-card">
                <div className="detail-icon">👁️</div>
                <div className="detail-label">Widoczność</div>
                <div className="detail-value">
                  {weatherData.weather.visibility} km
                </div>
              </div>
            )}

            <div className="detail-card">
              <div className="detail-icon">☁️</div>
              <div className="detail-label">Zachmurzenie</div>
              <div className="detail-value">
                {weatherData.weather.clouds}%
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">🌅</div>
              <div className="detail-label">Wschód słońca</div>
              <div className="detail-value">
                {formatTime(weatherData.sys.sunrise)}
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">🌇</div>
              <div className="detail-label">Zachód słońca</div>
              <div className="detail-value">
                {formatTime(weatherData.sys.sunset)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;