import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:3001';

export default function MetalAlbumsApp() {
  // Stan podstawowy
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Stan dla wyszukiwania
  const [searchBand, setSearchBand] = useState("");
  const [showingAll, setShowingAll] = useState(true);

  // Stan dla dodawania/edycji albumów
  const [newAlbum, setNewAlbum] = useState({
    band: "",
    title: "",
    year: "",
    genre: "",
    cover: ""
  });
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Stan dla statystyk
  const [stats, setStats] = useState({});

  // Ładowanie albumów przy starcie
  useEffect(() => {
    loadAllAlbums();
  }, []);

  // Obliczanie statystyk
  useEffect(() => {
    const bandCounts = albums.reduce((acc, album) => {
      acc[album.band] = (acc[album.band] || 0) + 1;
      return acc;
    }, {});

    const genreCounts = albums.reduce((acc, album) => {
      acc[album.genre] = (acc[album.genre] || 0) + 1;
      return acc;
    }, {});

    const yearCounts = albums.reduce((acc, album) => {
      const decade = `${Math.floor(album.year / 10) * 10}s`;
      acc[decade] = (acc[decade] || 0) + 1;
      return acc;
    }, {});

    setStats({
      totalAlbums: albums.length,
      bands: Object.keys(bandCounts).length,
      topBand: Object.entries(bandCounts).sort(([, a], [, b]) => b - a)[0],
      topGenre: Object.entries(genreCounts).sort(([, a], [, b]) => b - a)[0],
      decades: yearCounts
    });
  }, [albums]);

  // Auto-ukrywanie komunikatów
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Funkcja do pobierania wszystkich albumów
  const loadAllAlbums = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/albums`);
      const data = await response.json();

      if (data.success) {
        setAlbums(data.data);
        setShowingAll(true);
        // Aktualizuj localStorage
        localStorage.setItem('metalAlbums', JSON.stringify(data.data));
      } else {
        throw new Error('Błąd podczas pobierania albumów');
      }
    } catch (error) {
      console.error('Błąd:', error);
      setError('Nie udało się pobrać albumów. Spróbuj ponownie.');
      // Spróbuj załadować z localStorage
      const saved = localStorage.getItem('metalAlbums');
      if (saved) {
        setAlbums(JSON.parse(saved));
        setSuccess('Załadowano dane z lokalnej pamięci');
      }
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do wyszukiwania albumów zespołu
  const searchBandAlbums = async () => {
    if (!searchBand.trim()) {
      loadAllAlbums();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/albums/${encodeURIComponent(searchBand.trim())}`);
      const data = await response.json();

      if (data.success) {
        setAlbums(data.data);
        setShowingAll(false);
        setSuccess(`Znaleziono ${data.count} albumów zespołu "${data.band}"`);
      } else {
        setError(data.message);
        setAlbums([]);
      }
    } catch (error) {
      console.error('Błąd:', error);
      setError('Błąd podczas wyszukiwania. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do dodawania nowego albumu
  const addAlbum = async () => {
    if (!newAlbum.band || !newAlbum.title || !newAlbum.year) {
      setError('Wypełnij wymagane pola: zespół, tytuł i rok');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlbum)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Dodano album: ${data.data.band} - ${data.data.title}`);
        setNewAlbum({ band: "", title: "", year: "", genre: "", cover: "" });
        setShowAddForm(false);
        // Odśwież listę
        if (showingAll) {
          loadAllAlbums();
        } else {
          searchBandAlbums();
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Błąd:', error);
      setError('Błąd podczas dodawania albumu');
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do aktualizacji albumu
  const updateAlbum = async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/albums/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Zaktualizowano album: ${data.data.band} - ${data.data.title}`);
        setEditingAlbum(null);
        // Odśwież listę
        if (showingAll) {
          loadAllAlbums();
        } else {
          searchBandAlbums();
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Błąd:', error);
      setError('Błąd podczas aktualizacji albumu');
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do usuwania albumu
  const deleteAlbum = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten album?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/albums/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Usunięto album: ${data.deleted.band} - ${data.deleted.title}`);
        // Odśwież listę
        if (showingAll) {
          loadAllAlbums();
        } else {
          searchBandAlbums();
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Błąd:', error);
      setError('Błąd podczas usuwania albumu');
    } finally {
      setLoading(false);
    }
  };

  // Obsługa klawisza Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchBandAlbums();
    }
  };

  return (
    <div className="metal-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            🎸 METAL ALBUMS 🤘
          </h1>
          <p className="app-subtitle">
            Zarządzaj swoją kolekcją metalowych albumów
          </p>
        </div>
      </header>

      {/* Stats Panel */}
      {stats.totalAlbums > 0 && (
        <div className="stats-panel">
          <div className="stat-card">
            <div className="stat-number">{stats.totalAlbums}</div>
            <div className="stat-label">Albumów</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.bands}</div>
            <div className="stat-label">Zespołów</div>
          </div>
          {stats.topBand && (
            <div className="stat-card">
              <div className="stat-number">{stats.topBand[1]}</div>
              <div className="stat-label">Albumów - {stats.topBand[0]}</div>
            </div>
          )}
          {stats.topGenre && (
            <div className="stat-card">
              <div className="stat-number">{stats.topGenre[1]}</div>
              <div className="stat-label">{stats.topGenre[0]}</div>
            </div>
          )}
        </div>
      )}

      {/* Controls Panel */}
      <div className="controls-panel">
        {/* Search Section */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Wyszukaj zespół (np. Metallica, Iron Maiden)..."
              value={searchBand}
              onChange={(e) => setSearchBand(e.target.value)}
              onKeyPress={handleKeyPress}
              className="search-input"
              disabled={loading}
            />
            <button
              onClick={searchBandAlbums}
              className="btn btn-search"
              disabled={loading}
            >
              🔍 Szukaj
            </button>
          </div>
          <div className="search-actions">
            <button
              onClick={loadAllAlbums}
              className="btn btn-secondary"
              disabled={loading}
            >
              📋 Wszystkie albumy
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary"
            >
              ➕ Dodaj album
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingAlbum) && (
          <div className="form-section">
            <h3>{editingAlbum ? 'Edytuj album' : 'Dodaj nowy album'}</h3>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Zespół *"
                value={editingAlbum ? editingAlbum.band : newAlbum.band}
                onChange={(e) => editingAlbum
                  ? setEditingAlbum({ ...editingAlbum, band: e.target.value })
                  : setNewAlbum({ ...newAlbum, band: e.target.value })
                }
                className="form-input"
                required
              />
              <input
                type="text"
                placeholder="Tytuł albumu *"
                value={editingAlbum ? editingAlbum.title : newAlbum.title}
                onChange={(e) => editingAlbum
                  ? setEditingAlbum({ ...editingAlbum, title: e.target.value })
                  : setNewAlbum({ ...newAlbum, title: e.target.value })
                }
                className="form-input"
                required
              />
              <input
                type="number"
                placeholder="Rok wydania *"
                min="1950"
                max="2024"
                value={editingAlbum ? editingAlbum.year : newAlbum.year}
                onChange={(e) => editingAlbum
                  ? setEditingAlbum({ ...editingAlbum, year: e.target.value })
                  : setNewAlbum({ ...newAlbum, year: e.target.value })
                }
                className="form-input"
                required
              />
              <input
                type="text"
                placeholder="Gatunek (np. Heavy Metal)"
                value={editingAlbum ? editingAlbum.genre : newAlbum.genre}
                onChange={(e) => editingAlbum
                  ? setEditingAlbum({ ...editingAlbum, genre: e.target.value })
                  : setNewAlbum({ ...newAlbum, genre: e.target.value })
                }
                className="form-input"
              />
              <input
                type="url"
                placeholder="URL okładki (opcjonalne)"
                value={editingAlbum ? editingAlbum.cover : newAlbum.cover}
                onChange={(e) => editingAlbum
                  ? setEditingAlbum({ ...editingAlbum, cover: e.target.value })
                  : setNewAlbum({ ...newAlbum, cover: e.target.value })
                }
                className="form-input form-input-wide"
              />
            </div>
            <div className="form-actions">
              {editingAlbum ? (
                <>
                  <button
                    onClick={() => updateAlbum(editingAlbum.id, editingAlbum)}
                    className="btn btn-success"
                    disabled={loading}
                  >
                    💾 Zapisz zmiany
                  </button>
                  <button
                    onClick={() => setEditingAlbum(null)}
                    className="btn btn-secondary"
                  >
                    ❌ Anuluj
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={addAlbum}
                    className="btn btn-success"
                    disabled={loading}
                  >
                    ➕ Dodaj album
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewAlbum({ band: "", title: "", year: "", genre: "", cover: "" });
                    }}
                    className="btn btn-secondary"
                  >
                    ❌ Anuluj
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="status-message error-message">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="status-message success-message">
          ✅ {success}
        </div>
      )}

      {loading && (
        <div className="status-message loading-message">
          🔄 Ładowanie...
        </div>
      )}

      {/* Albums Grid */}
      <main className="albums-container">
        {albums.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">🎵</div>
            <h3>Brak albumów</h3>
            <p>
              {showingAll
                ? "Nie znaleziono żadnych albumów w bazie danych."
                : `Nie znaleziono albumów dla wyszukiwanego zespołu "${searchBand}".`
              }
            </p>
            <button
              onClick={showingAll ? () => setShowAddForm(true) : loadAllAlbums}
              className="btn btn-primary"
            >
              {showingAll ? "➕ Dodaj pierwszy album" : "📋 Zobacz wszystkie albumy"}
            </button>
          </div>
        ) : (
          <div className="albums-grid">
            {albums.map(album => (
              <div key={album.id} className="album-card">
                <div className="album-cover">
                  <img
                    src={album.cover || "https://via.placeholder.com/300x300/1a1a1a/ff6b6b?text=No+Cover"}
                    alt={`${album.band} - ${album.title}`}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x300/1a1a1a/ff6b6b?text=No+Cover";
                    }}
                  />
                  <div className="album-overlay">
                    <button
                      onClick={() => setEditingAlbum(album)}
                      className="overlay-btn edit-btn"
                      title="Edytuj album"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteAlbum(album.id)}
                      className="overlay-btn delete-btn"
                      title="Usuń album"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="album-info">
                  <h3 className="album-band">{album.band}</h3>
                  <h4 className="album-title">{album.title}</h4>
                  <div className="album-details">
                    <span className="album-year">🗓️ {album.year}</span>
                    <span className="album-genre">🎵 {album.genre}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>🤘 Metal Albums Manager - Zarządzaj swoją kolekcją! 🎸</p>
        <p>Made with 🖤 for metal fans</p>
      </footer>
    </div>
  );
}