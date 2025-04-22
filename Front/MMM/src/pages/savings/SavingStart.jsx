import axios from "axios";

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const SavingStart = () => {
  const [savingListData, setSavingListData] = useState([]);

  const onGetSavingList = () => {
    axios
      .get(import.meta.env.VITE_BASE_URL + "/saving", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
      .then((res) => {
        setSavingListData(res.data);
        console.log("저축 리스트 내용 :", res.data);
        console.log("SavingListData :", savingListData);
      })
      .catch((err) => {
        console.log("저축 리스트 가져오기 에러 :", err);
      });
  };

  useEffect(() => {
    onGetSavingList();
  }, []);

  return (
    <div className="min-h-0 flex flex-col">
      <div className="flex py-20 bg-blue-400 flex items-center justify-center">
        <h1 className="text-3xl font-bold text-white -mt-15">저 축</h1>
      </div>
      <div className="p-8 w-full mx-auto rounded-[60px] bg-white shadow-lg z-10 -mt-15">
        <div className="flex flex-col items-center">
          <h2 className="font-bold">현재 저축</h2>
          <hr className="w-70 border-black opacity-20 my-6 border-t-2" />

          {/* 받은 데이터 map 돌리는 곳 */}
          {savingListData.map((data, index) => (
            <div
              key={index}
              className="p-6 w-full mx-auto rounded-lg bg-blue-300 shadow-lg z-10 my-10"
            >
              <h1 className="text-sm bg-gray-100 w-20 py-1 mb-2 -mt-4 px-2 rounded-full mx-auto text-center block">
                {data.savingAccount.type ? "공동 저축" : "강제 저축"}
              </h1>

              <div className="flex items-center">
                {/* 왼쪽: 이미지 */}
                <div className="flex flex-col items-center">
                  이미지
                  <div className="flex flex-col items-center mt-4">
                    <p className="text-gray-500">목표 물품</p>
                    {/* 목표 물건 이름 */}
                    <p className="text-[10px] font-bold">
                      {data.userGoal.item}
                    </p>
                  </div>
                </div>

                {/* 왼쪽 오른쪽 구분 선 */}
                <div className="w-[1px] bg-white h-50 ml-5 mx-2"></div>

                {/* 오른쪽: 계좌 정보 */}
                <div className="ml-6 flex flex-col justify-between h-full">
                  {/* 출금 계좌 */}
                  <div className="flex flex-col items-center bg-blue-200 py-1 px-3 rounded-lg">
                    <div className="flex items-center">
                      은행 이미지
                      <div className="ml-3 py-1">
                        <p className="text-red-500 font-bold">출금</p>
                        <p className="text-gray-700">
                          {data.spendingAccount.bank}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-[15px]">
                      {data.spendingAccount.accountNumber}
                    </p>
                  </div>

                  <hr className="border-gray-300 my-3 w-full" />

                  {/* 입금 계좌 */}
                  <div className="flex flex-col items-center bg-blue-200 py-1 px-3 rounded-lg">
                    <div className="flex items-center">
                      은행 이미지
                      <div className="ml-3 py-1">
                        <p className="text-blue-500 font-bold">입금</p>
                        <p className="text-gray-700">
                          {data.savingAccount.bank}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-[15px]">
                      {data.savingAccount.accountNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 등록된 계좌가 없을 때 */}
          {!savingListData && (
            <p className="text-gray-500 opacity-70 my-5">
              등록된 계좌가 없습니다...
            </p>
          )}
          {/* 저축 시작 버튼 */}
          <Link
            to={"/saving/selectSavingMethod"}
            className="flex items-center justify-center rounded-full bg-blue-400 h-12 w-40 my-5 
             text-white font-semibold transition-all duration-200 ease-in-out
             hover:bg-blue-500 hover:shadow-lg active:bg-blue-600 active:scale-95"
          >
            <p>저축 시작하기</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SavingStart;
