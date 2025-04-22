import { useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import FineDetail from "./FineDetail";

const FineSetting = ({ absSaving, perSaving, accountId, allData }) => {
  const mySwal = withReactContent(Swal);

  const goFineDetail = () => {
    mySwal.fire({
      html: <FineDetail accountId={accountId} allData={allData} />,
      showConfirmButton: false,
    });
  };

  useEffect(() => {
    console.log("절대 금액 :", absSaving);
    console.log("비율 :", perSaving);
  }, []);

  const renderFixedAmountList = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
      {absSaving.map((item) => (
        <div
          key={item.id}
          className={`relative border border-gray-300 rounded-xl p-4 shadow-sm ${
            item.active ? "bg-white" : "bg-gray-100"
          }`}
        >
          <p className="border-b pb-2 mb-2">
            💸 기준 금액:{" "}
            <span className="font-semibold">
              {item.maxAmount.toLocaleString()}
            </span>
            원
          </p>
          <p>
            🔒 벌금 금액:{" "}
            <span className="font-semibold">
              {item.savingAmount.toLocaleString()}
            </span>
            원
          </p>
          {item.active ? (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs rounded-full p-1 shadow" />
          ) : (
            <div className="absolute top-2 right-2 bg-red-500 bolder text-white text-xs rounded-full p-1 shadow" />

          )}
        </div>
      ))}
    </div>
  );

  const renderPercentList = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
      {perSaving.map((item, idx) => (
        <div
          key={idx}
          className="border border-gray-300 rounded-xl p-4 bg-white shadow-sm"
        >
          <p className="border-b pb-2 mb-2">
            🏷️ 카테고리: <span className="font-semibold">{item.tag}</span>
          </p>
          <p>
            📊 벌금 비율: <span className="font-semibold">{item.percent}%</span>
          </p>
        </div>
      ))}
    </div>
  );

  const fineType =
    absSaving?.length > 0
      ? "고정 금액"
      : perSaving?.length > 0
      ? "비율"
      : "없음";

  return (
    <div className="p-4 max-w-3xl mx-auto max-h-[80vh] cursor-default select-none">
      <div className="flex items-center justify-center mb-4">
        <button onClick={goFineDetail} className="absolute left-8 top-8">
          <img src="/buttonIcons/backIcon.png" alt="뒤로가기 버튼" width={30} />
        </button>
        <h2 className="text-2xl">💰 벌금 설정</h2>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
        <p className="mb-3 py-2 bg-blue-200 rounded-xl">
          벌금 형식: <span className="text-green-600 ">{fineType}</span>
        </p>
        <div className="max-h-[50vh] overflow-y-auto no_scroll">
          {fineType === "고정 금액" && renderFixedAmountList()}
          {fineType === "비율" && renderPercentList()}
          {fineType === "없음" && <p>설정된 벌금 정보가 없습니다.</p>}
        </div>
      </div>
    </div>
  );
};

export default FineSetting;
