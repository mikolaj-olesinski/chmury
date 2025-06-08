import React, { useState, useEffect } from 'react';

const PrivacyPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [acceptedCookies, setAcceptedCookies] = useState(false);

  useEffect(() => {
    // W środowisku produkcyjnym sprawdzałbyś localStorage
    // localStorage.getItem('cookiesAccepted')

    // Symulacja sprawdzenia stanu cookies
    const checkCookieConsent = () => {
      // Dla demonstracji pokazujemy popup po 2 sekundach
      const timer = setTimeout(() => {
        if (!acceptedCookies) {
          setShowPopup(true);
        }
      }, 2000);

      return timer;
    };

    const timer = checkCookieConsent();

    return () => clearTimeout(timer);
  }, [acceptedCookies]);

  const acceptCookies = () => {
    // W środowisku produkcyjnym:
    // localStorage.setItem('cookiesAccepted', 'true');
    // localStorage.setItem('cookiesAcceptedDate', new Date().toISOString());

    setAcceptedCookies(true);
    setShowPopup(false);

    // Możesz tutaj dodać logikę do włączenia tracking'u, analytics itp.
    console.log('Cookies zaakceptowane:', new Date().toISOString());

    // Przykład: włączenie Google Analytics
    // if (window.gtag) {
    //   window.gtag('consent', 'update', {
    //     'analytics_storage': 'granted'
    //   });
    // }
  };

  const declineCookies = () => {
    // W środowisku produkcyjnym:
    // localStorage.setItem('cookiesAccepted', 'false');
    // localStorage.setItem('cookiesDeclinedDate', new Date().toISOString());

    setAcceptedCookies(false);
    setShowPopup(false);

    // Logika dla odrzucenia cookies
    console.log('Cookies odrzucone:', new Date().toISOString());

    // Przykład: wyłączenie tracking'u
    // if (window.gtag) {
    //   window.gtag('consent', 'update', {
    //     'analytics_storage': 'denied'
    //   });
    // }

    // Możesz pokazać komunikat o ograniczonej funkcjonalności
    showLimitedFunctionalityMessage();
  };

  const showLimitedFunctionalityMessage = () => {
    // Opcjonalnie: pokaż użytkownikowi komunikat o ograniczonej funkcjonalności
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(244, 67, 54, 0.9);
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      z-index: 1001;
      font-size: 0.9rem;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    message.innerHTML = `
      <i class="fas fa-info-circle"></i> 
      Niektóre funkcje mogą być ograniczone bez akceptacji cookies.
    `;

    document.body.appendChild(message);

    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 5000);
  };

  const reopenPopup = () => {
    setShowPopup(true);
  };

  // Jeśli popup nie ma być pokazany, zwróć przycisk do ponownego otwarcia (opcjonalnie)
  if (!showPopup) {
    return (
      <button
        onClick={reopenPopup}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.8rem',
          backdropFilter: 'blur(10px)',
          zIndex: 999,
          opacity: 0.7,
          transition: 'opacity 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
        title="Zarządzaj ustawieniami prywatności"
      >
        <i className="fas fa-cookie-bite"></i>
      </button>
    );
  }

  return (
    <div className="privacy-popup">
      <h3>
        <i className="fas fa-cookie-bite"></i>
        Cookies i Prywatność
      </h3>

      <p>
        Ta strona wykorzystuje pliki cookies w celu poprawy jakości usług,
        personalizacji treści i analizy statystyk użytkowania.
      </p>

      <p><strong>Zbieramy następujące dane:</strong></p>
      <ul>
        <li>Lokalizacja geograficzna (za Twoją zgodą w przeglądarce)</li>
        <li>Preferencje użytkownika (gatunek muzyczny, stacja, głośność)</li>
        <li>Statystyki sesji (czas słuchania, zmiany stacji)</li>
        <li>Podstawowe informacje o przeglądarce i systemie</li>
        <li>Dane techniczne o jakości połączenia internetowego</li>
      </ul>

      <p style={{ fontSize: '0.8rem', marginTop: '1rem' }}>
        <strong>Twoje prawa:</strong> Możesz w każdej chwili zmienić swoje preferencje
        lub poprosić o ograniczenie przetwarzania danych. Wszystkie dane są
        przetwarzane lokalnie w Twojej przeglądarce.
      </p>

      <p style={{
        fontSize: '0.75rem',
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: '1rem',
        fontStyle: 'italic'
      }}>
        Kontynuując korzystanie ze strony, wyrażasz zgodę na przetwarzanie
        Twoich danych zgodnie z RODO. Dane są przechowywane tylko lokalnie
        i nie są wysyłane na żadne serwery zewnętrzne.
      </p>

      <div className="popup-buttons">
        <button
          className="accept-btn"
          onClick={acceptCookies}
          aria-label="Akceptuj wszystkie cookies i przetwarzanie danych"
        >
          <i className="fas fa-check"></i>
          Akceptuję wszystko
        </button>
        <button
          className="decline-btn"
          onClick={declineCookies}
          aria-label="Odrzuć cookies i ograniczenie przetwarzania danych"
        >
          <i className="fas fa-times"></i>
          Odrzucam
        </button>
      </div>

      {/* Link do pełnej polityki prywatności */}
      <div style={{
        marginTop: '1rem',
        textAlign: 'center',
        fontSize: '0.75rem'
      }}>
        <a
          href="#privacy-policy"
          style={{
            color: '#667eea',
            textDecoration: 'underline'
          }}
          onClick={(e) => {
            e.preventDefault();
            // Tutaj możesz dodać logikę do otwarcia pełnej polityki prywatności
            console.log('Otwieranie pełnej polityki prywatności');
          }}
        >
          Przeczytaj pełną politykę prywatności
        </a>
      </div>
    </div>
  );
};

export default PrivacyPopup;