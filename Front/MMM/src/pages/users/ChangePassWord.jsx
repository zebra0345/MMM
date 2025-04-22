import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { changePassword } from "../../services/userService";

const ChangePassWord = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // 로그인 확인
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // 비밀번호 유효성 검사
  useEffect(() => {
    if (newPassword) {
      // 최소 8자, 대소문자, 숫자, 특수문자 포함
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        setPasswordError("비밀번호는 최소 8자 이상, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.");
      } else {
        setPasswordError("");
      }
    }
  }, [newPassword]);

  // 비밀번호 일치 여부 검사
  useEffect(() => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else if (confirmPassword && passwordError === "비밀번호가 일치하지 않습니다.") {
      setPasswordError("");
    }
  }, [confirmPassword, newPassword, passwordError]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("모든 필드를 입력해주세요.");
      return;
    }
    
    if (passwordError) {
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    try {
      const response = await changePassword(currentPassword, newPassword);
      
      if (response.message === "success") {
        setIsSuccess(true);
        setMessage("비밀번호가 성공적으로 변경되었습니다.");
      } else {
        setMessage("현재 비밀번호가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      setMessage("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  const handleBack = () => {
    navigate("/user/userInfo");
  };

  return (
    <div className="min-h-0 flex flex-col w-full h-full">
      {/* 상단 (1/5) - 파란색 배경 */}
      <div className="flex-grow bg-blue-300 text-white flex items-center justify-center relative min-h-0">
        <div className="text-2xl font-bold mb-3">비밀번호 변경</div>
      </div>

      {/* 하단 (4/5) - 흰색 배경 */}
      <div className="flex-grow-[4] bg-white relative">
        {/* 위쪽 라운드 효과 */}
        <div className="absolute -top-5 left-0 w-full h-10 bg-white rounded-t-3xl"></div>

        <div className="p-8 max-w-md mx-auto min-h-0 h-full flex justify-start items-center flex-col overflow-y-auto">
          {isSuccess ? (
            <div className="text-center">
              <div className="mb-6 p-4 bg-green-100 text-green-600 rounded-lg">
                {message}
              </div>
              <button
                className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
                onClick={handleBack}
              >
                마이페이지로 이동
              </button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword}>
              {/* 현재 비밀번호 */}
              <div className="mb-4">
                <label className="block text-gray-700">현재 비밀번호</label>
                <input
                  type="password"
                  className="w-full border rounded-lg p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="현재 비밀번호 입력"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              {/* 새 비밀번호 */}
              <div className="mb-4">
                <label className="block text-gray-700">새 비밀번호</label>
                <input
                  type="password"
                  className={`w-full border rounded-lg p-3 mt-1 focus:outline-none focus:ring-2 ${
                    passwordError ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"
                  }`}
                  placeholder="새 비밀번호 입력"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  비밀번호는 8자 이상, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.
                </p>
              </div>

              {/* 새 비밀번호 확인 */}
              <div className="mb-4">
                <label className="block text-gray-700">새 비밀번호 확인</label>
                <input
                  type="password"
                  className={`w-full border rounded-lg p-3 mt-1 focus:outline-none focus:ring-2 ${
                    passwordError ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"
                  }`}
                  placeholder="새 비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {/* 비밀번호 에러 메시지 */}
              {passwordError && (
                <div className="mb-4 p-2 bg-red-100 text-red-600 rounded-lg">
                  {passwordError}
                </div>
              )}

              {/* 에러 메시지 표시 */}
              {message && !isSuccess && (
                <div className="mb-4 p-2 bg-red-100 text-red-600 rounded-lg">
                  {message}
                </div>
              )}

              <div className="flex gap-2">
                {/* 뒤로 가기 버튼 */}
                <button 
                  type="button"
                  className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition"
                  onClick={handleBack}
                >
                  취소
                </button>

                {/* 변경 버튼 */}
                <button 
                  type="submit"
                  className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
                >
                  변경하기
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePassWord;