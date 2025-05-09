// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging.js';
import firebaseConfig from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Function to request notification permission
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            // Get FCM token
            const token = await getToken(messaging, {
                vapidKey: 'YOUR_VAPID_KEY' // You'll need to add your VAPID key here
            });
            console.log('FCM Token:', token);
            // Here you would typically send this token to your server
            return token;
        } else {
            console.log('Notification permission denied.');
            return null;
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return null;
    }
}

// Handle foreground messages
onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    // You can show a notification here if you want
    if (payload.notification) {
        new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/images/pwa-icon-192.png'
        });
    }
});

// Export the function
export { requestNotificationPermission }; 