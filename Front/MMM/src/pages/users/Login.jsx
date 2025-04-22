import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import { login } from "../../services/userService";
import { getToken, messaging } from "../../firebase";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const { updateUser, isLoggedIn } = useUser();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // 자동 로그인 확인
  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);
  
  // 알림 권한 요청 함수
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("알림 권한 허용됨");
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_VAPID_KEY,
        });
        if (token) {
          console.log("FCM Token 받아옴");
          // 여기서 토큰 상태를 업데이트하거나 서버에 전송할 수 있습니다.
          await axios.post(
            import.meta.env.VITE_BASE_URL + "/fcm",
            { deviceToken: token },
            { withCredentials: true }
          );
        } else {
          console.log("토큰을 받아올 수 없음");
        }
      } else {
        console.log("알림 권한이 거부됨");
      }
    } catch (error) {
      console.error("알림 권한 요청 오류:", error);
    }
  };

  // 로그인 핸들러
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    
    try {
      const response = await login(email, password);
      
      if (response.message === "success") {
        // 로그인 상태 저장
        updateUser({
          userId: response.userId,
          email: response.email,
          name: response.name,
          isLoggedIn: true
        });
        
        console.log("로그인 성공:", response);
        
        // 로그인 성공 시 알림 권한 요청 실행
        requestNotificationPermission();
        
        // 메인 페이지로 이동
        navigate("/");
      } else {
        setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      setError("로그인 중 오류가 발생했습니다.");
    }
  };
  
  // 회원가입 페이지로 이동
  const navigateToSignUp = () => {
    navigate("/signUp");
  };
  
  // 비밀번호 찾기 페이지로 이동
  const navigateToFindPassword = () => {
    navigate("/user/findPassWord");
  };

  return (
    <div className="min-h-0 flex flex-col flex-1 overflow-y-auto">
      {/* 상단 (1/5) - 파란색 배경 */}
      <div className="bg-blue-300 text-white flex items-center justify-center h-1/5 shadow-lg">
        <div className="flex justify-center items-center text-2xl mb-4 font-bold">Welcome</div>
      </div>

      {/* 하단 (4/5) - 흰색 배경 */}
      <div className="flex-1 bg-white relative">
        {/* 위쪽 라운드 효과 */}
        <div className="absolute -top-5 left-0 w-full h-10 bg-white rounded-t-3xl"></div>

        <form onSubmit={handleLogin} className="p-8 max-w-md mx-auto">
          {/* 이메일 입력 */}
          <div className="mb-4">
            <label className="block text-gray-700">이메일</label>
            <input
              type="email"
              className="w-full border rounded-lg p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className="mb-4">
            <label className="block text-gray-700">비밀번호</label>
            <input
              type="password"
              className="w-full border rounded-lg p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {/* 비밀번호 찾기 링크 */}
            <div className="flex justify-end mt-1">
              <span 
                className="text-sm text-blue-500 cursor-pointer"
                onClick={navigateToFindPassword}
              >
                비밀번호 찾기
              </span>
            </div>
          </div>

          {/* 에러 메시지 표시 */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button 
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
          >
            로그인
          </button>

          {/* 회원가입 버튼 */}
          <button 
            type="button"
            className="w-full bg-gray-500 text-white p-3 rounded-lg mt-3 hover:bg-gray-600 transition"
            onClick={navigateToSignUp}
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
