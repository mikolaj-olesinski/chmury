import React, { useEffect, useState } from 'react';
import RadioPlayer from './RadioPlayer';
import './App.css';
import PrivacyPopup from './PrivacyPopup';

function App() {
  const [location, setLocation] = useState(null);
  const [browserInfo, setBrowserInfo] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(pos.coords),
        (err) => console.warn("Geolokalizacja odrzucona.")
      );
    }

    setBrowserInfo({
      appName: navigator.appName,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    });
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>Radio Internetowe</h1>
      </header>
      <main className="main-content">
        <RadioPlayer />

        {location && (
          <div className="info-section">
            <h3>📍 Twoja Lokalizacja</h3>
            <p><strong>Szerokość:</strong> {location.latitude.toFixed(6)}</p>
            <p><strong>Długość:</strong> {location.longitude.toFixed(6)}</p>
            {location.accuracy && (
              <p><strong>Dokładność:</strong> {location.accuracy.toFixed(0)} metrów</p>
            )}
          </div>
        )}

        {browserInfo && (
          <div className="info-section">
            <h3>🌐 Informacje o Przeglądarce</h3>
            <p><strong>Przeglądarka:</strong> {browserInfo.appName}</p>
            <p><strong>System:</strong> {browserInfo.platform}</p>
            <p><strong>User Agent:</strong> {browserInfo.userAgent}</p>
          </div>
        )}
      </main>
      <footer className="footer">
        <p>&copy; 2025 Radio Internetowe. Wszelkie prawa zastrzeżone.</p>
      </footer>
      <PrivacyPopup />
    </div>
  );
}

export default App;