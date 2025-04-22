import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChatRoom = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [userName, setUserName] = useState("");
    const [userId, setUserId] = useState("");
    const roomId = location.state?.roomId;
    const messagesEndRef = useRef(null);

    // const checkNow = new Date();
    // console.log(checkNow);

    // 채팅방 이름 변경
    const [roomName, setRoomName] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [nameError, setNameError] = useState("");

    const [showMenu, setShowMenu] = useState(false); // 메뉴
    const [isConfirmingExit, setIsConfirmingExit] = useState(false); // 채팅방 나가기

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserId(user.userId);
            setUserName(user.name);
        }

        const fetchChatLogs = async () => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}/chat/logs`,
                    { roomId },
                    { withCredentials: true }
                );
                console.log(response)
                console.log("roomId = ", roomId)
                const formattedMessages = response.data.chatLogs.map(msg => {
                    const [date, time] = msg.createdAt.split(" ");
                    return {
                        ...msg,
                        sender: msg.name,
                        createdAt: time,
                        dateOnly: date,
                    };
                }).reverse();
                setMessages(formattedMessages);

                // 채팅방 이름 설정
                if (response.data.roomName) {
                    setRoomName(response.data.roomName);
                    setNewRoomName(response.data.roomName);
                }
            } catch (error) {
                console.error("❌ 채팅 로그 불러오기 실패:", error);
            }
        };

        fetchChatLogs();

        const socket = new SockJS(import.meta.env.VITE_BASE_URL + "/ws-stomp");
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/sub/chat/${roomId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    const now = new Date();
                    const nowTime = now.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    });
                    const nowDate = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                    const newMessage = {
                        ...receivedMessage,
                        createdAt: nowTime,
                        dateOnly: nowDate,
                    };

                    setMessages((prev) => [...prev, newMessage]);
                });
            },
            onStompError: (frame) => {
                console.error("❌ STOMP 오류:", frame);
            },
        });

        client.activate();
        setStompClient(client);

        return () => {
            if (client) client.deactivate();
        };
    }, [roomId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatMessage = (text) => {
        if (!text) return '';
        
        // 쉼표가 있거나 없는 숫자+"원" 패턴을 찾아서 강조
        const numericPattern = /([\d,]+)([원])/g;
        
        return text.replace(numericPattern, (match, numbers, unit) => {
            // 먼저 쉼표 제거
            const cleanNumber = numbers.replace(/,/g, '');
            // 천 단위 구분자 추가
            const formattedNumber = cleanNumber.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            // 숫자+"원" 색상 강조
            return `<span style="color: #F9A825; font-weight: bold;">${formattedNumber}${unit}</span>`;
        });
    };
    

    const sendMessage = () => {
        if (stompClient && stompClient.connected && message.trim() !== "") {
            const now = new Date();
                const nowTime = now.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                });
            const nowDate = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            const messageObj = {
                type: "TALK",
                roomId,
                sender: userName,
                message,
                userId,
                createdAt: nowTime,
                dateOnly: nowDate,
            };

            stompClient.publish({
                destination: "/pub/messages",
                body: JSON.stringify(messageObj),
            });

            // setMessages((prev) => [...prev, messageObj]);
            setMessage("");
        }
    };

    const handleExit = () => {
        navigate('/chat/ChatRoomList');
    };

    // 채팅방 이름 수정
    const editingRoomName = () => {
        setIsEditingName(true);
        setNewRoomName(roomName);
        setNameError("");
    }

    // 채팅방 이름 수정 취소
    const cancelEditingRoomName = () => {
        setIsEditingName(false);
        setNewRoomName(roomName);
        setNameError("");
    }

    // 채팅방 이름 수정 요청 전송
    const requestRoomNameChange = async () => {
        if (!newRoomName.trim()) {
            setNameError("채팅방 이름은 빈칸이 될 수 없습니다.");
            return;
        }

        axios
            .post(import.meta.env.VITE_BASE_URL + "/chat/change-roomname",
            {
                roomId: roomId,
                roomName: newRoomName.trim()
            },
            { withCredentials: true }
        )
        .then((response) => {
            console.log("채팅방 생성 response: " + response)
            if (response.status === 200) {
                setRoomName(newRoomName.trim());
                setIsEditingName(false);
            }
        })
        .catch((error) => {
            console.error("채팅방 이름 변경 실패: ", error);
            setNameError("채팅방 이름 변경에 실패했습니다. 다시 시도해주세요.")
        })
    }

    // 채팅방 나가기 확인 모달
    const showExitConfirm = () => {
        setIsConfirmingExit(true);
        setShowMenu(false);
    }

    // 채팅방 나가기 확인 취소
    const cancelExit = () => {
        setIsConfirmingExit(false);
    }

    // 채팅방 나가기
    const confirmExit = () => {
        axios
            .delete(import.meta.env.VITE_BASE_URL + "/chat", {
                data: {
                    roomId: roomId
                },
                withCredentials: true
            })
            .then((response) => {
                if (response.status === 200) {
                    navigate("/chat/chatRoomList");
                }
            })
            .catch((error) => {
                console.error("채팅방 나가기 실패: ", error);
                setIsConfirmingExit(false);
            })
    }

    const KebabMenu = ({ onClick }) => (
        <div style={styles.kebabMenu} onClick={onClick}>
            <div style={styles.kebabDot}></div>
            <div style={styles.kebabDot}></div>
            <div style={styles.kebabDot}></div>
        </div>
    );

    const menuRef = useRef(null);

    // 외부 클릭 감지 이벤트 리스너 추가
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }

        // 메뉴가 표시되어 있을 때만 이벤트 리스너 추가
        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        
        // cleanup 함수
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    return (
        <div style={styles.chatContainer}>
            <div style={styles.header}>
            <div style={styles.backButton} onClick={handleExit}>
                <img src="/buttonIcons/backIcon.png" alt="뒤로가기" style={styles.backIcon} />
            </div>
            <div style={styles.roomName}>{roomName}</div>
            <div style={styles.kebabContainer}>
                <KebabMenu onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                }} />
            </div>
                
                {/* 드롭다운 메뉴 */}
                {showMenu && (
                    <div 
                        ref={menuRef}
                        style={styles.menuDropdown} 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={styles.menuItem} onClick={editingRoomName}>
                            채팅방 이름 변경
                        </div>
                        <div style={styles.menuItem} onClick={showExitConfirm}>
                            채팅방에서 나가기
                        </div>
                    </div>
                )}
            </div>

            {/* 채팅방 이름 변경 모달 */}
            {isEditingName && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>채팅방 이름 변경</h3>
                        <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            style={styles.modalInput}
                            placeholder="새 채팅방 이름"
                            autoFocus
                        />
                        {nameError && <p style={styles.errorText}>{nameError}</p>}
                        <div style={styles.modalButtons}>
                            <button 
                                onClick={cancelEditingRoomName} 
                                style={styles.modalCancelButton}
                            >
                                취소
                            </button>
                            <button 
                                onClick={requestRoomNameChange} 
                                style={styles.modalConfirmButton}
                            >
                                변경
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 채팅방 나가기 확인 모달 */}
            {isConfirmingExit && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>채팅방 나가기</h3>
                        <p style={styles.modalText}>정말로 채팅방을 나가시겠습니까?</p>
                        <div style={styles.modalButtons}>
                            <button 
                                onClick={cancelExit} 
                                style={styles.modalCancelButton}
                            >
                                취소
                            </button>
                            <button 
                                onClick={confirmExit} 
                                style={styles.modalConfirmButton}
                            >
                                나가기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.chatBox}>
                {(() => {
                    let lastDate = null;
                    return messages.map((msg, index) => {
                        const isMyMessage = msg.userId === userId;
                        const showDateSeparator = msg.dateOnly !== lastDate;
                        lastDate = msg.dateOnly;

                        return (
                            <React.Fragment key={index}>
                                {showDateSeparator && (
                                    <div style={styles.dateSeparator}>
                                        {msg.dateOnly}
                                    </div>
                                )}
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: isMyMessage ? "flex-end" : "flex-start",
                                        marginBottom: "12px",
                                    }}
                                >
                                    {!isMyMessage && (
                                        <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "4px", color: "#444" }}>
                                            {msg.sender}
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: isMyMessage ? "row-reverse" : "row",
                                            alignItems: "flex-end",
                                        }}
                                    >
                                    <div
                                        style={{
                                            padding: "12px 14px",
                                            borderRadius: "18px",
                                            backgroundColor: isMyMessage ? "#007AFF" : "#E5E5EA", 
                                            color: isMyMessage ? "white" : "black",
                                            fontSize: "14px",
                                            whiteSpace: "pre-wrap",
                                            maxWidth: "280px",
                                            wordBreak: "break-word",
                                        }}
                                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.message) }}
                                    />

                                        <div
                                            style={{
                                                fontSize: "11px",
                                                color: "#888",
                                                margin: isMyMessage ? "0 8px 2px 0" : "0 0 2px 8px",
                                                alignSelf: "flex-end",
                                            }}
                                        >
                                            {msg.createdAt}
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    });
                })()}
                <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputContainer}>
                <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    placeholder="메시지를 입력하세요..."
                    style={styles.input}
                />
                <button onClick={sendMessage} style={styles.sendButton}>전송</button>
            </div>
        </div>
    );
};

const styles = {
    chatContainer: {
        width: "100%",
        height: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f5f5",
    },
    header: {
        height: "60px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 15px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #ddd",
        position: "relative",
    },
    backButton: {
        fontSize: "24px",
        fontWeight: "bold",
        cursor: "pointer",
        width: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    backIcon: {
        width: "20px",
        height: "20px",
        objectFit: "contain",
    },
    // exitButton: {
    //     padding: "8px 12px",
    //     backgroundColor: "#ff4d4d",
    //     color: "white",
    //     border: "none",
    //     borderRadius: "6px",
    //     cursor: "pointer",
    // },
    chatBox: {
        flex: 1,
        overflowY: "auto",
        padding: "10px",
    },
    inputContainer: {
        height: "60px",
        display: "flex",
        padding: "10px",
        backgroundColor: "white",
        borderTop: "1px solid #ddd",
    },
    input: {
        flex: 1,
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "20px",
        fontSize: "14px",
    },
    sendButton: {
        marginLeft: "10px",
        padding: "10px 15px",
        backgroundColor: "#007AFF",
        color: "white",
        border: "none",
        borderRadius: "20px",
        cursor: "pointer",
    },
    dateSeparator: {
        textAlign: "center",
        margin: "20px 0 10px",
        color: "#999",
        fontSize: "13px",
    },
    roomName: {
        fontSize: "18px",
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
        marginRight: "19px"
    },
    headerActions: {
        display: "flex",
        alignItems: "center",
    },
    kebabContainer: {
        width: "30px",
        display: "flex",
        justifyContent: "flex-end",
        marginRight: "-19px"
    },
    kebabMenu: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        height: "20px",
        width: "20px",
        marginRight: "15px",
        cursor: "pointer",
    },
    kebabDot: {
        width: "4px",
        height: "4px",
        borderRadius: "50%",
        backgroundColor: "#555",
    },
    menuDropdown: {
        position: "absolute",
        top: "55px",
        right: "10px",
        backgroundColor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        overflow: "hidden",
        zIndex: 10,
    },
    menuItem: {
        padding: "12px 16px",
        fontSize: "14px",
        cursor: "pointer",
        transition: "background-color 0.2s",
        "&:hover": {
            backgroundColor: "#f5f5f5",
        },
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
    },
    modal: {
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "20px",
        width: "85%",
        maxWidth: "350px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    },
    modalTitle: {
        margin: "0 0 15px 0",
        fontSize: "18px",
        fontWeight: "bold",
        textAlign: "center",
    },
    modalText: {
        margin: "0 0 20px 0",
        fontSize: "15px",
        textAlign: "center",
        color: "#444",
    },
    modalInput: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "14px",
        marginBottom: "15px",
        boxSizing: "border-box",
    },
    errorText: {
        color: "#ff4d4d",
        fontSize: "12px",
        marginTop: "-10px",
        marginBottom: "15px",
    },
    modalButtons: {
        display: "flex",
        justifyContent: "space-between",
    },
    modalCancelButton: {
        flex: "1",
        padding: "10px",
        marginRight: "8px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "white",
        fontSize: "14px",
        cursor: "pointer",
    },
    modalConfirmButton: {
        flex: "1",
        padding: "10px",
        marginLeft: "8px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#007AFF",
        color: "white",
        fontSize: "14px",
        cursor: "pointer",
    },
};

export default ChatRoom;
