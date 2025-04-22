import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import {
  deleteUser,
  logout as logoutService,
} from "../../services/userService";
import api from "../../axios";
import AccountRegistration from "../../components/account/AccountRegistration";

const UserInfo = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout, isLoggedIn } = useUser();

  const [address, setAddress] = useState(user.address || "");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 로그인 확인
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // 주소 정보 업데이트 - 사용자 상태가 변경될 때
  useEffect(() => {
    setAddress(user.address || "");
  }, [user.address]);

  const handleUpdateAddress = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // API 명세서에 맞게 PATCH 메서드로 주소 업데이트
      const response = await api.patch("/user", { address });

      if (response.data.message === "success") {
        setIsSuccess(true);
        setMessage("주소가 성공적으로 변경되었습니다.");
        setIsEditing(false);

        // Context API를 통해 사용자 상태 업데이트
        updateUser({ address });
      } else {
        setIsSuccess(false);
        setMessage("주소 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("주소 변경 오류:", error);
      setIsSuccess(false);
      setMessage("주소 변경 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      const response = await deleteUser();

      if (response.message === "success") {
        // 로그아웃 처리
        await logoutService();
        logout(); // context의 로그아웃 함수 호출

        // 로컬 스토리지 삭제
        localStorage.removeItem("rememberedEmail");

        // 홈으로 이동
        navigate("/");
      } else {
        setMessage("회원 탈퇴에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원 탈퇴 오류:", error);
      setMessage("회원 탈퇴 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logoutService();
      // 로그아웃 처리
      logout(); // context의 로그아웃 함수 호출

      // 로그인 페이지로 이동
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      setMessage("로그아웃 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToChangePassword = () => {
    navigate("/user/changePassWord");
  };

  // 계좌 업데이트 핸들러
  const handleAccountsUpdate = (accounts, navigateToList = false) => {
    if (navigateToList) {
      navigate("/user/accountListInquiry");
    }
  };

  return (
    <div className="min-h-0 flex flex-col overflow-hidden h-full">
      {/* 상단 (1/5) - 파란색 배경 */}
      <div className="flex-grow bg-blue-300 text-white flex items-center justify-center relative">
        <div className="text-2xl font-bold mt-5 mb-10">내 정보</div>
      </div>

      {/* 하단 (4/5) - 흰색 배경 */}
      <div className="flex-grow-[4] bg-white relative min-h-0">
        {/* 위쪽 라운드 효과 */}
        <div className="absolute -top-5 left-0 w-full h-10 bg-white rounded-t-3xl"></div>

        <div className="p-6 max-w-md mx-auto h-full min-h-0 overflow-y-auto no_scroll">
          {/* 사용자 정보 카드 */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">계정 정보</h2>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user.email ? user.email[0].toUpperCase() : "?"}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500">이메일</p>
              <p className="text-gray-700">{user.email}</p>
            </div>

            {/* 주소 정보 */}
            <div className="mb-4">
              <p className="text-sm text-gray-500">주소</p>
              {isEditing ? (
                <form onSubmit={handleUpdateAddress} className="mt-2">
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="새 주소를 입력하세요"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="flex-1 bg-gray-300 text-gray-700 p-2 rounded-lg"
                      onClick={() => {
                        setIsEditing(false);
                        setAddress(user.address || "");
                      }}
                      disabled={isLoading}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-500 text-white p-2 rounded-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-700">
                    {address || "등록된 주소가 없습니다."}
                  </p>
                  <button
                    className="text-blue-500 text-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    수정
                  </button>
                </div>
              )}
            </div>

            {/* 계좌 등록 컴포넌트 */}
            <AccountRegistration onAccountsUpdate={handleAccountsUpdate} />

            {/* 메시지 표시 */}
            {message && (
              <div
                className={`mb-4 p-2 rounded-lg ${
                  isSuccess
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* 계정 관리 메뉴 */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              계정 관리
            </h2>

            <ul className="space-y-2">
              <li>
                <button
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                  onClick={navigateToChangePassword}
                >
                  <span className="text-gray-700">비밀번호 변경</span>
                  <span className="text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>
              </li>
              <li>
                <button
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  <span className="text-gray-700">
                    {isLoading ? "로그아웃 중..." : "로그아웃"}
                  </span>
                  <span className="text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>
              </li>
              <li>
                <button
                  className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <span className="text-red-500">회원 탈퇴</span>
                  <span className="text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">회원 탈퇴</h3>
            <p className="text-gray-600 mb-6">
              정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없으며 모든 데이터가
              삭제됩니다.
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg"
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </button>
              <button
                className="flex-1 bg-red-500 text-white p-3 rounded-lg"
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
