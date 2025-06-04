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

  // Funkcja do aktualizacji statystyk z RadioPlayer
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
          .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

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
          {/* Zegary światowe */}
          <div className="info-section">
            <h3>
              <i className="fas fa-globe-americas"></i> Czas Światowy
            </h3>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              {Object.entries(worldClocks).map(([city, timeData]) => (
                <div key={city} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{city}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      {timeData.date}
                    </div>
                  </div>
                  <div style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '1.1rem', 
                    fontWeight: '600',
                    color: '#667eea'
                  }}>
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
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
                  {formatTime(sessionStats.totalListeningTime)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Czas słuchania
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div style={{
                  padding: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#4ade80' }}>
                    {sessionStats.stationsChanged}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    Zmiany stacji
                  </div>
                </div>
                
                <div style={{
                  padding: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#f59e0b' }}>
                    {Object.keys(sessionStats.genreStats).length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    Gatunki
                  </div>
                </div>
              </div>

              {sessionStats.favoriteGenre && (
                <div style={{
                  padding: '0.8rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    🎵 Ulubiony gatunek
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#667eea' }}>
                    {sessionStats.favoriteGenre}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {sessionStats.genreStats[sessionStats.favoriteGenre]} słuchań
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center' }}>
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
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <div style={{
                    padding: '0.5rem',
                    background: browserInfo.cookieEnabled ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '0.8rem'
                  }}>
                    <strong>Cookies:</strong><br/>
                    <span style={{ color: browserInfo.cookieEnabled ? '#4ade80' : '#f87171' }}>
                      {browserInfo.cookieEnabled ? '✓ Włączone' : '✗ Wyłączone'}
                    </span>
                  </div>
                  
                  <div style={{
                    padding: '0.5rem',
                    background: browserInfo.onLine ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '0.8rem'
                  }}>
                    <strong>Status:</strong><br/>
                    <span style={{ color: browserInfo.onLine ? '#4ade80' : '#f87171' }}>
                      {browserInfo.onLine ? '✓ Online' : '✗ Offline'}
                    </span>
                  </div>
                </div>

                {networkInfo && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.8rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
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

                <details style={{ marginTop: '1rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#667eea', fontSize: '0.9rem' }}>
                    <strong>User Agent (kliknij aby rozwinąć)</strong>
                  </summary>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    wordBreak: 'break-all', 
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px'
                  }}>
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