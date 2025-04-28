const express = require('express');
const serverless = require('serverless-http');
const path = require('path');

const app = express();

// Middleware dla logowania żądań
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ustawienie silnika szablonów EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Główna trasa
app.get('/', (req, res) => {
    console.log('Rendering the home page');
    res.render('index', { title: 'Strona główna', message: 'Witaj świecie!' });
    console.log('Home page rendered');
});

// Trasy API
app.post('/', (req, res) => {
    console.log('POST request received');
    res.send('Got a POST request');
});
app.put('/user', (req, res) => {
    console.log('PUT request received');
    res.send('Got a PUT request at /user');
});
app.delete('/user', (req, res) => {
    console.log('DELETE request received');
    res.send('Got a DELETE request at /user');
});
app.get('/contact', (req, res) => {
    console.log('Rendering contact page');
    res.render('contact', { title: 'Kontakt' });
});
app.post('/ksiega-gosci', (req, res) => {
    console.log('Form submitted:', req.body);

    res.render('ksiega-gosci', {
        title: 'Księga gości',
        message: 'Twój wpis został pomyślnie dodany!',

        name: req.body.name,
        email: req.body.email,
        website: req.body.website,
        message_2: req.body.message,
        rating: req.body.rating
    });
});

// Importowanie tras
const indexRoutes = require('./routes/index');
const { title } = require('process');
app.use('/', indexRoutes);

// Obsługa 404
app.use((req, res) => {
    console.log('404 page not found');
    res.status(404).render('404', { title: '404 - Nie znaleziono' });
});

// Obsługa błędów
app.use((err, req, res, next) => {
    console.error('Error encountered:', err.stack);
    res.status(500).render('error', { title: 'Błąd serwera', error: err });
});

// Eksportowanie dla Vercel

module.exports = app;
