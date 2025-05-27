// Importujemy Express
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Dane - lista albumów metalowych zespołów
let albums = [
    {
        id: 1,
        band: "Metallica",
        title: "Master of Puppets",
        year: 1986,
        genre: "Thrash Metal",
        cover: "https://upload.wikimedia.org/wikipedia/en/b/b2/Metallica_-_Master_of_Puppets_cover.jpg"
    },
    {
        id: 2,
        band: "Metallica",
        title: "Ride the Lightning",
        year: 1984,
        genre: "Thrash Metal",
        cover: "https://upload.wikimedia.org/wikipedia/en/f/f4/Ridetl.png"
    },
    {
        id: 3,
        band: "AC/DC",
        title: "Back in Black",
        year: 1980,
        genre: "Hard Rock",
        cover: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/ACDC_Back_in_Black.png/300px-ACDC_Back_in_Black.png"
    },
    {
        id: 4,
        band: "AC/DC",
        title: "Highway to Hell",
        year: 1979,
        genre: "Hard Rock",
        cover: "https://upload.wikimedia.org/wikipedia/en/a/ac/Acdc_Highway_to_Hell.JPG"
    },
    {
        id: 5,
        band: "Iron Maiden",
        title: "The Number of the Beast",
        year: 1982,
        genre: "Heavy Metal",
        cover: "https://upload.wikimedia.org/wikipedia/en/3/32/IronMaiden_NumberOfBeast.jpg"
    },
    {
        id: 6,
        band: "Iron Maiden",
        title: "Powerslave",
        year: 1984,
        genre: "Heavy Metal",
        cover: "https://upload.wikimedia.org/wikipedia/en/1/1c/Iron_Maiden_-_Powerslave.jpg"
    },
    {
        id: 7,
        band: "Black Sabbath",
        title: "Paranoid",
        year: 1970,
        genre: "Heavy Metal",
        cover: "https://upload.wikimedia.org/wikipedia/en/6/64/Black_Sabbath_-_Paranoid.jpg"
    },
    {
        id: 8,
        band: "Judas Priest",
        title: "British Steel",
        year: 1980,
        genre: "Heavy Metal",
        cover: "https://upload.wikimedia.org/wikipedia/en/9/97/Judas_Priest_British_Steel.jpg"
    }
];

// Middleware
app.use(cors()); // Pozwala na żądania z innych domen
app.use(express.json()); // Parsowanie JSON-a w żądaniach

// Middleware do logowania żądań
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ROOT endpoint - informacje o API
app.get('/', (req, res) => {
    res.json({
        message: "🎸 Metal Albums API",
        version: "1.0.0",
        endpoints: {
            "GET /albums": "Pobierz wszystkie albumy",
            "GET /albums/:band": "Pobierz albumy konkretnego zespołu",
            "POST /albums": "Dodaj nowy album",
            "PUT /albums/:id": "Zaktualizuj album",
            "DELETE /albums/:id": "Usuń album"
        },
        totalAlbums: albums.length
    });
});

// GET /albums - Pobieranie wszystkich albumów
app.get('/albums', (req, res) => {
    console.log(`📀 Pobieranie wszystkich albumów (${albums.length})`);
    res.json({
        success: true,
        count: albums.length,
        data: albums
    });
});

// GET /albums/:band - Pobieranie albumów konkretnego zespołu
app.get('/albums/:band', (req, res) => {
    const band = req.params.band.toLowerCase();
    const filteredAlbums = albums.filter(album =>
        album.band.toLowerCase().includes(band)
    );

    console.log(`🔍 Wyszukiwanie albumów zespołu: ${req.params.band} - znaleziono: ${filteredAlbums.length}`);

    if (filteredAlbums.length > 0) {
        res.json({
            success: true,
            count: filteredAlbums.length,
            band: req.params.band,
            data: filteredAlbums
        });
    } else {
        res.status(404).json({
            success: false,
            message: `Nie znaleziono albumów dla zespołu: ${req.params.band}`,
            availableBands: [...new Set(albums.map(album => album.band))]
        });
    }
});

