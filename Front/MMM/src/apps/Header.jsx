import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import { logout as logoutService } from "../services/userService";

const Header = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null); // 메뉴 영역 참조

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLoginClick = () => {
    navigate("/login");
    setIsMenuOpen(false);
  };

  const onGoSignUp = () => {
    navigate("/signUp");
    setIsMenuOpen(false);
  };

  const handleLogoutClick = async () => {
    try {
      await logoutService();
      logout();
      navigate("/");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      // navigate로 로그인 페이지로 이동하도록 되어야 한다.
      navigate("/login");
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // 화면 바깥을 클릭하면 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    // <header className="bg-white shadow-md py-3 px-4 top-0 z-999">
    // <header className="fixed top-0 left-0 right-0 w-full bg-white shadow-md py-3 px-4 z-50">
    <header className="bg-white shadow-md py-3 px-4">
      <div className="container mx-auto flex justify-between items-center relative">
        {/* 로고 */}
        <img
          src="/logoImgRemove.png"
          alt="로고"
          className="w-[60px] h-[60px] rounded-full object-cover cursor-pointer -mt-4 -mb-4 -ml-3"
          onClick={handleLogoClick}
        />
        {/* <button onClick={handleLogoClick} className="gap-4 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-500 flex items-center justify-center cursor-pointer -ml-5">
          오참
        </button> */}

        {/* <div
          className="text-xl font-bold text-blue-500 cursor-pointer"
          onClick={handleLogoClick}
        >
          MMM
        </div> */}
        <Link to={"/notification"} className="absolute right-14">
          <img
            src="/buttonIcons/notification.png"
            alt="notification"
            width={30}
          />
        </Link>

        {/* 메뉴 버튼 */}
        <div className="relative" ref={menuRef}>
          <img
            src="/buttonIcons/menuButton.png"
            alt="메뉴"
            width={30}
            className="cursor-pointer"
            onClick={toggleMenu}
          />

          {/* 드롭다운 메뉴 */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border shadow-md rounded-md z-999">
              {isLoggedIn() ? (
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={handleLogoutClick}
                >
                  로그아웃
                </button>
              ) : (
                <>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={handleLoginClick}
                  >
                    로그인
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={onGoSignUp}
                  >
                    회원가입
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
