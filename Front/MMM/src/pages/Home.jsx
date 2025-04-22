import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useUser } from "../context/UserContext.jsx";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import FineDetail from "../components/fines/FineDetail";

const Home = () => {
  const [savingListData, setSavingListData] = useState([]);
  const { isLoggedIn } = useUser();

  const nav = useNavigate();
  const mySwal = withReactContent(Swal);

  const onGetSavingList = () => {
    axios
      .get(import.meta.env.VITE_BASE_URL + "/saving", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
      .then((res) => {
        setSavingListData(res.data);
        console.log("savingListData :", res.data);
      })
      .catch((err) => {
        console.log("저축 리스트 가져오기 에러 :", err);
      });
  };

  const onGoCreateFine = () => {
    isLoggedIn()
      ? mySwal.fire({
          html: (
            <div className="flex flex-col select-none cursor-default">
              <p className="text-3xl font-bold mb-4">벌금 & 그룹채팅</p>
              <h1 className="mb-5">
                벌금계좌 선택 및 그룹채팅 생성 페이지로 <br /> 이동
                하시겠습니까?
              </h1>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    nav("/saving/selectSavingMethod", {
                      state: { savingListData },
                    });
                    mySwal.close();
                  }}
                  className="bg-blue-300 px-2 py-4 mr-3 rounded-xl"
                >
                  네, 갈래요 !
                </button>
                <button
                  onClick={() => {
                    mySwal.close();
                  }}
                  className="bg-red-200 p-2 py-4 rounded-xl"
                >
                  아니요, 좀 더 둘러볼래요...
                </button>
              </div>
            </div>
          ),
          icon: "question",
          title: "",
          showConfirmButton: false,
        })
      : mySwal.fire({
          icon: "error",
          title: "로그인 후 이용 가능합니다",
          text: "로그인 후 서비스를 이용 하세요 !",
          timer: 1500,
          showConfirmButton: false,
        });
  };
  const onGoViewConsumption = () => {
    isLoggedIn()
      ? mySwal.fire({
          html: (
            <div className="flex flex-col select-none cursor-default">
              <p className="text-3xl font-bold mb-4">소비</p>
              <h1 className="mb-5">내 소비 현황 페이지로 이동 하시겠습니까?</h1>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    nav("/consumption");
                    mySwal.close();
                  }}
                  className="bg-blue-300 p-4 mr-5 rounded-xl"
                >
                  네, 갈래요 !
                </button>
                <button
                  onClick={() => {
                    mySwal.close();
                  }}
                  className="bg-red-200 p-4 rounded-xl"
                >
                  아니요
                </button>
              </div>
            </div>
          ),
          icon: "question",
          title: "",
          showConfirmButton: false,
        })
      : mySwal.fire({
          icon: "error",
          title: "로그인 후 이용 가능합니다",
          text: "로그인 후 서비스를 이용 하세요 !",
          timer: 1500,
          showConfirmButton: false,
        });
  };

  const viewFineDetail = () => {
    isLoggedIn()
      ? mySwal.fire({
          html: (
            <FineDetail
              accountId={savingListData.savingAccount.savingAccountId}
              allData={savingListData}
              pause={savingListData.savingAccount.pause}
            />
          ),
          showConfirmButton: false,
        })
      : mySwal.fire({
          icon: "error",
          title: "로그인 후 이용 가능합니다",
          text: "로그인 후 서비스를 이용 하세요 !",
          timer: 1500,
          showConfirmButton: false,
        });
  };

  useEffect(() => {
    onGetSavingList();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-0 bg-blue-400 overflow-y-auto no_scroll h-full">
      {/* 상단 타이틀 영역 */}
      <div className="w-full bg-blue-400 py-3 px-4 flex items-center justify-center relative"></div>

      <div className="w-full px-5 mb-6 mt-2">
        <div
          className="bg-blue-300 rounded-xl p-5 shadow-lg min-h-0"
          onClick={viewFineDetail}
        >
          {isLoggedIn() ? (
            <>
              <div className="text-white mb-3 font-bold text-xl flex items-center justify-between">
                <span className="flex-grow text-center ml-7">내 벌금 현황</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGetSavingList();
                  }}
                >
                  <img
                    src="/buttonIcons/reload.png"
                    alt="새로고침"
                    className="w-10 h-10 object-contain"
                  />
                </button>
              </div>
              <div className="relative w-full max-w-md mx-auto overflow-hidden">
                {savingListData && savingListData.savingAccount ? (
                  <div className="flex bg-white rounded-2xl shadow-md border border-blue-200 overflow-hidden">
                    {/* 좌측 영역 */}
                    <div className="w-1/2 border-r border-gray-300 p-4 flex flex-col justify-center">
                      <div>
                        <h3 className="text-blue-500 font-bold text-lg mb-1">
                          이번달 벌금
                        </h3>
                        <p className="text-xl font-semibold text-gray-800 mb-4">
                          ₩
                          {savingListData.savingAccount.amount.toLocaleString()}
                        </p>
                        {/* 선 */}
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">은행:</span>{" "}
                          {savingListData.savingAccount.bank}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">계좌번호:</span>{" "}
                          {savingListData.savingAccount.accountNumber}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">잔액:</span> ₩
                          {savingListData.savingAccount.balance.toLocaleString()}
                        </div>
                      </div>

                      {/* 상태 표시 타원형 */}
                      <div className="mt-4">
                        <div
                          className={`w-full text-center py-1 rounded-full text-white text-sm font-medium ${
                            savingListData.savingAccount.pause
                              ? "bg-gray-400"
                              : "bg-blue-500"
                          }`}
                        >
                          {savingListData.savingAccount.pause
                            ? "일시정지"
                            : "진행중"}
                        </div>
                      </div>
                    </div>

                    {/* 우측 영역 */}
                    <div className="w-1/2 p-4 flex flex-col justify-center">
                      {/* Today 벌금 */}
                      <div className="pb-3">
                        <h3 className="text-green-500 font-bold text-lg mb-1">
                          Today 벌금
                        </h3>
                        <p className="text-xl font-semibold text-gray-800">
                          ₩{savingListData.daily.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col mt-3">
                        <div className="border-t border-gray-300 mb-4" />
                        {/* 누적 벌금 */}
                        <div>
                          <h3 className="text-purple-500 font-bold text-lg mb-1">
                            누적 벌금
                          </h3>
                          <p className="text-xl font-semibold text-gray-800">
                            ₩{savingListData.cumulativeFines.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-10 text-center text-gray-500 bg-blue-100 border rounded-2xl">
                    벌금 계좌를 등록하지 않았습니다. <br />
                    <p className="text-[15px] opacity-80">
                      벌금 계좌를 등록해주세요.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="relative w-full max-w-md mx-auto overflow-hidden">
                <div className="px-6 py-10 text-center text-gray-600 bg-blue-100 border rounded-2xl">
                  <p className="text-lg font-semibold mb-2">
                    로그인이 필요합니다
                  </p>
                  <p className="text-[15px] opacity-80">
                    벌금 현황을 보시려면 먼저 로그인해주세요.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 메인 메뉴 카드 - 상하 배치 */}
      <div className="flex-1 w-full bg-white rounded-t-3xl mt-1 px-5 py-10 flex flex-col justify-start items-center h-full">
        <div className="flex flex-col gap-6 w-full">
          {/* 최종 사용할 버튼 */}
          <button className="w-full" onClick={onGoCreateFine}>
            <div
              className="bg-blue-100 rounded-2xl p-5 shadow-lg flex justify-between items-center border-2 border-blue-200 h-36
                      transform transition duration-150 ease-in-out hover:scale-[1.015] active:scale-[0.98]"
            >
              <div className="pl-3">
                <h2 className="text-3xl font-bold text-gray-800 mb-1">벌금</h2>
                <p className="text-gray-600 leading-tight">
                  현명한 소비를 만드는 <br />
                  벌금 시스템 !
                </p>
              </div>
              <div className="w-28 h-28 flex items-center justify-center mr-2">
                <img
                  src="/etc/fineIcon.png"
                  alt="Saving"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </button>

          {/* 소비 카드 */}
          <button className="w-full" onClick={onGoViewConsumption}>
            <div
              className="bg-green-100 rounded-2xl p-5 shadow-lg flex justify-between items-center border-2 border-green-200 h-36
                      transform transition duration-150 ease-in-out hover:scale-[1.015] active:scale-[0.98]"
            >
              <div className="pl-3">
                <h2 className="text-3xl font-bold text-gray-800 mb-1">소비</h2>
                <p className="text-gray-600 leading-tight">
                  어디에 썼는지 딱 보여주는
                  <br />
                  지출 습관 리포트 !
                </p>
              </div>
              <div className="w-28 h-28 flex items-center justify-center mr-2">
                <img
                  src="/etc/consumptionChart.png"
                  alt="Consumption"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
