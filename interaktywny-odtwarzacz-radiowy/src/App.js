import React, { useEffect, useState } from 'react';
import RadioPlayer from './RadioPlayer';
import PrivacyPopup from './PrivacyPopup';
import './App.css';

// Komponent animowanego tła
const BackgroundAnimation = () => {
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.width = particle.style.height = Math.random() * 10 + 5 + 'px';
      particle.style.animationDuration = Math.random() * 10 + 10 + 's';
      particle.style.animationDelay = Math.random() * 5 + 's';

      const container = document.querySelector('.background-animation');
      if (container) {
        container.appendChild(particle);

        setTimeout(() => {
          if (particle.parentNode) {
            particle.remove();
          }
        }, 20000);
      }
    };

    const interval = setInterval(createParticle, 3000);

    // Utwórz kilka początkowych cząsteczek
    for (let i = 0; i < 5; i++) {
      setTimeout(createParticle, i * 1000);
    }

    return () => clearInterval(interval);
  }, []);

  return <div className="background-animation"></div>;
};

function App() {
  const [worldClocks, setWorldClocks] = useState({});
  const [sessionStats, setSessionStats] = useState({
    startTime: new Date(),
    stationsChanged: 0,
    totalListeningTime: 0,
    favoriteGenre: null,
    genreStats: {}
  });
  const [browserInfo, setBrowserInfo] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState(null); // Dodane dla miasta/kraju
  const [locationStatus, setLocationStatus] = useState('checking'); // 'checking', 'success', 'denied', 'unavailable', 'timeout', 'disabled'
  const [locationError, setLocationError] = useState(null);
  const [locationPermissionState, setLocationPermissionState] = useState('prompt'); // 'granted', 'denied', 'prompt'

  // Aktualizacja zegarów światowych
  useEffect(() => {
    const updateWorldClocks = () => {
      const now = new Date();
      const timezones = {
        'Warszawa': 'Europe/Warsaw',
        'Londyn': 'Europe/London',
        'Nowy Jork': 'America/New_York',
        'Los Angeles': 'America/Los_Angeles',
        'Tokio': 'Asia/Tokyo',
        'Sydney': 'Australia/Sydney'
      };

      const clocks = {};
      Object.entries(timezones).forEach(([city, timezone]) => {
        try {
          clocks[city] = {
            time: now.toLocaleTimeString('pl-PL', {
              timeZone: timezone,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }),
            date: now.toLocaleDateString('pl-PL', {
              timeZone: timezone,
              day: 'numeric',
              month: 'short'
            }),
            timezone: timezone
          };
        } catch (error) {
          clocks[city] = {
            time: 'Błąd',
            date: 'Błąd',
            timezone: timezone
          };
        }
      });
      setWorldClocks(clocks);
    };

    updateWorldClocks();
    const timer = setInterval(updateWorldClocks, 1000);
    return () => clearInterval(timer);
  }, []);

  // Aktualizacja statystyk sesji
  useEffect(() => {
    const updateSessionStats = () => {
      setSessionStats(prev => ({
        ...prev,
        totalListeningTime: Math.floor((new Date() - prev.startTime) / 1000)
      }));
    };

    const timer = setInterval(updateSessionStats, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sprawdź stan uprawnień do geolokalizacji
  const checkGeolocationPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermissionState(result.state);

        result.addEventListener('change', () => {
          setLocationPermissionState(result.state);
        });

        return result.state;
      } catch (error) {
        console.warn('Nie można sprawdzić uprawnień do geolokalizacji:', error);
        return 'prompt';
      }
    }
    return 'prompt';
  };

  // Funkcja do reverse geocoding (pobranie miasta/kraju z współrzędnych)
  const getLocationAddress = async (latitude, longitude) => {
    try {
      // Używamy darmowego API BigDataCloud do reverse geocoding
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pl`
      );

      if (response.ok) {
        const data = await response.json();
        setLocationAddress({
          city: data.city || data.locality || data.principalSubdivision || 'Nieznane miasto',
          country: data.countryName || 'Nieznany kraj',
          countryCode: data.countryCode || '',
          region: data.principalSubdivision || '',
          locality: data.locality || ''
        });
      } else {
        console.warn('Nie udało się pobrać adresu dla lokalizacji');
        setLocationAddress({
          city: 'Nieznane miasto',
          country: 'Nieznany kraj',
          countryCode: '',
          region: '',
          locality: ''
        });
      }
    } catch (error) {
      console.error('Błąd podczas reverse geocoding:', error);
      setLocationAddress({
        city: 'Nieznane miasto',
        country: 'Nieznany kraj',
        countryCode: '',
        region: '',
        locality: ''
      });
    }
  };
  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setLocationError('Geolokalizacja nie jest obsługiwana przez tę przeglądarkę.');
      return;
    }

    // Sprawdź najpierw uprawnienia
    const permissionState = await checkGeolocationPermission();

    if (permissionState === 'denied') {
      setLocationStatus('denied');
      setLocationError('Uprawnienia do lokalizacji zostały odrzucone. Włącz je w ustawieniach przeglądarki.');
      return;
    }

    setLocationStatus('checking');
    setLocationError(null);

    const options = {
      enableHighAccuracy: false, // Wyłącz wysoką dokładność dla szybszego odpytania
      timeout: 5000, // Skrócony timeout do 5 sekund
      maximumAge: 300000 // 5 minut cache (skrócony z 10 minut)
    };

    navigator.geolocation.getCurrentPosition(
      // Success callback
      async (position) => {
        const coords = position.coords;
        const locationData = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          altitude: coords.altitude,
          altitudeAccuracy: coords.altitudeAccuracy,
          heading: coords.heading,
          speed: coords.speed,
          timestamp: new Date(position.timestamp)
        };

        setLocation(locationData);
        setLocationStatus('success');
        setLocationError(null);
        console.log('Lokalizacja pobrana pomyślnie:', coords);

        // Pobierz miasto i kraj
        await getLocationAddress(coords.latitude, coords.longitude);
      },
      // Error callback
      (error) => {
        console.warn('Błąd geolokalizacji:', error);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus('denied');
            setLocationError('Dostęp do lokalizacji został odrzucony. Sprawdź ustawienia przeglądarki.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationStatus('unavailable');
            setLocationError('Lokalizacja jest obecnie niedostępna. Sprawdź połączenie internetowe.');
            break;
          case error.TIMEOUT:
            setLocationStatus('timeout');
            setLocationError('Przekroczono limit czasu pobierania lokalizacji.');
            break;
          default:
            setLocationStatus('unavailable');
            setLocationError(`Nieznany błąd lokalizacji: ${error.message}`);
            break;
        }
      },
      options
    );
  };

  // Wyłącz sprawdzanie lokalizacji
  const disableLocationTracking = () => {
    setLocationStatus('disabled');
    setLocation(null);
    setLocationAddress(null);
    setLocationError('Lokalizacja została wyłączona przez użytkownika.');
  };

  // Funkcja do aktualizacji statystyk
  const updateStats = (genre, action) => {
    setSessionStats(prev => {
      const newGenreStats = { ...prev.genreStats };
      if (!newGenreStats[genre]) {
        newGenreStats[genre] = 0;
      }

      if (action === 'change') {
        newGenreStats[genre]++;

        // Znajdź ulubiony gatunek
        const favoriteGenre = Object.entries(newGenreStats)
          .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

        return {
          ...prev,
          stationsChanged: prev.stationsChanged + 1,
          genreStats: newGenreStats,
          favoriteGenre
        };
      }

      return prev;
    });
  };

  useEffect(() => {
    // Pobieranie informacji o przeglądarce
    setBrowserInfo({
      appName: navigator.appName,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      vendor: navigator.vendor || 'Nieznany',
      javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
      protocol: window.location.protocol,
      isSecure: window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1',
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1
    });

    // Pobieranie informacji o sieci (jeśli dostępne)
    if (navigator.connection) {
      const connection = navigator.connection;
      setNetworkInfo({
        type: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      });
    }

    // Automatyczne sprawdzenie lokalizacji po załadowaniu
    const initLocationCheck = async () => {
      const permissionState = await checkGeolocationPermission();

      if (permissionState === 'granted') {
        // Jeśli uprawnienia już są przyznane, pobierz lokalizację automatycznie
        requestLocation();
      } else if (permissionState === 'denied') {
        setLocationStatus('denied');
        setLocationError('Uprawnienia do lokalizacji zostały wcześniej odrzucone.');
      } else {
        // Dla 'prompt' nie rób nic automatycznie - czekaj na akcję użytkownika
        setLocationStatus('prompt');
        setLocationError(null);
      }
    };

    initLocationCheck();
  }, []);

  // Formatowanie czasu
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="app">
      <BackgroundAnimation />

      <header className="header">
        <h1>
          <i className="fas fa-broadcast-tower"></i> Radio Internetowe
        </h1>
        <div className="subtitle">Twoja muzyczna podróż w chmurze</div>
      </header>

      <main className="main-content">
        <RadioPlayer onStatsUpdate={updateStats} />

        <div className="info-grid">
          {/* Zegary światowe + lokalizacja */}
          <div className="info-section">
            <h3>
              <i className="fas fa-globe-americas"></i> Czas Światowy & Lokalizacja
            </h3>

            {/* Sekcja lokalizacji */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>

              {locationStatus === 'prompt' && (
                <div style={{ textAlign: 'center', padding: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                    <i className="fas fa-map-marker-alt" style={{ color: '#667eea' }}></i>
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Udostępnij lokalizację</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
                    Pozwól na dostęp do lokalizacji, aby zobaczyć swoje współrzędne
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      onClick={requestLocation}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <i className="fas fa-location-arrow"></i>
                      Pobierz lokalizację
                    </button>
                    <button
                      onClick={disableLocationTracking}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <i className="fas fa-times"></i>
                      Pomiń
                    </button>
                  </div>
                </div>
              )}

              {locationStatus === 'checking' && (
                <div style={{ textAlign: 'center', padding: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <i className="fas fa-spinner fa-spin location-checking"></i>
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Pobieranie lokalizacji...</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    Sprawdzamy Twoje położenie i miasto
                  </div>
                </div>
              )}

              {locationStatus === 'success' && location && (
                <div className="location-info-box location-success-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <i className="fas fa-map-marker-alt location-success"></i>
                    <strong className="location-success">Twoja pozycja</strong>
                  </div>

                  {/* Miasto i kraj */}
                  {locationAddress && (
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.95)', marginBottom: '0.5rem' }}>
                      <strong>🏙️ {locationAddress.city}, {locationAddress.country}</strong>
                      {locationAddress.region && locationAddress.region !== locationAddress.city && (
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                          {locationAddress.region}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Współrzędne */}
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                    <strong>📍 {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°</strong>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.3rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      Dokładność: ±{Math.round(location.accuracy)}m
                      {location.altitude && ` • Wysokość: ${Math.round(location.altitude)}m`}
                    </div>
                    <div style={{ fontSize: '0.7rem', marginTop: '0.3rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      Pobrano: {location.timestamp.toLocaleTimeString('pl-PL')}
                    </div>
                  </div>
                </div>
              )}

              {(locationStatus === 'denied' || locationStatus === 'unavailable' || locationStatus === 'timeout') && (
                <div>
                  <div className="location-info-box location-warning-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <i className="fas fa-exclamation-triangle location-warning"></i>
                      <strong style={{ fontSize: '0.85rem' }}>Lokalizacja niedostępna</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                      {locationError}
                    </div>

                    {locationStatus === 'denied' && (
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
                        💡 Aby włączyć lokalizację: kliknij ikonę 🛡️ w pasku adresu przeglądarki
                      </div>
                    )}
                  </div>

                  <button
                    onClick={requestLocation}
                    style={{
                      width: '100%',
                      background: 'rgba(102, 126, 234, 0.2)',
                      border: '1px solid rgba(102, 126, 234, 0.4)',
                      color: '#667eea',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      transition: 'all 0.3s ease',
                      marginTop: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(102, 126, 234, 0.3)';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(102, 126, 234, 0.2)';
                      e.target.style.color = '#667eea';
                    }}
                  >
                    <i className="fas fa-redo"></i>
                    Spróbuj ponownie
                  </button>
                </div>
              )}

              {locationStatus === 'disabled' && (
                <div className="location-info-box location-info-box-secondary">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <i className="fas fa-location-slash" style={{ color: '#6b7280' }}></i>
                    <strong style={{ fontSize: '0.85rem' }}>Lokalizacja wyłączona</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    Lokalizacja została wyłączona na Twoje życzenie
                  </div>
                  <button
                    onClick={() => {
                      setLocationStatus('prompt');
                      setLocationError(null);
                      setLocationAddress(null);
                    }}
                    style={{
                      width: '100%',
                      background: 'rgba(102, 126, 234, 0.2)',
                      border: '1px solid rgba(102, 126, 234, 0.4)',
                      color: '#667eea',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      marginTop: '0.5rem'
                    }}
                  >
                    <i className="fas fa-location-arrow"></i>
                    Włącz ponownie
                  </button>
                </div>
              )}
            </div>

            {/* Zegary światowe */}
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              {Object.entries(worldClocks).map(([city, timeData]) => (
                <div key={city} className="world-clock-item">
                  <div>
                    <div className="world-clock-city">{city}</div>
                    <div className="world-clock-date">
                      {timeData.date}
                    </div>
                  </div>
                  <div className="world-clock-time">
                    {timeData.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statystyki sesji */}
          <div className="info-section">
            <h3>
              <i className="fas fa-chart-line"></i> Statystyki Sesji
            </h3>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <div style={{
                padding: '0.8rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div className="stats-big-number">
                  {formatTime(sessionStats.totalListeningTime)}
                </div>
                <div className="stats-label">
                  Czas słuchania
                </div>
              </div>

              <div className="system-info-grid">
                <div style={{
                  padding: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div className="stats-small-number" style={{ color: '#4ade80' }}>
                    {sessionStats.stationsChanged}
                  </div>
                  <div className="stats-small-label">
                    Zmiany stacji
                  </div>
                </div>

                <div style={{
                  padding: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div className="stats-small-number" style={{ color: '#f59e0b' }}>
                    {Object.keys(sessionStats.genreStats).length}
                  </div>
                  <div className="stats-small-label">
                    Gatunki
                  </div>
                </div>
              </div>

              {sessionStats.favoriteGenre && (
                <div className="favorite-genre-box">
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    🎵 Ulubiony gatunek
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#667eea' }}>
                    {sessionStats.favoriteGenre}
                  </div>
                  <div className="stats-small-label">
                    {sessionStats.genreStats[sessionStats.favoriteGenre]} słuchań
                  </div>
                </div>
              )}

              <div className="session-start-info">
                <i className="fas fa-clock"></i> Sesja rozpoczęta: {sessionStats.startTime.toLocaleTimeString('pl-PL')}
              </div>
            </div>
          </div>

          {/* Sekcja informacji o przeglądarce i sieci */}
          {browserInfo && (
            <div className="info-section">
              <h3>
                <i className="fas fa-desktop"></i> Informacje Systemowe
              </h3>
              <div style={{ display: 'grid', gap: '0.6rem' }}>
                <p><strong>Przeglądarka:</strong> {browserInfo.appName}</p>
                <p><strong>System:</strong> {browserInfo.platform}</p>
                <p><strong>Język:</strong> {browserInfo.language}</p>
                <p><strong>Dostawca:</strong> {browserInfo.vendor}</p>
                <p><strong>Rozdzielczość:</strong> {browserInfo.screenResolution}</p>
                <p><strong>Głębia kolorów:</strong> {browserInfo.colorDepth} bit</p>
                <p><strong>Pixel Ratio:</strong> {browserInfo.pixelRatio}x</p>

                <div className="system-info-grid">
                  <div className="system-info-item" style={{
                    background: browserInfo.cookieEnabled ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)'
                  }}>
                    <strong>Cookies:</strong><br />
                    <span style={{ color: browserInfo.cookieEnabled ? '#4ade80' : '#f87171' }}>
                      {browserInfo.cookieEnabled ? '✓ Włączone' : '✗ Wyłączone'}
                    </span>
                  </div>

                  <div className="system-info-item" style={{
                    background: browserInfo.onLine ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)'
                  }}>
                    <strong>Status:</strong><br />
                    <span style={{ color: browserInfo.onLine ? '#4ade80' : '#f87171' }}>
                      {browserInfo.onLine ? '✓ Online' : '✗ Offline'}
                    </span>
                  </div>
                </div>

                {networkInfo && (
                  <div className="network-info-box">
                    <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                      <i className="fas fa-wifi"></i> Informacje o sieci
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                      <p><strong>Typ połączenia:</strong> {networkInfo.type}</p>
                      <p><strong>Prędkość:</strong> {networkInfo.downlink} Mbps</p>
                      <p><strong>Opóźnienie:</strong> {networkInfo.rtt}ms</p>
                      <p><strong>Oszczędzanie danych:</strong> {networkInfo.saveData ? 'Tak' : 'Nie'}</p>
                    </div>
                  </div>
                )}

                <details className="user-agent-details">
                  <summary className="user-agent-summary">
                    <strong>User Agent (kliknij aby rozwinąć)</strong>
                  </summary>
                  <div className="user-agent-content">
                    {browserInfo.userAgent}
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>
          &copy; 2025 Radio Internetowe. Wszelkie prawa zastrzeżone. |
          Made with <i className="fas fa-heart" style={{ color: '#f87171' }}></i> in Poland
        </p>
      </footer>

      <PrivacyPopup />
    </div>
  );
}

export default App;