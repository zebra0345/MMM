import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import axios from "axios";
import { messaging, getToken, onMessage } from "./firebase";
import { fcmTokenState } from "./atoms/firebaseAtom";

import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import { StyledToastContainer, Toast } from "./components/Toast";

import Header from "./apps/Header";
import Footer from "./apps/Footer";
import Home from "./pages/Home";
import Consumption from "./pages/Consumption";
import ChatRoomList from "./pages/chats/ChatRoomList";
import ChatRoom from "./pages/chats/ChatRoom";
import SavingGoal from "./pages/savings/SavingGoal";
import SavingMethod from "./pages/savings/SavingMethod";
import SavingStart from "./pages/savings/SavingStart";
import SelectAccount from "./pages/savings/SelectAccount";
import SelectDepositAccount from "./pages/savings/SelectDepositAccount";
import SelectSavingMethod from "./pages/savings/SelectSavingMethod";
import SelectWithdrawalAccount from "./pages/savings/SelectWithdrawalAccount";
import ChangePassWord from "./pages/users/ChangePassWord";
import FindPassWord from "./pages/users/FindPassWord";
import Login from "./pages/users/Login";
import SignUp from "./pages/users/SignUp";
import UserInfo from "./pages/users/UserInfo";
import MyPage from "./pages/users/MyPage";
import ForcedSaving from "./pages/savings/ForcedSaving";
import JointSaving from "./pages/savings/JointSaving";
import Test from "./pages/Test";
import SelectGoalAccount from "./pages/savings/SelectGoalAccount";
import NotificationPage from "./pages/NotificationPage";

function App() {
  const setFcmToken = useSetRecoilState(fcmTokenState);
  const navigate = useNavigate();

  useEffect(() => {
    async function requestPermissionAndToken() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("알림 권한이 거부됨");
          return;
        }

        console.log("알림 권한이 허용됨");

        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_VAPID_KEY,
        });

        const data = {
          deviceToken: token,
        };

        if (token) {
          console.log("FCM 토큰 생성됨:", token);
          setFcmToken(token);

          axios
            .post(import.meta.env.VITE_BASE_URL + "/fcm", data, {
              withCredentials: true,
            })
            .then((res) => {
              console.log("FCM 토큰 서버에 저장됨:", res.data);
            })
            .catch((err) => {
              console.log("에러 :", err);
            });
        } else {
          console.log("FCM 토큰을 가져올 수 없음");
        }

        // ─── 포그라운드 메시지 처리 ─────────────────────────
        onMessage(messaging, (payload) => {
          const data = payload.data || {};
          const title = data.title || payload.notification?.title;
          const body = data.body || payload.notification?.body;
          const click = data.click_action || "/";
          const isWarn = data.warn === "true";

          const message = (
            <div onClick={() => navigate(click)} style={{ cursor: "pointer" }}>
              <strong>{title}</strong>
              <div>{body}</div>
            </div>
          );

          if (isWarn) Toast.error(message);
          else Toast.info(message);
        });
      } catch (err) {
        console.error("알림 설정 중 오류 발생:", err);
      }
    }

    requestPermissionAndToken();
  }, [setFcmToken]);

  // 뷰포트 높이 설정 (iOS 사파리 및 모바일 브라우저용)
  useEffect(() => {
    const setVh = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // 초기 실행
    setVh();
    // 이벤트 리스너 등록
    window.addEventListener("resize", setVh);
    window.addEventListener("scroll", setVh);
    // 방향 전환 이벤트도 잡기
    window.addEventListener("orientationchange", setVh);
    
    // 추가적으로 로드 완료 후에도 한 번 더 실행
    window.addEventListener("load", setVh);

    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("scroll", setVh);
      window.removeEventListener("orientationchange", setVh);
      window.removeEventListener("load", setVh);
    };
  }, []);

  return (
    // <div
    //   className="font-diphylleia no_scroll h-screen flex flex-col select-none cursor-default"
    // >
    // <div className="font-diphylleia h-screen flex flex-col select-none cursor-default">
    <div className="font-diphylleia fixed h-screen w-screen grid grid-rows-[auto_1fr_auto] overflow-hidden select-none cursor-default"
          style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      {/* 헤더: 고정 */}
      {/* <div className="flex-none h-[52px] z-999">
        <Header />
      </div> */}
      {/* <header className="flex-none z-999"> */}
      <header className="row-start-1 row-end-2">
        <Header />
      </header>

      {/* 본문: 스크롤 영역 */}
      {/* <div className="flex-1 overflow-y-auto no_scroll h-[80vh]"> */}
      {/* <main className="flex-1 pt-[52px] pb-[68px] no_scroll"> */}
      <main className="row-start-2 row-end-3 flex flex-col min-h-0 min-w-0 h-full">
        <StyledToastContainer limit={1} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/consumption" element={<Consumption />} />
          <Route path="/calendar" element={<Consumption />} />
          <Route path="/chat/chatRoomList" element={<ChatRoomList />} />
          <Route path="/chat/chatRoom" element={<ChatRoom />} />
          <Route path="/saving/savingGoal" element={<SavingGoal />} />
          <Route path="/saving/savingMethod" element={<SavingMethod />} />
          <Route path="/saving/savingStart" element={<SavingStart />} />
          <Route path="/notification" element={<NotificationPage />} />
          <Route path="/saving/forcedSaving" element={<ForcedSaving />} />
          <Route path="/saving/jointSaving" element={<JointSaving />} />
          <Route path="/saving/selectAccount" element={<SelectAccount />} />
          <Route
            path="/saving/selectGoalAccount"
            element={<SelectGoalAccount />}
          />
          <Route
            path="/saving/selectDepositAccount"
            element={<SelectDepositAccount />}
          />
          <Route
            path="/saving/selectSavingMethod"
            element={<SelectSavingMethod />}
          />
          <Route
            path="/saving/selectWithdrawalAccount"
            element={<SelectWithdrawalAccount />}
          />
          <Route path="/user/changePassWord" element={<ChangePassWord />} />
          <Route path="/user/findPassWord" element={<FindPassWord />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/user/userInfo" element={<UserInfo />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </main>

      {/* 푸터 */}
      {/* <div className="flex-none h-[68px] z-999">
        <Footer />
      </div> */}
      {/* <footer className="flex-none z-999"> */}
      <footer className="row-start-3 row-end-4">
        <Footer />
      </footer>
    </div>
  );
}

export default App;