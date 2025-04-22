import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import { 
  checkEmailDuplication, 
  requestEmailValidation, 
  verifyEmailValidation, 
  signUp,
  login 
} from "../../services/userService";

const SignUp = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  
  // 폼 상태
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  
  // 유효성 검사 상태
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [codeError, setCodeError] = useState("");
  
  // 인증 요청 상태
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  
  // 비밀번호 유효성 검사
  useEffect(() => {
    if (password) {
      // 최소 8자, 대소문자, 숫자, 특수문자 포함
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        setPasswordError("비밀번호는 최소 8자 이상, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.");
      } else {
        setPasswordError("");
      }
    }
  }, [password]);

  // 비밀번호 일치 여부 검사
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else if (confirmPassword) {
      setPasswordError("");
    }
  }, [confirmPassword, password]);

  // 이메일 중복 확인
  const handleEmailCheck = async () => {
    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }
    
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      setEmailError("유효한 이메일 형식이 아닙니다.");
      return;
    }
    
    try {
      const response = await checkEmailDuplication(email);
      if (response.message === "no duplication") {
        setIsEmailChecked(true);
        setEmailError("사용 가능한 이메일입니다.");
      } else {
        setEmailError("이미 사용 중인 이메일입니다.");
        setIsEmailChecked(false);
      }
    } catch (error) {
      console.error("이메일 중복 확인 오류:", error);
      setEmailError("이메일 중복 확인 중 오류가 발생했습니다.");
      setIsEmailChecked(false);
    }
  };
  
  // 이메일 인증 코드 요청
  const handleEmailVerification = async () => {
    if (!isEmailChecked) {
      setEmailError("먼저 이메일 중복 확인을 해주세요.");
      return;
    }
    
    try {
      await requestEmailValidation(email);
      setEmailVerificationSent(true);
      setEmailError("인증 코드가 발송되었습니다. 이메일을 확인해주세요.");
    } catch (error) {
      console.error("이메일 인증 요청 오류:", error);
      setEmailError("인증 코드 발송 중 오류가 발생했습니다.");
    }
  };
  
  // 이메일 인증 코드 확인
  const handleEmailVerificationCheck = async () => {
    if (!code) {
      setCodeError("인증 코드를 입력해주세요.");
      return;
    }
    
    try {
      const response = await verifyEmailValidation(email, code);
      if (response.message === "success") {
        setIsEmailValid(true);
        setCodeError("이메일이 인증되었습니다.");
      } else {
        setCodeError("잘못된 인증 코드입니다.");
      }
    } catch (error) {
      console.error("이메일 인증 확인 오류:", error);
      setCodeError("인증 확인 중 오류가 발생했습니다.");
    }
  };
  
  // 회원가입 제출
  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // 필수 필드 확인
    if (!name || !birth || !gender || !email || !phone || !password || !confirmPassword) {
      alert("모든 필수 정보를 입력해주세요.");
      return;
    }
    
    // 유효성 검사 확인
    if (!isEmailValid) {
      setEmailError("이메일 인증이 필요합니다.");
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    if (passwordError) {
      return;
    }
    
    try {
      // 날짜 형식 변환 (YYYY-MM-DD => YYYYMMDD)
      const formattedBirth = birth.replace(/-/g, "");
      
      const userData = {
        email,
        password,
        name,
        phone,
        birth: formattedBirth,
        gender,
        address: address || null,
      };
      
      console.log("회원가입 데이터:", userData); // 전송 데이터 확인
      
      const response = await signUp(userData);
      if (response.message === "success") {
        alert("회원가입이 완료되었습니다.");
        
        // 회원가입 성공 후 로그인 API 호출
        try {
          const loginResponse = await login(email, password);
          
          if (loginResponse.message === "success") {
            // 로그인 성공 시 상태 업데이트
            updateUser({
              userId: loginResponse.userId,
              email: email,
              isLoggedIn: true
            });
            
            // 홈 화면으로 이동
            navigate("/");
          } else {
            alert("자동 로그인에 실패했습니다. 로그인 페이지로 이동합니다.");
            navigate("/login");
          }
        } catch (loginError) {
          console.error("자동 로그인 오류:", loginError);
          alert("자동 로그인 중 오류가 발생했습니다. 로그인 페이지로 이동합니다.");
          navigate("/login");
        }
      } else {
        alert("회원가입 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-0 flex flex-col overflow-y-auto no_scroll">
      <div className="flex-grow py-12 bg-blue-500 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-white">회원가입</h1>
      </div>

      {/* 하단 - 입력 폼 */}
      <div className="flex-grow-[4] bg-white rounded-3xl z-10 -mt-4">
        <form onSubmit={handleSignUp} className="p-8 max-w-md mx-auto rounded-3xl bg-white shadow-lg">
          {/* 이름 */}
          <div className="mb-4">
            <label className="block text-gray-700">이름 <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full border rounded-lg p-3 mt-1"
              placeholder="이름을 입력 해주세요."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 flex flex-wrap sm:flex-row gap-4">
            {/* 생년월일 */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-gray-700">생년월일 <span className="text-red-500">*</span></label>
              <input
                type="date"
                className="w-full border rounded-lg p-3 mt-1"
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
                required
              />
            </div>

            {/* 성별 (드롭다운 선택) */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-gray-700">성별 <span className="text-red-500">*</span></label>
              <select
                className="w-full border rounded-lg p-3 mt-1 bg-white"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="" disabled>
                  성별
                </option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>
          </div>

          {/* 이메일 */}
          <div className="mb-4">
            <label className="block text-gray-700">이메일 <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input
                type="email"
                className={`flex-1 border rounded-lg p-3 ${emailError && !isEmailChecked ? 'border-red-500' : ''}`}
                placeholder="example@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailChecked(false);
                  setIsEmailValid(false);
                  setEmailVerificationSent(false);
                }}
                disabled={isEmailValid}
                required
              />
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                onClick={handleEmailCheck}
                disabled={isEmailValid}
              >
                중복확인
              </button>
            </div>
            {emailError && <p className={`text-sm mt-1 ${isEmailChecked ? 'text-green-500' : 'text-red-500'}`}>{emailError}</p>}
            
            {isEmailChecked && !isEmailValid && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  onClick={handleEmailVerification}
                  disabled={emailVerificationSent}
                >
                  인증코드 발송
                </button>
                {emailVerificationSent && (
                  <>
                    <input
                      type="text"
                      className="flex-1 border rounded-lg p-3"
                      placeholder="인증코드 입력"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                      onClick={handleEmailVerificationCheck}
                    >
                      확인
                    </button>
                  </>
                )}
              </div>
            )}
            {codeError && <p className={`text-sm mt-1 ${isEmailValid ? 'text-green-500' : 'text-red-500'}`}>{codeError}</p>}
          </div>

          {/* 전화번호 - 단순 입력 */}
          <div className="mb-4">
            <label className="block text-gray-700">전화번호 <span className="text-red-500">*</span></label>
            <input
              type="tel"
              className="w-full border rounded-lg p-3 mt-1"
              placeholder="010-1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              전화번호는 '-' 없이 입력해도 됩니다. (예: 01012345678)
            </p>
          </div>

          {/* 비밀번호 */}
          <div className="mb-4">
            <label className="block text-gray-700">비밀번호 <span className="text-red-500">*</span></label>
            <input
              type="password"
              className={`w-full border rounded-lg p-3 mt-1 ${passwordError ? 'border-red-500' : ''}`}
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              비밀번호는 8자 이상, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700">비밀번호 확인 <span className="text-red-500">*</span></label>
            <input
              type="password"
              className={`w-full border rounded-lg p-3 mt-1 ${passwordError ? 'border-red-500' : ''}`}
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
          </div>

          {/* 주소 */}
          <div className="mb-6">
            <label className="block text-gray-700">주소 (선택)</label>
            <input
              type="text"
              className="w-full border rounded-lg p-3 mt-1"
              placeholder="주소 입력"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* 회원가입 버튼 */}
          <button 
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
          >
            회원가입
          </button>
          
          {/* 로그인 페이지로 이동 */}
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요? {" "}
              <span 
                className="text-blue-500 cursor-pointer"
                onClick={() => navigate("/login")}
              >
                로그인
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;