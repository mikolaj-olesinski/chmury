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
  const [location, setLocation] = useState(null);
  const [browserInfo, setBrowserInfo] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    // Pobieranie lokalizacji
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
          setLocationError(null);
        },
        (error) => {
          console.warn("Geolokalizacja odrzucona lub niedostępna:", error.message);
          setLocationError(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setLocationError("Geolokalizacja nie jest obsługiwana przez tę przeglądarkę.");
    }

    // Pobieranie informacji o przeglądarce
    setBrowserInfo({
      appName: navigator.appName,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      vendor: navigator.vendor || 'Nieznany',
      javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false
    });
  }, []);

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
        <RadioPlayer />

        <div className="info-grid">
          {/* Sekcja lokalizacji */}
          <div className="info-section">
            <h3>
              <i className="fas fa-map-marker-alt"></i> Twoja Lokalizacja
            </h3>
            {location ? (
              <>
                <p><strong>Szerokość:</strong> {location.latitude.toFixed(6)}°</p>
                <p><strong>Długość:</strong> {location.longitude.toFixed(6)}°</p>
                {location.accuracy && (
                  <p><strong>Dokładność:</strong> ±{location.accuracy.toFixed(0)} metrów</p>
                )}
                {location.altitude && (
                  <p><strong>Wysokość:</strong> {location.altitude.toFixed(0)} m n.p.m.</p>
                )}
                {location.speed && (
                  <p><strong>Prędkość:</strong> {(location.speed * 3.6).toFixed(1)} km/h</p>
                )}
                {location.heading && (
                  <p><strong>Kierunek:</strong> {location.heading.toFixed(0)}°</p>
                )}
                <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '1rem' }}>
                  Ostatnia aktualizacja: {new Date().toLocaleTimeString('pl-PL')}
                </p>
              </>
            ) : (
              <div>
                {locationError ? (
                  <p style={{ color: '#ff6b6b' }}>
                    <i className="fas fa-exclamation-triangle"></i> 
                    {locationError}
                  </p>
                ) : (
                  <p>
                    <i className="fas fa-spinner fa-spin"></i> 
                    Pobieranie lokalizacji...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sekcja informacji o przeglądarce */}
          {browserInfo && (
            <div className="info-section">
              <h3>
                <i className="fas fa-globe"></i> Informacje o Przeglądarce
              </h3>
              <p><strong>Przeglądarka:</strong> {browserInfo.appName}</p>
              <p><strong>System:</strong> {browserInfo.platform}</p>
              <p><strong>Język:</strong> {browserInfo.language}</p>
              <p><strong>Dostawca:</strong> {browserInfo.vendor}</p>
              <p><strong>Cookies:</strong> 
                <span style={{ color: browserInfo.cookieEnabled ? '#4ade80' : '#f87171' }}>
                  {browserInfo.cookieEnabled ? ' ✓ Włączone' : ' ✗ Wyłączone'}
                </span>
              </p>
              <p><strong>Status połączenia:</strong> 
                <span style={{ color: browserInfo.onLine ? '#4ade80' : '#f87171' }}>
                  {browserInfo.onLine ? ' ✓ Online' : ' ✗ Offline'}
                </span>
              </p>
              <p><strong>Java:</strong> 
                <span style={{ color: browserInfo.javaEnabled ? '#4ade80' : '#6b7280' }}>
                  {browserInfo.javaEnabled ? ' ✓ Włączona' : ' ✗ Wyłączona'}
                </span>
              </p>
              <details style={{ marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer', color: '#667eea' }}>
                  <strong>User Agent (kliknij aby rozwinąć)</strong>
                </summary>
                <p style={{ 
                  fontSize: '0.75rem', 
                  wordBreak: 'break-all', 
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px'
                }}>
                  {browserInfo.userAgent}
                </p>
              </details>
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