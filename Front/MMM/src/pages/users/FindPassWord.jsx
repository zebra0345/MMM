import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { findPassword } from "../../services/userService";

const FindPassWord = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFindPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage("이메일을 입력해주세요.");
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await findPassword(email);
      
      if (response.message === "success") {
        setIsSuccess(true);
        setMessage("임시 비밀번호가 이메일로 발송되었습니다.");
      } else {
        setIsSuccess(false);
        setMessage("해당 이메일로 등록된 계정을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("비밀번호 찾기 오류:", error);
      setIsSuccess(false);
      setMessage("비밀번호 찾기 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-0 h-full flex flex-col">
      {/* 상단 (1/5) - 파란색 배경 */}
      <div className="flex-grow bg-blue-300 text-white flex items-center justify-center relative">
        <div className="text-2xl font-bold mb-3">비밀번호 찾기</div>
      </div>

      {/* 하단 (4/5) - 흰색 배경 */}
      <div className="flex-grow-[4] bg-white relative">
        {/* 위쪽 라운드 효과 */}
        <div className="absolute -top-5 left-0 w-full h-10 bg-white rounded-t-3xl"></div>

        <div className="p-8 max-w-md mx-auto">
          {isSuccess ? (
            <div className="text-center">
              <div className="mb-6 p-4 bg-green-100 text-green-600 rounded-lg">
                {message}
              </div>
              <p className="mb-6 text-gray-600">
                임시 비밀번호로 로그인한 후 보안을 위해 비밀번호를 변경해주세요.
              </p>
              <button
                className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
                onClick={navigateToLogin}
              >
                로그인 페이지로 이동
              </button>
            </div>
          ) : (
            <form onSubmit={handleFindPassword}>
              <p className="mb-6 text-gray-600">
                가입 시 등록한 이메일을 입력하시면 임시 비밀번호를 발송해 드립니다.
              </p>
              
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

              {/* 에러 메시지 표시 */}
              {message && !isSuccess && (
                <div className="mb-4 p-2 bg-red-100 text-red-600 rounded-lg">
                  {message}
                </div>
              )}

              {/* 비밀번호 찾기 버튼 */}
              <button 
                type="submit"
                className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
                disabled={isLoading}
              >
                {isLoading ? "처리 중..." : "비밀번호 찾기"}
              </button>

              {/* 로그인 페이지로 이동 */}
              <div className="mt-4 text-center">
                <p className="text-gray-600">
                  비밀번호가 기억나셨나요? {" "}
                  <span 
                    className="text-blue-500 cursor-pointer"
                    onClick={navigateToLogin}
                  >
                    로그인
                  </span>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindPassWord;