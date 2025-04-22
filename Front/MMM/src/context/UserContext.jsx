import { createContext, useState, useContext, useEffect } from "react";

// 초기 상태
const defaultUserState = {
  userId: null,
  email: "",
  isLoggedIn: false,
  autoLogin: false
};

// Context 생성
export const UserContext = createContext();

// Context Provider 컴포넌트
export const UserProvider = ({ children }) => {
  // 로컬 스토리지에서 사용자 상태 복원 시도
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : defaultUserState;
    } catch (error) {
      console.error("로컬 스토리지에서 사용자 정보를 복원하는 중 오류가 발생했습니다:", error);
      return defaultUserState;
    }
  });

  // 사용자 상태가 변경될 때 로컬 스토리지 업데이트
  useEffect(() => {
    try {
      if (user.isLoggedIn) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("로컬 스토리지에 사용자 정보를 저장하는 중 오류가 발생했습니다:", error);
    }
  }, [user]);

  // 사용자 상태 업데이트 함수
  const updateUser = (newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }));
  };

  // 로그아웃 함수
  const logout = () => {
    setUser(defaultUserState);
    localStorage.removeItem("user");
  };

  // 로그인 상태 확인 함수
  const isLoggedIn = () => {
    return user.isLoggedIn;
  };

  const value = {
    user,
    updateUser,
    logout,
    isLoggedIn
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// 커스텀 훅 - 사용자 컨텍스트 사용 간소화
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};