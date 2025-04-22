import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ChatRoomList = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false); // 참여중인 채팅방 없을 때
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_BASE_URL + "/chat/room", { withCredentials: true })
      .then((response) => {
        console.log(response);


        if (response.data.message === "사용자가 참여한 방이 없습니다.") {
          setIsEmpty(true);
        }

        else {
          setChatRooms(response.data.items);
          setIsEmpty(false);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching chat rooms:", error);
        setError("앗! 채팅방 목록을 불러오지 못했어요.\n잠시 후 다시 시도해 주세요 :)");
        setLoading(false);
      });
  }, []);

  // 채팅방 생성 페이지로 이동
  const navigateToCreateChatRoom = () => {
    navigate("/saving/jointSaving")
  }

  if (loading) return <div className="text-center py-10">로딩 중...</div>;

  const handleChatRoomClick = (roomId) => {
    navigate("/chat/ChatRoom", { state: { roomId } });
  };

  // 날짜 형식 변환 함수
  const formatDate = (dateString) => {
    if (!dateString) return "NEW";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "날짜 없음";
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      // 오늘 메시지인 경우 시간만 표시 (오전/오후 포함)
      if (messageDate.getTime() === today.getTime()) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? '오후' : '오전';
        const displayHours = hours % 12 || 12;
        return `${ampm} ${displayHours}:${minutes < 10 ? '0' + minutes : minutes}`;
      }
      
      // 어제 메시지인 경우
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (messageDate.getTime() === yesterday.getTime()) {
        return "어제";
      }
      
      // 그 외의 경우 날짜 표시
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } catch (e) {
      console.error("날짜 형식 변환 오류:", e);
      return "날짜 없음";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="fixed left-0 right-0 z-50">
        <div className="flex items-center justify-center bg-blue-400 pt-5 pb-14">
          <h1 className="text-3xl font-bold text-white">채팅방 목록</h1>
        </div>
        <div className="flex w-full bg-white -mt-8 rounded-t-[60px] h-10"></div>
      </div>

      {/* 스크롤 영역*/}
      {/* <div className="pt-31 flex-1 overflow-y-auto"> */}
      <div className="pt-31 flex-1 overflow-y-auto overflow-x-hidden">
        {/* 채팅 목록 */}
        <div
          className={`flex flex-col items-center ${
          isEmpty ? 'justify-center' : 'justify-start'
          } px-5 w-full mx-auto bg-white z-10`}>
          {/* <div className="w-full max-w-2xl space-y-4"> */}
          <div className="w-full max-w-2xl space-y-4 overflow-x-hidden">
            {/* isEmpty가 true일 때는 참여 중인 채팅방이 없다는 메시지 표시 */}
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-xl shadow-sm">
                <p className="text-lg text-gray-700 mb-4">참여 중인 채팅방이 없습니다.</p>
                <p className="text-md text-gray-500 mb-6">새로운 채팅방에 참여하거나 직접 만들어보세요!</p>
                <button
                  className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
                  onClick={navigateToCreateChatRoom}
                >
                  채팅방 만들기
                </button>
              </div>
            ) : (
              chatRooms.map((room) => {
                // 아바타 색상은 채팅방마다 다른 블루 계열 색상 사용
                const blueShades = [
                  'bg-blue-900',  // #1E3A8A - 남색
                  'bg-blue-800', // #1E40AF - 매우 진한 파란색
                  'bg-blue-700', // #1D4ED8 - 진한 파란색
                  'bg-blue-600', // #2563EB - 약간 진한 파란색
                  'bg-blue-500', // #3B82F6 - 기본 파란색
                  'bg-blue-400', // #60A5FA - 연한 파란색
                  'bg-blue-300', // #93C5FD - 베이비블루
                ];
                const colorIndex = parseInt(room.roomId) % blueShades.length;
                const avatarColor = blueShades[colorIndex];
                
                // const bgColor = 'bg-neutral-100';
                const bgColor = 'bg-blue-50';
                
                // 최근 메시지 처리 (null 확인)
                const latestMessage = room.latestChatLog ? room.latestChatLog.message : "새로운 채팅방입니다";
                
                return (
                  <div
                    key={room.roomId}
                    // className={`flex flex-col flex-1 p-4 ${bgColor} rounded-xl shadow-sm cursor-pointer mb-3 from-blue-50 to-indigo-50 w-full overflow-hidden`}
                    className={`flex flex-col p-4 ${bgColor} rounded-xl shadow-sm cursor-pointer mb-3 w-full max-w-full overflow-hidden min-w-0`}
                    onClick={() => handleChatRoomClick(room.roomId)}
                  >
                    <div className="flex flex-1 items-center w-full min-w-0 max-w-full overflow-hidden">
                      {/* 채팅방 아바타 */}
                      <div className={`w-12 h-12 min-w-[3rem] rounded-full flex items-center justify-center text-white font-medium text-3xl flex-shrink-0`}>
                        💬
                      </div>
                      
                      <div className="ml-4 flex-1 min-w-0 overflow-hidden">
                        {/* 채팅방 이름과 최근 메시지 시간 */}
                        <div className="flex justify-between items-center w-full">
                          <h3 className="text-[18px] font-bold text-gray-800 truncate mr-2">{room.chatRoomName}</h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                            {room.latestChatLog ? formatDate(room.latestChatLog.createdAt) : formatDate(null)}
                          </span>
                        </div>
                        
                        {/* 최근 메시지 */}
                        {/* <div className="w-full overflow-hidden">
                          <p className="text-sm text-gray-600 mt-1 truncate">{latestMessage}</p>
                        </div> */}
                        {/* <div className="w-full min-w-0 overflow-hidden"> */}
                        <div className="w-full min-w-0 max-w-full">
                          <p className="w-full text-sm text-gray-600 mt-1 truncate whitespace-nowrap">
                            {latestMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      {/* 참여자 아이콘 표시 - 참여자 성씨로 표시 */}
                      <div className="flex -space-x-2">
                        {/* 최대 3명까지 표시 */}
                        {room.peopleList.slice(0, 3).map((person, index) => {
                          // 참여자 이름에서 첫 글자(성)만 추출
                          const familyName = person.charAt(0);
                          return (
                            <div 
                              key={index} 
                              className={`w-6 h-6 rounded-full ${blueShades[(colorIndex + index + 1) % blueShades.length]} flex items-center justify-center text-white text-xs border-2 border-blue-50 shadow-sm`}
                            >
                              {familyName}
                            </div>
                          );
                        })}
                        
                        {/* 추가 참여자가 있는 경우 */}
                        {room.peopleList.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs border-2 border-blue-50 shadow-sm">
                            +{room.peopleList.length - 3}
                          </div>
                        )}
                      </div>
                      
                      {/* 인원 수 */}
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">인원 수:</span>
                        <span className="text-sm font-semibold text-gray-800 ml-1">{room.totalPeople}명</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="inline-block text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">오류가 발생했습니다</h3>
            <p className="text-red-500 mb-4" style={{ whiteSpace: "pre-wrap" }}>
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoomList;