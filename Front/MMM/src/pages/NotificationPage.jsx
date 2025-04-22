import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [displayCount, setDisplayCount] = useState(10);
  const [itemsToRemove, setItemsToRemove] = useState([]);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = () => {
    setLoading(true);
    axios
      .get(import.meta.env.VITE_BASE_URL + "/fcm", {
        withCredentials: true,
      })
      .then((res) => {
        setNotifications(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("알림 불러오기 에러:", err);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 클릭 시 읽음 처리 + 네비게이트
  const handleNotificationClick = (notif) => {
    if (!notif.readStatus) {
      axios
        .patch(
          import.meta.env.VITE_BASE_URL + "/fcm",
          { id: notif.id },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
          }
        )
        .catch((err) => console.error("읽음 처리 에러:", err));
    }
    navigate(notif.clickAction);
  };

  // 체크박스 토글
  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 선택 삭제 - 애니메이션 추가
  const handleDeleteSelected = () => {
    // 애니메이션을 위해 삭제할 항목 표시
    setItemsToRemove(selectedIds);

    // 애니메이션 완료 후 실제 삭제 처리
    setTimeout(() => {
      Promise.all(
        selectedIds.map((id) =>
          axios.delete(import.meta.env.VITE_BASE_URL + "/fcm",
            {
              data: { id: [id] },
              headers: { "Content-Type": "application/json" },
              withCredentials: true
            }
          )
        )
      ).then(() => {
        setSelectedIds([]);
        setItemsToRemove([]);
        fetchNotifications();
      });
    }, 500); // 애니메이션 시간과 일치하게 설정
  };

  // 전체 삭제 - 애니메이션 추가
  const handleDeleteAll = () => {
    // 애니메이션을 위해 모든 항목을 삭제 대상으로 표시
    const allIds = notifications.map(notif => notif.id);
    setItemsToRemove(allIds);

    // 애니메이션 완료 후 실제 삭제 처리
    setTimeout(() => {
      axios
        .delete(import.meta.env.VITE_BASE_URL + "/fcm",
          {
            data: { id: allIds },
            headers: { "Content-Type": "application/json" },
            withCredentials: true
          }
        )
        .then(() => {
          setItemsToRemove([]);
          fetchNotifications();
        });
    }, 500); // 애니메이션 시간과 일치하게 설정
  };

  // 빈 상태나 로딩 중일 때만 다른 레이아웃 적용
  if (loading || error || notifications.length === 0) {
    return (
      // h-full 대신 min-h-[80vh]를 사용하여 최소 높이 설정
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        {loading ? (
          <img
            src="/loading.gif"
            alt="로딩 중"
            className="w-24 h-24"
          />
        ) : (
          <p className="text-gray-500 text-lg">알림이 없습니다</p>
        )}
      </div>
    );
  }

  // 알림이 있을 때의 레이아웃
  return (
    <div className="flex flex-col flex-1 min-h-0 px-4">
      {/* 액션 버튼 영역 */}
      <div className="flex-none flex justify-end w-full">
        <button
          onClick={handleDeleteSelected}
          disabled={selectedIds.length === 0}
          className="px-2 py-2 disabled:opacity-50"
        >
          선택 삭제
        </button>
        <button
          onClick={handleDeleteAll}
          className="px-2 py-2 rounded"
        >
          전체 삭제
        </button>
      </div>

      {/* 알림 리스트 영역 (스크롤 전용) */}
      <div
        ref={containerRef}
        className="flex-1 justify-start overflow-y-auto overflow-x-hidden no_scroll min-h-0"
      >
        <ul className="space-y-2 pb-16 no_scrollbar">
          {[
            // 원본 배열을 훼손하지 않기 위해 스프레드 연산자로 복사한 뒤
            ...notifications
          ]
            // createdAt을 Date 객체로 변환해 내림차순 정렬
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((notif) => (
              <li
                key={notif.id}
                className={`flex items-start p-3 px-5 rounded-lg
                  text-xl
                shadow-[0_4px_6px_-2px_rgba(3,3,2,0.5)]
                transition-all duration-500 ease-in-out
                ${itemsToRemove.includes(notif.id) ? 'transform -translate-x-full opacity-0' : ''}
                ${notif.readStatus
                    ? "bg-gray-200 text-gray-700"              // 읽음 상태면 무조건 회색
                    : notif.warn
                      ? "bg-red-500 text-white "      // 읽지 않았고 warn=true면 빨간색
                      : "bg-blue-500 text-white "     // 읽지 않았고 warn=false면 파란색
                  }`}
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleNotificationClick(notif)}
                >
                  <p className="truncate">{notif.title}</p>
                  <span className="text-xs whitespace-nowrap">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                  <p className="text-sm truncate">{notif.body}</p>
                </div>
                {/* 체크박스 추가 */}
                <label className="checkbox-container inline-flex items-center cursor-pointer my-auto">
                  <input
                    type="checkbox"
                    onChange={() => handleSelect(notif.id)}
                    checked={selectedIds.includes(notif.id)}
                  />
                  <span className="checkmark"></span>
                </label>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationPage;