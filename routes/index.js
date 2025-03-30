const express = require('express');
const router = express.Router();

// Strona główna
router.get('/', (req, res) => {
  res.render('index', { title: 'Strona główna' });
});

// Portfolio
router.get('/portfolio', (req, res) => {
  res.render('portfolio', { title: 'Portfolio' });
});

// Oferta
router.get('/oferta', (req, res) => {
  res.render('oferta', { title: 'Nasza oferta' });
});

// Kontakt
router.get('/kontakt', (req, res) => {
  res.render('contact', { title: 'Kontakt' });
});

// Księga gości
router.get('/ksiega-gosci', (req, res) => {
  res.render('ksiega-gosci', { title: 'Księga gości' });
});

// Obsługa formularza księgi gości (symulacja)
router.post('/ksiega-gosci', (req, res) => {
  res.render('ksiega-gosci', { 
    title: 'Księga gości',
    message: 'Dziękujemy za dodanie wpisu!' 
  });
});

// Obsługa formularza kontaktowego (symulacja)
router.post('/kontakt', (req, res) => {
  res.render('contact', { 
    title: 'Kontakt',
    message: 'Dziękujemy za wiadomość! Skontaktujemy się wkrótce.' 
  });
});

module.exports = router;