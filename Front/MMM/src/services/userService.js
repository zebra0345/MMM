import api from '../axios';

// 이메일 중복 확인
export const checkEmailDuplication = async (email) => {
  try {
    const response = await api.post('/user/emailcheck', { email });
    return response.data;
  } catch (error) {
    console.error('이메일 중복 확인 에러:', error);
    throw error;
  }
};

// 회원가입
export const signUp = async (userData) => {
  try {
    // 백엔드 형식에 맞게 데이터 확인
    const requestData = {
      email: userData.email,
      password: userData.password,
      name: userData.name,
      phone: userData.phone, 
      birth: userData.birth,
      gender: userData.gender,
      address: userData.address
    };
    
    const response = await api.post('/user/signup', requestData);
    return response.data;
  } catch (error) {
    console.error('회원가입 에러:', error);
    throw error;
  }
};

// 이메일 인증 요청
export const requestEmailValidation = async (email) => {
  try {
    const response = await api.post('/user/validemail', { email });
    return response.data;
  } catch (error) {
    console.error('이메일 인증 요청 에러:', error);
    throw error;
  }
};

// 이메일 인증 확인
export const verifyEmailValidation = async (email, validNum) => {
  try {
    const response = await api.post('/user/vertifyemail', { email, validNum });
    return response.data;
  } catch (error) {
    console.error('이메일 인증 확인 에러:', error);
    throw error;
  }
};

// 휴대폰 인증 요청
export const requestPhoneValidation = async (phone) => {
  try {
    const response = await api.post('/user/validphone', { phone });
    return response.data;
  } catch (error) {
    console.error('휴대폰 인증 요청 에러:', error);
    throw error;
  }
};

// 휴대폰 인증 확인
export const verifyPhoneValidation = async (phone, validNum) => {
  try {
    const response = await api.post('/user/validphone', { phone, validNum });
    return response.data;
  } catch (error) {
    console.error('휴대폰 인증 확인 에러:', error);
    throw error;
  }
};

// 로그인
export const login = async (email, password) => {
  try {
    // 백엔드에서 기대하는 형식대로 데이터 전송
    const requestData = {
      email,
      password
    };
    
    const response = await api.post('/user/login', requestData);
    
    // 응답 로깅
    console.log('로그인 응답:', response.data);
    
    return response.data; // { "message": "success", "userId": 4, "email": "ssafy@gmail.com" }
  } catch (error) {
    console.error('로그인 에러:', error);
    throw error;
  }
};

// 로그아웃
export const logout = async () => {
  try {
    const response = await api.post('/user/logout');
    return response.data;
  } catch (error) {
    console.error('로그아웃 에러:', error);
    throw error;
  }
};

// 비밀번호 찾기
export const findPassword = async (email) => {
  try {
    const response = await api.post('/user/password-find', { email });
    return response.data;
  } catch (error) {
    console.error('비밀번호 찾기 에러:', error);
    throw error;
  }
};

// 비밀번호 변경
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/user/password-change', { 
      currentPassword, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    console.error('비밀번호 변경 에러:', error);
    throw error;
  }
};

// 회원정보 수정
// updateUserInfo 함수 수정
export const updateUserInfo = async (address) => {
  try {
    const response = await api.patch('/user', { address });
    return response.data;
  } catch (error) {
    console.error('회원정보 수정 에러:', error);
    throw error;
  }
};

// 회원탈퇴
export const deleteUser = async () => {
  try {
    const response = await api.delete('/user');
    return response.data;
  } catch (error) {
    console.error('회원탈퇴 에러:', error);
    throw error;
  }
};