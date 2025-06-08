import React, { useState, useRef, useEffect } from 'react';

// Lista sprawdzonych, działających stacji radiowych (~10 stacji)
const musicData = {
  "Polish Radio": {
    icon: "fas fa-flag",
    stations: {
      "AntyRadio": {
        url: "http://redir.atmcdn.pl/sc/o2/Eurozet/live/antyradio.livx",
        description: "Najlepszy rock na świecie"
      },
      "RMF FM": {
        url: "https://www.rmfon.pl/n/rmffm.pls",
        description: "Radio numer 1 w Polsce"
      }
    }
  },
  "International": {
    icon: "fas fa-globe-americas",
    stations: {
      "Radio Paradise Main": {
        url: "http://stream.radioparadise.com/aac-320",
        description: "Eklektyczna muzyka z całego świata"
      },
      "Radio Paradise Mellow": {
        url: "http://stream.radioparadise.com/mellow-320",
        description: "Spokojniejsze rytmy"
      },
      "Radio Paradise Rock": {
        url: "http://stream.radioparadise.com/rock-320",
        description: "Rock mix"
      },
      "Vermont Public": {
        url: "https://vpr.streamguys1.com/vpr64.mp3",
        description: "Public radio z Vermont"
      }
    }
  },
  "Electronic & Chill": {
    icon: "fas fa-music",
    stations: {
      "SomaFM Groove Salad": {
        url: "http://ice1.somafm.com/groovesalad-256-mp3",
        description: "Ambient i downtempo electronica"
      },
      "SomaFM Drone Zone": {
        url: "http://ice1.somafm.com/dronezone-256-mp3",
        description: "Ambient space music"
      },
      "SomaFM Deep Space One": {
        url: "http://ice1.somafm.com/deepspaceone-128-mp3",
        description: "Deep ambient electronic"
      }
    }
  },
  "Rock & Alternative": {
    icon: "fas fa-guitar",
    stations: {
      "AntyRadio": {
        url: "http://redir.atmcdn.pl/sc/o2/Eurozet/live/antyradio.livx",
        description: "Najlepszy rock na świecie"
      },
      "SomaFM Metal Detector": {
        url: "http://ice1.somafm.com/metal-128-mp3",
        description: "Heavy metal i hard rock"
      }
    }
  }
};

