import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccountList from "../../components/AccountList";

const SelectWithdrawalAccount = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);

  const nav = useNavigate();

  const handleSelectAccount = (account) => {
    setSelectedAccount((prev) => (prev?.id === account.id ? null : account)); // 선택/해제 토글
  };

  const handleConfirmSelection = () => {
    if (!selectedAccount) {
      alert("출금 계좌를 선택해주세요!"); // 선택되지 않았을 때 알림
      return;
    }

    localStorage.setItem("출금 계좌", JSON.stringify(selectedAccount)); // 로컬스토리지 저장
    alert(
      `출금 계좌가 저장되었습니다!\n\n은행: ${selectedAccount.bank}\n계좌번호: ${selectedAccount.accountNumber}`
    );
    nav(-1); // 다음 페이지로
  };

  useEffect(() => {
    if (selectedAccount) {
      const savingData = JSON.parse(localStorage.getItem("savingData")) || {};
      savingData.selectedWithdrawalAccount = selectedAccount; // 기존 데이터에 추가
      localStorage.setItem("savingData", JSON.stringify(savingData)); // 저장
    }
    console.log(selectedAccount);
  }, [selectedAccount]);

  return (
    <div className="flex flex-col gap-4 p-4 justify-center items-center">
      <h2 className="text-lg font-bold">출금 계좌 선택</h2>
      <AccountList
        selectedAccount={selectedAccount}
        onSelect={handleSelectAccount}
      />
      <button
        className="w-40 py-3 text-white bg-blue-500 rounded-lg mt-4 hover:bg-blue-600 transition"
        onClick={handleConfirmSelection}
      >
        선택 완료
      </button>
    </div>
  );
};

export default SelectWithdrawalAccount;
