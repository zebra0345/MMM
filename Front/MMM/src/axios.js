import axios from "axios";

// axios 인스턴스 생성
const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // 실제 백엔드 서버 URL로 교체해주세요
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  // 중요: 쿠키를 포함하기 위한 설정
  withCredentials: true,
});

// 세션이 만료되었을 때 로컬 스토리지의 사용자 정보 초기화하는 함수
const resetUserSession = () => {
  localStorage.removeItem("user");
};

// 요청 인터셉터
instance.interceptors.request.use(
  (config) => {
    // 쿠키는 withCredentials 설정으로 자동으로 전송되므로
    // 별도 헤더 설정이 필요 없습니다.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401(Unauthorized) 에러 처리 - 세션 만료
    if (error.response && error.response.status === 401) {
      console.log("세션이 만료되었습니다. 로그인 페이지로 이동합니다.");

      // 로컬 스토리지의 사용자 정보 초기화
      resetUserSession();

      // 로그인 페이지로 리디렉션
      window.location.href = "/login";
    }

    // 403(Forbidden) 에러 처리
    if (error.response && error.response.status === 403) {
      console.error("권한이 없습니다.");
    }

    return Promise.reject(error);
  }
);

export default instance;
