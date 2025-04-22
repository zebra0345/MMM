import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const MyPage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUser();
  
  // 로그인 확인
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);
  
  const navigateToUserInfo = () => {
    navigate("/user/userInfo");
  };
  
  const navigateToAccountList = () => {
    navigate("/user/accountListInquiry");
  };
  
  const navigateToSavingGoal = () => {
    navigate("/saving/savingGoal");
  };
  
  const navigateToConsumption = () => {
    navigate("/consumption");
  };
  
  const navigateToCalendar = () => {
    navigate("/calendar");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* 상단 (1/5) - 파란색 배경 */}
      <div className="flex-grow bg-blue-300 text-white flex items-center justify-center relative">
        <div className="text-2xl font-bold mb-3">마이페이지</div>
      </div>

      {/* 하단 (4/5) - 흰색 배경 */}
      <div className="flex-grow-[4] bg-white relative">
        {/* 위쪽 라운드 효과 */}
        <div className="absolute -top-5 left-0 w-full h-10 bg-white rounded-t-3xl"></div>

        <div className="p-6 max-w-md mx-auto">
          {/* 사용자 프로필 요약 */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex items-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
              {user.email ? user.email[0].toUpperCase() : '?'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {user.email && user.email.split('@')[0]}
              </h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          
          {/* 메뉴 섹션 */}
          <div className="space-y-4">
            {/* 계정 관리 */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">계정 관리</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                    onClick={navigateToUserInfo}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">내 정보 관리</span>
                    </div>
                    <span className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                    onClick={navigateToAccountList}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">계좌 관리</span>
                    </div>
                    <span className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                </li>
              </ul>
            </div>
            
            {/* 금융 서비스 */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">금융 서비스</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                    onClick={navigateToSavingGoal}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">저축 목표 설정</span>
                    </div>
                    <span className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                    onClick={navigateToConsumption}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">소비 분석</span>
                    </div>
                    <span className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                    onClick={navigateToCalendar}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">캘린더</span>
                    </div>
                    <span className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* 앱 버전 정보 */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>앱 버전 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;