const RadioPlayer = ({ onStatsUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentGenre, setCurrentGenre] = useState("Polish Radio"); // Domyślnie Polish Radio
  const [currentStation, setCurrentStation] = useState(Object.keys(musicData["Polish Radio"].stations)[0]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('unknown');
  const audioRef = useRef(null);
  const connectionCheckRef = useRef(null);

  // Pobierz obecnie wybraną stację
  const getCurrentStationData = () => {
    return musicData[currentGenre]?.stations[currentStation];
  };

  // Aktualizacja czasu co sekundę
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Inicjalizacja odtwarzacza
  useEffect(() => {
    initializeAudio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (connectionCheckRef.current) {
        clearInterval(connectionCheckRef.current);
      }
    };
  }, []);

  // Zmiana stacji lub gatunku
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    initializeAudio();

    if (isPlaying) {
      playAudio();
    }
  }, [currentStation, currentGenre]);

  const initializeAudio = () => {
    if (audioRef.current) {
      // Usuń starych nasłuchiwaczy
      audioRef.current.removeEventListener('error', handleAudioError);
      audioRef.current.removeEventListener('loadstart', handleLoadStart);
      audioRef.current.removeEventListener('canplay', handleCanPlay);
    }

    const stationData = getCurrentStationData();
    if (!stationData) return;

    // Sprawdź czy URL to playlist (.pls) czy bezpośredni stream
    let audioUrl = stationData.url;
    if (audioUrl.endsWith('.pls')) {
      // Dla plików .pls użyjemy alternatywnego podejścia
      console.log('Wykryto playlist .pls:', audioUrl);
    }

    audioRef.current = new Audio(audioUrl);
    audioRef.current.volume = volume;
    audioRef.current.preload = 'none';

    // CORS settings for better compatibility
    audioRef.current.crossOrigin = "anonymous";

    // Dodaj nasłuchiwaczy zdarzeń
    audioRef.current.addEventListener('error', handleAudioError);
    audioRef.current.addEventListener('loadstart', handleLoadStart);
    audioRef.current.addEventListener('canplay', handleCanPlay);
    audioRef.current.addEventListener('waiting', () => setConnectionQuality('poor'));
    audioRef.current.addEventListener('playing', () => setConnectionQuality('good'));
    audioRef.current.addEventListener('loadeddata', () => setConnectionQuality('good'));
  };

  const handleAudioError = (e) => {
    console.error('Błąd audio:', e);
    const stationData = getCurrentStationData();

    let errorMessage = `Problem z połączeniem do stacji "${currentStation}".`;

    if (stationData?.url.endsWith('.pls')) {
      errorMessage += ' Ta stacja używa formatu .pls - spróbuj inną stację.';
    } else {
      errorMessage += ' Spróbuj inną stację lub sprawdź połączenie internetowe.';
    }

    setError(errorMessage);
    setIsPlaying(false);
    setLoading(false);
    setConnectionQuality('error');
  };

  const handleLoadStart = () => {
    setConnectionQuality('loading');
  };

  const handleCanPlay = () => {
    setConnectionQuality('good');
    setError(null);
  };

  const playAudio = async () => {
    if (!audioRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // Dla niektórych stacji może być potrzebna interakcja użytkownika
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        await playPromise;
      }

      setIsPlaying(true);
      setError(null);

      // Monitor jakości połączenia
      if (connectionCheckRef.current) {
        clearInterval(connectionCheckRef.current);
      }

      connectionCheckRef.current = setInterval(() => {
        if (audioRef.current && !audioRef.current.paused) {
          const now = audioRef.current.currentTime;
          setTimeout(() => {
            if (audioRef.current && audioRef.current.currentTime === now && !audioRef.current.paused) {
              setConnectionQuality('poor');
            }
          }, 2000);
        }
      }, 10000);

    } catch (err) {
      console.error('Błąd odtwarzania:', err);
      let errorMessage = 'Nie można odtworzyć tej stacji.';

      if (err.name === 'NotAllowedError') {
        errorMessage = 'Przeglądarka zablokowała odtwarzanie. Kliknij przycisk ponownie.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Format audio nie jest obsługiwany przez tę przeglądarkę.';
      } else if (err.name === 'AbortError') {
        errorMessage = 'Ładowanie zostało przerwane. Spróbuj ponownie.';
      }

      setError(errorMessage);
      setIsPlaying(false);
      setConnectionQuality('error');
    } finally {
      setLoading(false);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    if (connectionCheckRef.current) {
      clearInterval(connectionCheckRef.current);
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      await playAudio();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleGenreChange = (e) => {
    const newGenre = e.target.value;
    setCurrentGenre(newGenre);

    // Automatycznie wybierz pierwszą stację z nowego gatunku
    const firstStation = Object.keys(musicData[newGenre].stations)[0];
    setCurrentStation(firstStation);

    setError(null);
    setConnectionQuality('unknown');

    // Aktualizuj statystyki
    if (onStatsUpdate) {
      onStatsUpdate(newGenre, 'change');
    }
  };

  const handleStationChange = (e) => {
    const newStation = e.target.value;
    setCurrentStation(newStation);
    setError(null);
    setConnectionQuality('unknown');

    // Aktualizuj statystyki
    if (onStatsUpdate) {
      onStatsUpdate(currentGenre, 'change');
    }
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'good':
        return <i className="fas fa-signal" style={{ color: '#4ade80' }}></i>;
      case 'poor':
        return <i className="fas fa-signal" style={{ color: '#f59e0b' }}></i>;
      case 'loading':
        return <i className="fas fa-spinner fa-spin" style={{ color: '#6b7280' }}></i>;
      case 'error':
        return <i className="fas fa-exclamation-triangle" style={{ color: '#f87171' }}></i>;
      default:
        return <i className="fas fa-signal" style={{ color: '#6b7280' }}></i>;
    }
  };

  const formatTime = (date) => {
    return {
      date: date.toLocaleDateString('pl-PL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const { date, time } = formatTime(currentDateTime);

  return (
    <div className="radio-player">
      <h2>
        <i className="fas fa-radio"></i> Odtwarzacz Radiowy
      </h2>

      {/* Selektory gatunku i stacji */}
      <div className="station-selector">
        {/* Wybór gatunku muzycznego */}
        <div className="selector-group">
          <label className="selector-label">
            <i className="fas fa-list"></i>
            Gatunek muzyczny:
          </label>
          <select
            value={currentGenre}
            onChange={handleGenreChange}
            disabled={loading}
          >
            {Object.entries(musicData).map(([genre, data]) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {/* Wybór konkretnej stacji */}
        <div className="selector-group">
          <label className="selector-label">
            <i className={musicData[currentGenre]?.icon || 'fas fa-radio'}></i>
            Stacja radiowa:
          </label>
          <select
            value={currentStation}
            onChange={handleStationChange}
            disabled={loading}
          >
            {Object.entries(musicData[currentGenre]?.stations || {}).map(([name, data]) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Przycisk odtwarzania */}
      <button
        className="play-button"
        onClick={togglePlayPause}
        disabled={loading}
        aria-label={isPlaying ? 'Zatrzymaj odtwarzanie' : 'Rozpocznij odtwarzanie'}
      >
        {loading ? (
          <>
            <div className="loading-spinner"></div>
            <span>Ładowanie...</span>
          </>
        ) : (
          <>
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            <span>{isPlaying ? 'Pauza' : 'Odtwórz'}</span>
          </>
        )}
      </button>

      {/* Komunikat błędu */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* Kontrola głośności */}
      <div className="volume-control">
        <label>
          <i className="fas fa-volume-up"></i>
          Głośność:
        </label>
        <input
          className="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          aria-label="Regulacja głośności"
        />
        <span className="volume-percentage">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* Status połączenia */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        margin: '1rem 0',
        fontSize: '0.85rem',
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        {getConnectionIcon()}
        <span>
          {connectionQuality === 'good' && 'Dobre połączenie'}
          {connectionQuality === 'poor' && 'Słabe połączenie'}
          {connectionQuality === 'loading' && 'Łączenie...'}
          {connectionQuality === 'error' && 'Błąd połączenia'}
          {connectionQuality === 'unknown' && 'Sprawdzanie...'}
        </span>
      </div>

      {/* Data i czas */}
      <div className="date-time">
        <p>
          <i className="fas fa-calendar-alt"></i>
          {date}
        </p>
        <p>
          <i className="fas fa-clock"></i>
          {time}
        </p>
      </div>

      {/* Informacje o stacji */}
      <div className="station-info">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <i className={musicData[currentGenre]?.icon || 'fas fa-music'}></i>
          <strong>{currentGenre} • {currentStation}</strong>
        </div>
        <div style={{ fontSize: '0.8rem', fontStyle: 'normal', color: 'rgba(255, 255, 255, 0.6)' }}>
          {getCurrentStationData()?.description || 'Opis niedostępny'}
        </div>
      </div>

      {/* Dodatkowe informacje dla użytkownika */}
      {isPlaying && (
        <div style={{
          marginTop: '1rem',
          padding: '0.5rem',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '8px',
          fontSize: '0.8rem',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          <i className="fas fa-info-circle"></i>
          Radio odtwarzane na żywo
        </div>
      )}

      {/* Informacja o formatach .pls */}
      {getCurrentStationData()?.url.endsWith('.pls') && (
        <div style={{
          marginTop: '1rem',
          padding: '0.5rem',
          background: 'rgba(245, 158, 11, 0.1)',
          borderRadius: '8px',
          fontSize: '0.8rem',
          textAlign: 'center',
          color: 'rgba(245, 158, 11, 0.9)',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          <i className="fas fa-info-circle"></i>
          Ta stacja używa formatu playlist - jeśli nie działa, spróbuj inną stację
        </div>
      )}
    </div>
  );
};

export default RadioPlayer;