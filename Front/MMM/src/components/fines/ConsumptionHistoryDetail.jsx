import axios from "axios";
import { useEffect, useState } from "react";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import FineDetail from "./FineDetail";

const ConsumptionHistoryDetail = ({ accountId, allData, detailData }) => {
  const [fineDetailData, setFineDetailData] = useState([]);
  const [loading, setLoading] = useState(true);
  const mySwal = withReactContent(Swal);

  // type == 0 -> 절대 금액, type == 1 -> 비율
  const type = detailData.savingType;

  const goFineDetail = () => {
    mySwal.fire({
      html: <FineDetail accountId={accountId} allData={allData} />,
      showConfirmButton: false,
    });
  };

  const onGetConsumptionHistoryDetail = () => {
    axios
      .get(import.meta.env.VITE_BASE_URL + "/saving/detailtransaction", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
      .then((res) => {
        setFineDetailData(res.data);
        setLoading(false);
        console.log("소비 내역 상세 정보 :", res.data);
      })
      .catch((err) => {
        console.log("소비 내역 상세 정보 에러 :", err);
      });
  };

  useEffect(() => {
    console.log("--------------------------");
    onGetConsumptionHistoryDetail();
    console.log("detailData :", detailData);
    console.log("fineDetailData :", fineDetailData);
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto max-h-[80vh] cursor-default select-none">
      <div className="flex items-center justify-center">
        <button onClick={goFineDetail} className="absolute left-8 top-8">
          <img src="/buttonIcons/backIcon.png" alt="뒤로가기 버튼" width={30} />
        </button>
        <h2 className="text-2xl mb-4 bg-blue-200 rounded-2xl py-2 px-4 shadow-lg ml-6">
          Today 내 소비 보기
        </h2>
      </div>

      {loading ? (
        <div className="text-center text-blue-500 text-lg mt-8 animate-pulse">
          데이터를 가져오고 있습니다...
        </div>
      ) : type === 1 ? (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
          <h3 className="text-xl text-blue-500 mb-5 text-center">
            벌금 방식: 비율
          </h3>
          <div className="space-y-6 max-h-[50vh] overflow-y-auto no_scroll overflow-x-hidden">
            {fineDetailData?.map((item, idx) => (
              <div
                key={idx}
                className="relative bg-blue-50 p-5 pt-3 rounded-lg border-l-4 border-blue-500 shadow-sm hover:bg-blue-100 transition-all"
              >
                <div className="flex justify-between mb-1 px-3 w-full">
                  <div className="w-full">
                    <p className="text-gray-500">품목</p>
                    <p className="overflow-x-hidden truncate">{item.item}</p>
                  </div>
                  <div className="w-full">
                    <p className="text-gray-500">금액</p>
                    <p className="overflow-x-hidden truncate">₩{item.amount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex justify-center flex-col gap-2">
                  <div className="bg-green-100 text-green-700 px-6 py-1 rounded-lg font-medium">
                    비율 {item.savingPercent.percent}%
                  </div>
                  <div className="bg-red-100 text-red-700 px-4 py-1 rounded-lg font-medium">
                    벌금 ₩{item.calculatedSpending.toLocaleString()}
                  </div>
                </div>
                <p className="absolute bottom-0 right-2 text-gray-500 text-sm">
                  {item.createdAt}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
          <h3 className="text-xl text-blue-500 mb-5 text-center">
            벌금 방식: 절대금액
          </h3>
          <div className="space-y-6">
            {fineDetailData?.map((item, idx) => (
              <div
                key={idx}
                className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm hover:bg-blue-100 transition-all"
              >
                <div className="flex justify-center gap-10 mb-3">
                  <div>
                    <p className="text-gray-500">품목</p>
                    <p>{item.item}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">금액</p>
                    <p>₩{item.amount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-2">
                  <div className="bg-green-100 text-green-700 px-6 py-2 rounded-lg font-medium">
                    적용된 절대금액
                    <div className="flex items-center justify-center">
                      ₩{item.absSavings.maxAmount.toLocaleString()}
                      <img src="/etc/upChart.gif" alt="상승" width={30} />
                    </div>
                  </div>
                  <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium">
                    벌금
                    <br /> ₩{item.calculatedSpending.toLocaleString()}
                  </div>
                  <p className="absolute bottom-0 right-2 text-gray-500 text-sm">
                    {item.createdAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumptionHistoryDetail;
