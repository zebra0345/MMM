import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion"; // framer-motion 추가

const SelectAccount = () => {
  const nav = useNavigate();

  const [accountList, setAccountList] = useState({ accounts: [] });
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  const data = JSON.parse(localStorage.getItem("savingData")) || {};

  // 계좌 조회
  const onGetAccountList = () => {
    axios
      .get(import.meta.env.VITE_BASE_URL + "/account", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
      .then((res) => {
        setAccountList(res.data);
        setIsLoading(false); // 계좌 로딩 완료 후 로딩 상태 false로 변경
      })
      .catch((err) => {
        console.log("계좌 리스트 가져오기 에러 :", err);
        setIsLoading(false); // 에러가 발생해도 로딩 상태 false로 변경
      });
  };

  // 저축 생성
  const onPostSaving = (e) => {
    e.preventDefault();
    const formData = new FormData();

    // 선택한 계좌 확인
    if (!selectedAccount) {
      console.log("계좌를 선택해주세요!");
      return;
    }

    // 백엔드에서 요구하는 형식에 맞춰 데이터 추가
    formData.append("savingAccountNumber", selectedAccount.accountNumber);
    formData.append("savingType", JSON.stringify(data.savingType));

    console.log("보낼 데이터 확인:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    axios
      .post(import.meta.env.VITE_BASE_URL + "/saving/choice", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      })
      .then((res) => {
        console.log("저축 생성 성공 :", res.data);
        nav("/");
      })
      .catch((err) => {
        console.error("저축 생성 실패 :", err.response?.data || err);
      });
  };

  const onSelectAccount = (account) => {
    setSelectedAccount((prev) => (prev?.id === account.id ? null : account)); // 선택/해제 토글
  };

  useEffect(() => {
    onGetAccountList();
  }, []);

  useEffect(() => {
    console.log("데이터 :", data);
    console.log("선택된 계좌 :", selectedAccount);
  }, [selectedAccount]);

  return (
    <div className="min-h-0 flex flex-col overflow-hidden flex-1">
      <div className="flex py-20 bg-blue-400 items-center justify-center mb-10 px-8">
        <div className="flex items-center w-full max-w-screen-lg justify-between text-center -mt-10">
          <span className="text-lg text-gray-300">벌금 및 그룹채팅</span>
          <div className="flex-1 h-[1px] bg-gray-300 mx-2"></div> {/* 선 */}
          <span className="text-lg text-gray-300">벌금 옵션 선택</span>
          <div className="flex-1 h-[1px] bg-gray-300 mx-2"></div> {/* 선 */}
          <span className="text-lg text-white">계좌 선택</span>
        </div>
      </div>
      {/* 계좌 선택 영역 */}
      <div className="p-8 w-full mx-auto rounded-[60px] bg-white z-10 -mt-23 flex justify-center items-center flex-col overflow-hidden">
        <h1 className="bg-blue-100 rounded-2xl py-2 px-8 mb-5 text-2xl flex justify-center items-center max-w-[50vh]">
          벌금 입금 계좌 선택
        </h1>
        <div className="flex flex-col items-center overflow-y-auto no_scroll w-full min-h-0">
          {/* 계좌가 로딩 중일 때 표시할 메시지 */}
          {isLoading ? (
            <p className="text-2xl text-gray-500">
              계좌를 가져오고 있습니다...
            </p>
          ) : (
            accountList.accounts.map((account, index) => {
              const bankWithId = { ...account, id: index };
              return (
                <motion.div
                  key={index}
                  className={`flex items-center justify-between px-5 py-5 h- text-lg mt-3 rounded-3xl shadow-lg w-full max-w-[350px] ${
                    selectedAccount?.id === bankWithId.id
                      ? "bg-green-100 scale-105"
                      : "bg-blue-200"
                  }`}
                  onClick={() => onSelectAccount(bankWithId)}
                  initial={{ opacity: 0, y: -20 }} // 초기 상태
                  animate={{ opacity: 1, y: 0 }} // 렌더링될 때의 애니메이션
                  exit={{ opacity: 0, y: 20 }} // 항목이 사라질 때의 애니메이션
                  transition={{ duration: 0.5 }} // 애니메이션 지속 시간
                >
                  <div>은행 : {account.bank}</div>
                  <div className="text-lg">계좌 : {account.accountNumber}</div>
                </motion.div>
              );
            })
          )}

        </div>
        <form
          className="flex items-center px-5 h-10 mt-10 text-xl bg-blue-400 rounded-3xl shadow-xl"
          onSubmit={onPostSaving}
        >
          <button type="submit">선택 완료</button>
        </form>
      </div>
    </div>
  );
};

export default SelectAccount;
