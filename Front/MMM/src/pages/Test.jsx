// DisplayPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const Test = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // testpage 데이터 호출 함수
  const fetchData = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BASE_URL + "/saving/testpage",
        { withCredentials: true }
      );
      if (response.status === 200) {
        setData(response.data);
      }
    } catch (err) {
      setError("데이터 불러오기 실패");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 호출
  useEffect(() => {
    fetchData();
  }, []);

  // test 버튼 클릭 시 처리 함수
  const handleTestButton = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_BASE_URL + "/saving/testpage", { withCredentials: true });
      if (response.status === 200) {
        // test 요청 성공 시, 데이터를 새로고침
        setLoading(true);
        fetchData();
      }
    } catch (err) {
      console.error("Test API 호출 실패", err);
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>오류: {error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>계좌 정보 페이지</h1>
      {/* test 버튼 */}
      <button onClick={handleTestButton} style={{ marginBottom: "20px" }}>
        test
      </button>
      {data.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            marginBottom: "20px",
            padding: "10px",
          }}
        >
          {/* 저축 계좌 정보 */}
          <section>
            <h2>저축 계좌</h2>
            <p>계좌번호: {item.savingAccount.accountNumber}</p>
            <p>저축액: {item.savingAccount.amount}</p>
            <p>잔액: {item.accountInSavingAccount.balance}</p>
            <p>은행: {item.accountInSavingAccount.bank}</p>
            <p>유형: {item.savingAccount.type ? "true" : "false"}</p>
            <p>미수금: {item.savingAccount.misugeum}</p>
            <p>일시정지: {item.savingAccount.pause ? "true" : "false"}</p>
            <p>완료: {item.savingAccount.completed ? "true" : "false"}</p>
          </section>
          {/* 저축 거래 내역 */}
          <br />
          <section>
            <h2>저축 거래 내역</h2>
            <br />
            {item.savingTransactions.map((transaction) => (
              <div
                key={transaction.id}
                style={{ borderBottom: "1px solid #ccc", marginBottom: "10px" }}
              >
                <p></p>
                <p>금액: {transaction.amount}</p>
                <p>생성일: {transaction.createdAt}</p>
              </div>
            ))}
          </section>
          {/* 지출 계좌 정보 */}
          <section>
            <h2>지출 계좌</h2>
            <p>이름: {item.spendingAccount.name}</p>
            <p>계좌번호: {item.spendingAccount.accountNumber}</p>
            <p>잔액: {item.accountInSpendingAccount.balance}</p>
            <p>은행: {item.spendingAccount.bank}</p>
          </section>
          {/* 지출 거래 내역 */}
          <br />
          <section>
            <h2>지출 거래 내역</h2>
            <br />
            {item.spendingTransactions.map((transaction) => (
              <div
                key={transaction.id}
                style={{ borderBottom: "1px solid #ccc", marginBottom: "10px" }}
              >
                <p>카테고리: {transaction.category}</p>
                <p>금액: {transaction.amount}</p>
                <p>항목: {transaction.item}</p>
                <p>생성일: {transaction.createdAt}</p>
              </div>
            ))}
          </section>
          {/* 저축 절약 정보 */}
          <section>
            <h2>저축 절약 정보</h2>
            {item.absSavings.map((saving) => (
              <div
                key={saving.id}
                style={{ borderBottom: "1px solid #ccc", marginBottom: "10px" }}
              >
                <p>최대 금액: {saving.maxAmount}</p>
                <p>저축 금액: {saving.savingAmount}</p>
                <p>활성화: {saving.active ? "true" : "false"}</p>
              </div>
            ))}
          </section>
          {/* 기타 정보 */}
          <section>
            <h2>기타 정보</h2>
            <p>savingPercents: {JSON.stringify(item.savingPercents)}</p>
            <p>maxMin: {item.maxMin ? JSON.stringify(item.maxMin) : "null"}</p>
            <p>moneyFlow ID: {item.moneyFlow.id}</p>
            <p>savingOption ID: {item.savingOption.id}</p>
            <p>savingType: {item.savingOption.savingType}</p>
            <div>
              <p>accountInSpendingAccount:</p>
              {item.accountInSpendingAccount && (
                <div style={{ marginLeft: "20px" }}>
                  <p>계좌번호: {item.accountInSpendingAccount.accountNumber}</p>
                  <p>잔액: {item.accountInSpendingAccount.balance}</p>
                  <p>은행: {item.accountInSpendingAccount.bank}</p>
                </div>
              )}
            </div>
            <div>
              <p>accountInSavingAccount:</p>
              {item.accountInSavingAccount && (
                <div style={{ marginLeft: "20px" }}>
                  <p>계좌번호: {item.accountInSavingAccount.accountNumber}</p>
                  <p>잔액: {item.accountInSavingAccount.balance}</p>
                  <p>은행: {item.accountInSavingAccount.bank}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      ))}
    </div>
  );
};

export default Test;