// POST /albums - Dodawanie nowego albumu
app.post('/albums', (req, res) => {
    const { band, title, year, genre, cover } = req.body;

    // Walidacja danych
    if (!band || !title || !year) {
        return res.status(400).json({
            success: false,
            message: "Brak wymaganych danych (band, title, year)",
            received: req.body
        });
    }

    // Sprawdzenie czy album już istnieje
    const existingAlbum = albums.find(album =>
        album.band.toLowerCase() === band.toLowerCase() &&
        album.title.toLowerCase() === title.toLowerCase()
    );

    if (existingAlbum) {
        return res.status(409).json({
            success: false,
            message: "Album już istnieje w bazie danych",
            existing: existingAlbum
        });
    }

    const newAlbum = {
        id: Math.max(...albums.map(a => a.id)) + 1,
        band: band.trim(),
        title: title.trim(),
        year: parseInt(year),
        genre: genre?.trim() || "Metal",
        cover: cover?.trim() || "https://via.placeholder.com/300x300/1a1a1a/ff6b6b?text=No+Cover"
    };

    albums.push(newAlbum);
    console.log(`➕ Dodano nowy album: ${newAlbum.band} - ${newAlbum.title}`);

    res.status(201).json({
        success: true,
        message: "Album dodany pomyślnie",
        data: newAlbum
    });
});

// PUT /albums/:id - Aktualizacja albumu
app.put('/albums/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { band, title, year, genre, cover } = req.body;

    const albumIndex = albums.findIndex(album => album.id === id);

    if (albumIndex === -1) {
        return res.status(404).json({
            success: false,
            message: `Album o ID ${id} nie został znaleziony`,
            availableIds: albums.map(a => a.id)
        });
    }

    const album = albums[albumIndex];
    const oldAlbum = { ...album };

    // Aktualizacja tylko przekazanych pól
    if (band !== undefined) album.band = band.trim();
    if (title !== undefined) album.title = title.trim();
    if (year !== undefined) album.year = parseInt(year);
    if (genre !== undefined) album.genre = genre.trim();
    if (cover !== undefined) album.cover = cover.trim();

    console.log(`✏️ Zaktualizowano album ID ${id}: ${album.band} - ${album.title}`);

    res.json({
        success: true,
        message: "Album zaktualizowany pomyślnie",
        data: album,
        changes: {
            before: oldAlbum,
            after: album
        }
    });
});

// DELETE /albums/:id - Usuwanie albumu
app.delete('/albums/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const albumIndex = albums.findIndex(album => album.id === id);

    if (albumIndex === -1) {
        return res.status(404).json({
            success: false,
            message: `Album o ID ${id} nie został znaleziony`,
            availableIds: albums.map(a => a.id)
        });
    }

    const deletedAlbum = albums[albumIndex];
    albums.splice(albumIndex, 1);

    console.log(`🗑️ Usunięto album: ${deletedAlbum.band} - ${deletedAlbum.title}`);

    res.json({
        success: true,
        message: "Album usunięty pomyślnie",
        deleted: deletedAlbum,
        remainingCount: albums.length
    });
});

// Obsługa błędów 404 dla nieistniejących endpointów
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint nie znaleziony",
        requested: req.originalUrl,
        method: req.method,
        availableEndpoints: [
            "GET /",
            "GET /albums",
            "GET /albums/:band",
            "POST /albums",
            "PUT /albums/:id",
            "DELETE /albums/:id"
        ]
    });
});

// Globalna obsługa błędów
app.use((error, req, res, next) => {
    console.error('❌ Błąd serwera:', error);
    res.status(500).json({
        success: false,
        message: "Wewnętrzny błąd serwera",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Nieoczekiwany błąd'
    });
});

// Uruchomienie serwera
app.listen(port, () => {
    console.log('🎸=================================🎸');
    console.log(`🤘 METAL ALBUMS API SERVER 🤘`);
    console.log(`🚀 Serwer działa na http://localhost:${port}`);
    console.log(`📀 Dostępnych albumów: ${albums.length}`);
    console.log(`🎵 Zespoły: ${[...new Set(albums.map(a => a.band))].join(', ')}`);
    console.log('🎸=================================🎸');
});