import axios from "axios";

import { useState, useEffect } from "react";

const AccountList = ({ selectedAccount, onSelect }) => {
  const [accountList, setAccountList] = useState({ accounts: [] });

  const onGetAccountList = () => {
    axios
      .get(import.meta.env.VITE_BASE_URL + "/account", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
      .then((res) => {
        setAccountList(res.data);
      })
      .catch((err) => {
        console.log("계좌 리스트 가져오기 에러 :", err);
      });
  };

  useEffect(() => {
    onGetAccountList();
    console.log(accountList);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 px-5 justify-center items-center">
      {accountList.accounts.map((bank, index) => {
        const bankWithId = { ...bank, id: index }; // ✅ 각 계좌에 고유한 id 추가
        return (
          <div
            key={index} // ✅ key는 index를 사용 (고유 id가 없으므로)
            className={`flex items-center p-3 border w-80 rounded-lg shadow-sm cursor-pointer transition-all duration-200
        ${
          selectedAccount?.id === bankWithId.id
            ? "bg-green-100 scale-105"
            : "bg-white"
        }`}
            onClick={() => onSelect(bankWithId)} // ✅ id가 추가된 bankWithId를 넘김
          >
            <div className="flex-1">
              <p className="text-md font-semibold">{bank.bank}</p>
              <p className="text-sm text-gray-600">{bank.accountNumber}</p>
            </div>
            {selectedAccount?.id === bankWithId.id && (
              <span className="text-green-500 text-xl">✅</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AccountList;
