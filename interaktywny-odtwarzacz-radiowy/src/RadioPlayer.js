import React, { useState, useRef, useEffect } from 'react';

const stations = {
    'Radio Internetowe 1': 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
    'Radio Internetowe 2': 'https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFM.mp3',
    'Radio Internetowe 3': 'https://stream.srg-ssr.ch/m/rsj/mp3_128',
    'Test Stream': 'https://streams.fluxfm.de/live/mp3-320/streams.fluxfm.de/'
};

const RadioPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentStation, setCurrentStation] = useState(Object.keys(stations)[0]);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio(stations[currentStation]);
        audioRef.current.volume = volume;
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }

        audioRef.current = new Audio(stations[currentStation]);
        audioRef.current.volume = volume;

        // Dodaj obsługę błędów
        audioRef.current.addEventListener('error', (e) => {
            console.error('Błąd audio:', e);
            setError('Problem z połączeniem do stacji radiowej.');
            setIsPlaying(false);
            setLoading(false);
        });

        if (isPlaying) {
            setLoading(true);
            audioRef.current.play()
                .then(() => {
                    setLoading(false);
                    setError(null);
                })
                .catch((err) => {
                    console.error('Błąd przy zmianie stacji:', err);
                    setError('Nie można odtworzyć tej stacji.');
                    setIsPlaying(false);
                    setLoading(false);
                });
        }
    }, [currentStation]);

    const togglePlayPause = async () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            setLoading(true);
            setError(null);
            try {
                await audioRef.current.play();
                setIsPlaying(true);
                setError(null);
            } catch (err) {
                console.error('Błąd odtwarzania:', err);
                setError('Nie można odtworzyć tej stacji. Spróbuj inną.');
                setIsPlaying(false);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    return (
        <div className="radio-player">
            <h2>Odtwarzacz Radiowy</h2>

            <select value={currentStation} onChange={(e) => setCurrentStation(e.target.value)}>
                {Object.keys(stations).map((station) => (
                    <option key={station} value={station}>
                        {station}
                    </option>
                ))}
            </select>

            <div>
                <button onClick={togglePlayPause} disabled={loading}>
                    {loading ? '⏳ Ładowanie...' : (isPlaying ? '⏸️ Pauza' : '▶️ Odtwórz')}
                </button>
            </div>

            {error && (
                <div style={{ color: '#ff6b6b', margin: '10px 0', fontSize: '14px' }}>
                    ⚠️ {error}
                </div>
            )}

            <div>
                <label>Głośność: </label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                />
                <span style={{ marginLeft: '10px', fontSize: '12px' }}>
                    {Math.round(volume * 100)}%
                </span>
            </div>

            <div className="date-time">
                <p>Data: {currentDateTime.toLocaleDateString()}</p>
                <p>Godzina: {currentDateTime.toLocaleTimeString()}</p>
            </div>

            <div style={{ fontSize: '12px', color: '#ccc', marginTop: '10px' }}>
                🎵 Aktualnie: {currentStation}
            </div>
        </div>
    );
};

export default RadioPlayer;