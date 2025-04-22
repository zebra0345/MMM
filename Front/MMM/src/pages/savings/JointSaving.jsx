import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const JointSaving = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [roomName, setRoomName] = useState(""); // 방 이름 상태 추가

  // 이메일 형식 검사
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleStartSaving = async () => {

    // 채팅방 이름 유효성 검사
    if (!roomName || roomName.trim() === "") {
      alert("채팅방 이름을 입력해주세요.");
      return;
    }
  
    const userIds = selectedUsers.map((user) => user.id);

    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      userIds.push(user.userId);
    }

    const dataToSend = {
      userIds: userIds,
      roomName: roomName.trim(), // 방 이름 추가
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/chat/room`,
        dataToSend,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        console.log("그룹 채팅방 생성 성공:", response);
        navigate("/chat/chatRoomList");
      }
    } catch (error) {
      console.error("그룹 채팅방 생성 실패:", error);
    }
  };

  const handleSelect = (user) => {
    if (selected.includes(user.id)) {
      setSelected((prev) => prev.filter((id) => id !== user.id));
      setSelectedUsers((prev) =>
        prev.filter((selectedUser) => selectedUser.id !== user.id)
      );
    } else {
      setSelected((prev) => [...prev, user.id]);
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  // 이메일 검색
  const handleSearch = async () => {
    if (search.trim() === "") {
      alert("검색할 이메일을 입력해주세요.");
      return;
    }

    // 이메일 형식 검사
    if (!isValidEmail(search)) {
      alert("유효한 이메일 형식이 아닙니다. 정확한 이메일을 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/chat/search`,
        { email: search },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const userData = localStorage.getItem("user");
        // 유저 본인은 검색되지 않도록
        if (userData) {
          const currentUser = JSON.parse(userData);
          const filteredUsers = response.data.userDto.filter(
            (user) => user.id !== currentUser.userId
          )
          setFilteredData(filteredUsers);
        } else {
          setFilteredData(response.data.userDto);
        }
      }
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
    }
  }

  return (
    <div className="min-h-0 flex flex-col overflow-y-auto no_scroll">
      <div className="sticky">
        <div className="flex pb-15 pt-6 bg-blue-400 justify-center">
          <h1 className="text-3xl font-bold text-white rounded-[60px] ">친구 초대하기</h1>
        </div>
        <div className="flex w-full bg-white -mt-10 rounded-[60px] z-30 h-20"></div>
      </div>
      <div className="p-5 -mt-5">
        {/* 검색 입력창과 버튼을 가로로 배치 */}
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="이메일 입력 (예: friend@example.com)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow p-2 border rounded-xl"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl"
          >
            검색
          </button>
        </div>
        <input
          type="text"
          placeholder="채팅방 이름 입력"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full p-2 border rounded-xl mt-3"
        />
        <div className="mt-4 space-y-3">
          {filteredData.length > 0 && filteredData.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-100 rounded-xl shadow-md"
            >
              <div className="flex items-center">
                <div className="flex justify-center w-10">
                  <span className="text-2xl">😊</span>
                </div>
                <div className="flex flex-col ml-2">
                  <p className="font-bold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selected.includes(user.id)}
                onChange={() => handleSelect(user)}
                className="w-6 h-6 accent-blue-500"
              />
            </div>
          ))}
        </div>
        {selectedUsers.length > 0 && (
          <div className="mt-5 p-3 bg-gray-200 rounded-xl">
            <h2 className="text-lg font-bold">초대할 친구 목록</h2>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-2 bg-blue-200 rounded-lg text-center flex items-center justify-between"
                >
                  <span className="text-center mx-auto">{user.name}</span>
                  <button
                    onClick={() => handleSelect(user)}
                    className="ml-1 text-red-500 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={handleStartSaving}
          className="mt-5 w-full p-3 bg-blue-500 text-white rounded-xl"
        >
          그룹 채팅 시작하기
        </button>
      </div>
    </div>
  );
};


export default JointSaving;
