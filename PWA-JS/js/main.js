window.onload = () => {
    'use strict';
    
    // Rejestracja Service Workera
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Service Worker zarejestrowany pomyślnie.'))
        .catch((error) => console.error('Błąd rejestracji Service Workera:', error));
    }
    
    // Obsługa powiadomień
    const notificationButton = document.getElementById('notifications-btn');
    
    if (notificationButton) {
      notificationButton.addEventListener('click', () => {
        requestNotificationPermission();
      });
    }
    
    // Funkcja do żądania uprawnień do powiadomień
    function requestNotificationPermission() {
      if ('Notification' in window) {
        Notification.requestPermission()
          .then(permission => {
            if (permission === 'granted') {
              subscribeToPushNotifications();
            }
          });
      }
    }
    
    // Funkcja do subskrypcji powiadomień push
    function subscribeToPushNotifications() {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready
          .then(registration => {
            // Testowa notyfikacja
            showTestNotification(registration);
          })
          .catch(error => {
            console.error('Błąd podczas subskrypcji powiadomień:', error);
          });
      }
    }
    
    // Funkcja do wyświetlania testowej notyfikacji
    function showTestNotification(registration) {
      registration.showNotification('Koty internetowe', {
        body: 'Dziękujemy za włączenie powiadomień!',
        icon: 'images/pwa-icon-192.png',
        badge: 'images/pwa-icon-128.png',
        vibrate: [100, 50, 100],
        data: {
          url: window.location.href
        }
      });
    }
  };