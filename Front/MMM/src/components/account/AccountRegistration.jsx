import { useState, useEffect } from "react";
import api from "../../axios";

const AccountRegistration = ({ onAccountsUpdate }) => {
  const [accounts, setAccounts] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState("");
  const [verifyNumber, setVerifyNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationRequested, setVerificationRequested] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/account");
      if (response.data.message === "success") {
        const accountsList = response.data.accounts || [];
        setAccounts(accountsList);
        // 상위 컴포넌트에 계좌 목록 업데이트 알림
        if (onAccountsUpdate) {
          onAccountsUpdate(accountsList);
        }
      }
    } catch (error) {
      console.error("계좌 조회 오류:", error);
      setMessage("계좌 정보를 불러오는 중 오류가 발생했습니다.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 계좌 인증 요청
  const handleRequestVerification = async (e) => {
    e.preventDefault();

    if (!accountNumber || !bank) {
      setMessage("은행과 계좌번호를 입력해주세요.");
      setIsSuccess(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/account/verify-request", {
        accountNumber,
      });

      if (response.data.message === "success") {
        setVerificationRequested(true);
        setIsSuccess(true);
        setMessage("인증번호가 발송되었습니다. 인증번호를 입력해주세요.");
      } else {
        setIsSuccess(false);
        setMessage("계좌 인증 요청에 실패했습니다.");
      }
    } catch (error) {
      console.error("계좌 인증 요청 오류:", error);
      setIsSuccess(false);
      setMessage("계좌 인증 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 계좌 인증 확인
  const handleVerifyAccount = async (e) => {
    e.preventDefault();

    if (
      !verifyNumber ||
      verifyNumber.length !== 6 ||
      !/^\d+$/.test(verifyNumber)
    ) {
      setMessage("올바른 6자리 인증번호를 입력해주세요.");
      setIsSuccess(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post(
        `/account/verify-response?verifyNumber=${verifyNumber}`,
        {
          accountNumber,
        }
      );

      if (response.data.message === "success") {
        // 계좌 등록 요청
        await registerAccount();
      } else {
        setIsSuccess(false);
        setMessage("인증번호가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("계좌 인증 확인 오류:", error);
      setIsSuccess(false);
      setMessage("계좌 인증 확인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 계좌 등록
  const registerAccount = async () => {
    try {
      const response = await api.post("/account");

      if (response.data.message === "success") {
        setIsSuccess(true);
        setMessage("계좌가 성공적으로 등록되었습니다.");
        setShowAccountModal(false);

        // 계좌 목록 다시 불러오기
        await fetchAccounts();

        // 입력 필드 초기화
        resetAccountForm();
      } else {
        setIsSuccess(false);
        setMessage("계좌 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("계좌 등록 오류:", error);
      setIsSuccess(false);
      setMessage("계좌 등록 중 오류가 발생했습니다.");
    }
  };

  const resetAccountForm = () => {
    setAccountNumber("");
    setBank("");
    setVerifyNumber("");
    setVerificationRequested(false);
    setMessage("");
  };

  const navigateToAccountList = () => {
    // 계좌 목록 페이지로 이동하는 로직은 상위 컴포넌트에서 처리
    if (onAccountsUpdate) {
      onAccountsUpdate(accounts, true);
    }
  };

  const banks = [
    "KB국민은행",
    "신한은행",
    "우리은행",
    "하나은행",
    "SC제일은행",
    "농협은행",
    "기업은행",
    "카카오뱅크",
    "토스뱅크",
    "케이뱅크",
  ];

  return (
    <div>
      {/* 계좌 정보 섹션 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500">계좌 정보</p>
          <button
            className="text-blue-500 text-sm"
            onClick={() => setShowAccountModal(true)}
          >
            + 계좌 등록
          </button>
        </div>

        {accounts.length > 0 ? (
          <div className="space-y-2">
            {accounts.map((account, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">{account.bank}</p>
                <p className="text-gray-700">{account.accountNumber}</p>
              </div>
            ))}
            {accounts.length > 2 && (
              <button
                className="w-full text-blue-500 text-sm py-2"
                onClick={navigateToAccountList}
              >
                전체 계좌 보기
              </button>
            )}
          </div>
        ) : (
          <p className="text-gray-700">등록된 계좌가 없습니다.</p>
        )}
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div
          className={`mb-4 p-2 rounded-lg ${
            isSuccess
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      {/* 계좌 등록 모달 */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">계좌 등록</h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowAccountModal(false);
                  resetAccountForm();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {!verificationRequested ? (
              <form onSubmit={handleRequestVerification}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    은행
                  </label>
                  <select
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    required
                  >
                    <option value="">은행을 선택하세요</option>
                    {banks.map((bankName, index) => (
                      <option key={index} value={bankName}>
                        {bankName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    계좌번호
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={accountNumber}
                    onChange={(e) =>
                      setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="'-' 없이 숫자만 입력"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white p-3 rounded-lg disabled:bg-blue-300"
                  disabled={isLoading || !accountNumber || !bank}
                >
                  {isLoading ? "인증번호 요청 중..." : "인증번호 요청"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAccount}>
                <div className="mb-4">
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">{bank}</span> 계좌{" "}
                    <span className="font-medium">{accountNumber}</span>
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    입력하신 계좌로 인증번호가 발송되었습니다. 인증번호를
                    입력해주세요.
                  </p>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    인증번호 (6자리)
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={verifyNumber}
                    onChange={(e) =>
                      setVerifyNumber(
                        e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
                      )
                    }
                    placeholder="인증번호 6자리"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg"
                    onClick={() => {
                      setVerificationRequested(false);
                      setVerifyNumber("");
                    }}
                  >
                    이전
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white p-3 rounded-lg disabled:bg-blue-300"
                    disabled={isLoading || verifyNumber.length !== 6}
                  >
                    {isLoading ? "인증 중..." : "인증 완료"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountRegistration;
