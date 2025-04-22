// Firebase SDK 로드 (compat 버전 사용)
importScripts("https://www.gstatic.com/firebasejs/11.5.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.5.0/firebase-messaging-compat.js");

// self.addEventListener("push", (event) => {
//     console.log("🔕 Preventing default push");
//     event.stopImmediatePropagation(); // 💥 핵심
//     });

// Firebase 구성 정보를 입력합니다.
const firebaseConfig = {
    apiKey: "%VITE_API_KEY%",
    authDomain: "%VITE_AUTH_DOMAIN%",
    projectId: "%VITE_PROJECT_ID%",
    storageBucket: "%VITE_STORAGE_BUCKET%",
    messagingSenderId: "%VITE_MESSAGING_SENDER_ID%",
    appId: "%VITE_APP_ID%",
    measurementId : "%VITE_MEASURE_MENT_ID%",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();


// 백그라운드 메시지 처리 (data-only 메시지 전송을 가정)
self.addEventListener('push', event => {
    console.log('Push event received:', event);

    // event.data.json() 으로 전체 payload를 꺼냅니다.
    const payload = event.data ? event.data.json() : {};
    // data-only 메시지는 payload.data 에, 
    // notification 페이로드가 있으면 payload.notification 에도 담겨 있습니다.
    const data = payload.data || payload.notification || {};

    const title = data.title || '알림';
    const options = {
        body: data.body || '',
        icon: data.icon || '/icons/notification-icon.png',
        badge: data.badge || '/icons/notification-badge.png',
        vibrate: data.vibrate || [100, 50, 100],
        requireInteraction: data.type === 'THRESHOLD_REACHED',
        data: { click_action: data.click_action || '/' },
    };

    // showNotification() Promise 가 완료될 때까지 SW를 유지하도록 waitUntil
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 알림 클릭 이벤트 처리
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    // data 객체에서 click_action 값을 추출합니다.
    const landingPath = event.notification.data?.click_action || "/";
    // %VITE_FRONT_URL%은 기본 도메인으로, 상대 경로와 결합하여 최종 URL을 만듭니다.
    const urlToOpen = new URL(landingPath, "%VITE_FCM_FRONT_URL%");

    // 로그 출력으로 landingPath와 최종 URL을 확인합니다.
    console.log("landingPath:", landingPath);
    console.log("최종 URL:", urlToOpen.href);

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true,
        }).then((windowClients) => {
            let matchingClient = null;
            for (let client of windowClients) {
                if (client.url.includes("%VITE_FCM_FRONT_URL%") && "focus" in client) {
                    matchingClient = client;
                    break;
                }
            }
            if (matchingClient) {
                return matchingClient.focus();
            } else if (clients.openWindow) {
                return clients.openWindow(urlToOpen.href);
            }
        })
    );
});
