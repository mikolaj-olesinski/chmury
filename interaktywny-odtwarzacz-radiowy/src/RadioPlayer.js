import React, { useState, useRef, useEffect } from 'react';

// Lista gatunków muzycznych i stacji radiowych
const musicData = {
  "Electronic": {
    icon: "fas fa-music",
    stations: {
      "Chill Electronic": {
        url: "https://streams.fluxfm.de/live/mp3-320/streams.fluxfm.de/",
        description: "Relaksująca muzyka elektroniczna i ambient"
      },
      "Deep House FM": {
        url: "https://streams.fluxfm.de/jazz/mp3-320/streams.fluxfm.de/",
        description: "Głębokie brzmienia house i techno"
      },
      "Electronic Beats": {
        url: "https://stream.srg-ssr.ch/m/rsj/mp3_128",
        description: "Energiczne beaty elektroniczne"
      }
    }
  },
  "Rock": {
    icon: "fas fa-guitar",
    stations: {
      "Alternative Rock": {
        url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",
        description: "Nowoczesny rock alternatywny"
      },
      "Classic Rock": {
        url: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFM.mp3",
        description: "Klasyki rocka z lat 70-90"
      },
      "Indie Rock": {
        url: "https://streams.fluxfm.de/live/mp3-320/streams.fluxfm.de/",
        description: "Niezależny rock i indie"
      }
    }
  },
  "Pop": {
    icon: "fas fa-star",
    stations: {
      "Pop Hits": {
        url: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFM.mp3",
        description: "Najnowsze hity popowe"
      },
      "Top 40": {
        url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",
        description: "40 najpopularniejszych utworów"
      },
      "Euro Pop": {
        url: "https://stream.srg-ssr.ch/m/rsj/mp3_128",
        description: "Europejskie hity popowe"
      }
    }
  },
  "Jazz": {
    icon: "fas fa-saxophone",
    stations: {
      "Smooth Jazz": {
        url: "https://streams.fluxfm.de/jazz/mp3-320/streams.fluxfm.de/",
        description: "Gładki jazz i smooth"
      },
      "Classic Jazz": {
        url: "https://stream.srg-ssr.ch/m/rsj/mp3_128",
        description: "Klasyczny jazz i bebop"
      },
      "Jazz Fusion": {
        url: "https://streams.fluxfm.de/live/mp3-320/streams.fluxfm.de/",
        description: "Fusion jazz z elementami funk"
      }
    }
  },
  "World": {
    icon: "fas fa-globe-americas",
    stations: {
      "World Music": {
        url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",
        description: "Muzyka z całego świata"
      },
      "Latin Beats": {
        url: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFM.mp3",
        description: "Rytmy latynoamerykańskie"
      },
      "Folk & Traditional": {
        url: "https://stream.srg-ssr.ch/m/rsj/mp3_128",
        description: "Folk i muzyka tradycyjna"
      }
    }
  }
};

const RadioPlayer = ({ onStatsUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentGenre, setCurrentGenre] = useState(Object.keys(musicData)[0]);
  const [currentStation, setCurrentStation] = useState(Object.keys(musicData[Object.keys(musicData)[0]].stations)[0]);
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

    audioRef.current = new Audio(stationData.url);
    audioRef.current.volume = volume;
    audioRef.current.preload = 'none';

    // Dodaj nasłuchiwaczy zdarzeń
    audioRef.current.addEventListener('error', handleAudioError);
    audioRef.current.addEventListener('loadstart', handleLoadStart);
    audioRef.current.addEventListener('canplay', handleCanPlay);
    audioRef.current.addEventListener('waiting', () => setConnectionQuality('poor'));
    audioRef.current.addEventListener('playing', () => setConnectionQuality('good'));
  };

  const handleAudioError = (e) => {
    console.error('Błąd audio:', e);
    setError(`Problem z połączeniem do stacji "${currentStation}" w gatunku ${currentGenre}. Spróbuj inną stację.`);
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
      await audioRef.current.play();
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
            if (audioRef.current && audioRef.current.currentTime === now) {
              setConnectionQuality('poor');
            }
          }, 1000);
        }
      }, 5000);
      
    } catch (err) {
      console.error('Błąd odtwarzania:', err);
      let errorMessage = 'Nie można odtworzyć tej stacji.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Przeglądarka zablokowała odtwarzanie. Kliknij przycisk ponownie.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Format audio nie jest obsługiwany.';
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
    </div>
  );
};

export default RadioPlayer;