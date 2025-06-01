import React, { useState, useEffect } from 'react';

const PrivacyPopup = () => {
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        // Sprawdź czy użytkownik już akceptował cookies
        const cookiesAccepted = localStorage.getItem('cookiesAccepted');
        if (!cookiesAccepted) {
            setShowPopup(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookiesAccepted', 'true');
        setShowPopup(false);
    };

    const declineCookies = () => {
        // W rzeczywistej aplikacji tutaj byłaby logika ograniczenia funkcjonalności
        setShowPopup(false);
    };

    if (!showPopup) return null;

    return (
        <div className="privacy-popup">
            <h3>🍪 Polityka Prywatności</h3>
            <p>
                Ta strona wykorzystuje pliki cookies oraz zbiera dane geolokalizacyjne
                w celu poprawy jakości usług i personalizacji treści.
            </p>
            <p>
                Zbieramy następujące dane:
            </p>
            <ul style={{ fontSize: '11px', paddingLeft: '15px' }}>
                <li>Lokalizacja geograficzna (za zgodą)</li>
                <li>Informacje o przeglądarce</li>
                <li>Preferencje użytkownika</li>
            </ul>
            <p style={{ fontSize: '10px', color: '#ccc' }}>
                Kontynuując korzystanie ze strony, wyrażasz zgodę na przetwarzanie
                Twoich danych zgodnie z RODO.
            </p>
            <div className="popup-buttons">
                <button onClick={acceptCookies}>
                    ✅ Akceptuję
                </button>
                <button onClick={declineCookies} style={{ backgroundColor: '#666' }}>
                    ❌ Odrzucam
                </button>
            </div>
        </div>
    );
};

export default PrivacyPopup;