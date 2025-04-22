import { Link } from "react-router-dom";

const Footer = () => {
  
  // return (
  //   <div className="w-full">
  //     <div className="fixed bottom-0 left-0 w-full text-3xl bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 flex justify-around items-center z-50">
  //       <Link to="/">🏠</Link>
  //       <Link to="/consumption">📆</Link>
  //       <Link to="/chat/chatRoomList">💬</Link>
  //       <Link to="/user/userInfo">👤</Link>
  //     </div>
  //   </div>
  // );
  return (
    <footer className="w-full text-3xl bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 flex justify-around items-center">
      <Link to="/">🏠</Link>
      <Link to="/consumption">📆</Link>
      <Link to="/chat/chatRoomList">💬</Link>
      <Link to="/user/userInfo">👤</Link>
    </footer>
  );
};

export default Footer;