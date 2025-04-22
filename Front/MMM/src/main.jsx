import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import 'react-toastify/dist/ReactToastify.css'; // Toastify CSS

createRoot(document.getElementById("root")).render(
  <RecoilRoot>
    <BrowserRouter>
      <UserProvider>
        <App />
      </UserProvider>
    </BrowserRouter>
  </RecoilRoot>

);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ Service Worker 등록 성공:', registration);
      })
      .catch((error) => {
        console.error('❌ Service Worker 등록 실패:', error);
      });
  });
}
