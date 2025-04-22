import axios from "axios";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const SelectGoalAccount = () => {
  const nav = useNavigate();

  const [accountList, setAccountList] = useState({ accounts: [] });
  const [selectedAccount, setSelectedAccount] = useState(null);

  const data = JSON.parse(localStorage.getItem("savingData")) || {};

  // data에 선택 계좌 id 넣기

  // 계좌 조회
  const onGetAccountList = () => {
    axios
      .get(import.meta.env.VITE_BASE_URL + "/account", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
      .then((res) => {
        setAccountList(res.data);
        console.log(res)
        console.log("계좌 리스트 :", accountList);
      })
      .catch((err) => {
        console.log("계좌 리스트 가져오기 에러 :", err);
      });
  };

  const onSelectAccount = (account) => {
    setSelectedAccount((prev) => (prev?.id === account.id ? null : account)); // 선택/해제 토글
  };

  const onGoJointSaving = () => {
    nav("/saving/jointSaving");
  };

  useEffect(() => {
    onGetAccountList();
    console.log("데이터 :", data);
    console.log("선택된 계좌 :", selectedAccount);
    if (selectedAccount) {
      data.savingAccountId = selectedAccount.accountId;
      data.savingAccount = selectedAccount.accountNumber;
      data.type = true;
      localStorage.setItem("savingData", JSON.stringify(data)); // 로컬스토리지에 저장
    }
  }, [selectedAccount]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col py-20 bg-blue-400 items-center justify-center">
        <h1 className="text-3xl font-bold text-white -mt-12">계좌 선택</h1>
      </div>
      {/* 계좌 선택 영역 */}
      <div className="p-8 w-full mx-auto rounded-[60px] bg-white shadow-lg z-10 -mt-13">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-10">입금 계좌 선택</h1>

          {/* 벌금 계좌 선택 */}
          {accountList.accounts.map((account, index) => {
            const bankWithId = { ...account, id: index };
            return (
              <div
                key={index}
                className={`flex items-center px-5 h-15 text-xl  mt-3 rounded-3xl shadow-lg font-bold ${
                  selectedAccount?.id === bankWithId.id
                    ? "bg-green-100 scale-105"
                    : "bg-blue-200"
                }`}
                onClick={() => onSelectAccount(bankWithId)}
              >
                <div>은행 : {account.bank}</div>
                <div className="ml-10 text-lg">
                  계좌 : {account.accountNumber}
                </div>
              </div>
            );
          })}
          <div className="flex items-center px-5 h-10 mt-10 text-xl bg-blue-400 rounded-3xl shadow-xl">
            <button onClick={onGoJointSaving}>선택 완료</button>
          </div>
        </div>
      </div>
      -
    </div>
  );
};

export default SelectGoalAccount;
