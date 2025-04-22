import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useState, useEffect } from "react";
import ConsumptionHistoryDetail from "./ConsumptionHistoryDetail";
import FineSetting from "./FineSetting";

const FineDetail = ({ accountId, allData, pause }) => {
  const [fineDetailData, setFineDetailData] = useState({});
  const [showKebabMenu, setShowKebabMenu] = useState(false);

  const mySwal = withReactContent(Swal);
  const data = fineDetailData;
  const datas = allData;
  const body = String(data.accountNumber);

  const onGetFineDetail = () => {
    axios
      .get(import.meta.env.VITE_BASE_URL + `/saving/${accountId}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
      .then((res) => {
        setFineDetailData(res.data);
        console.log("벌금 상세 정보(data) :", res.data);
        console.log("body :", body);
      });
  };

  const onDeleteFine = () => {
    Swal.fire({
      title: "벌금 계좌 삭제",
      html: `정말로 삭제하시겠습니까? <br />삭제된 계좌 정보는 복구할 수 없습니다.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(import.meta.env.VITE_BASE_URL + `/saving`, {
            headers: { "Content-Type": "application/json" },
            data: { savingAccountNumber: body },
            withCredentials: true,
          })
          .then((res) => {
            console.log("벌금 삭제 성공 :", res.data);
            Swal.fire("삭제 완료", "벌금이 삭제되었습니다.", "success").then(
              () => {
                window.location.reload();
              }
            );
          })
          .catch((err) => {
            console.log("벌금 삭제 실패 :", err);
            Swal.fire("삭제 실패", "벌금 삭제에 실패했습니다.", "error");
          });
      }
    });
  };

  const onPauseFine = () => {
    Swal.fire({
      title: "벌금 계좌 정지",
      html: `정말로 정지하시겠습니까? <br />`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "정지",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .patch(
            import.meta.env.VITE_BASE_URL + "/saving/pause",
            { savingAccountNumber: body },
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          )
          .then((res) => {
            console.log("벌금 정지 성공 :", res.data);
            Swal.fire("정지 완료", "벌금이 정지되었습니다.", "success").then(
              () => {
                window.location.reload();
              }
            );
          })
          .catch((err) => {
            console.log("벌금 정지 실패 :", err);
            Swal.fire("정지 실패", "벌금 정지에 실패했습니다.", "error");
          });
      }
    });
  };

  const onResumeFine = () => {
    Swal.fire({
      title: "벌금 다시 시작",
      html: `벌금 적용을 하시겠습니까? <br />`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "시작",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .patch(
            import.meta.env.VITE_BASE_URL + `/saving/resume`,
            { savingAccountNumber: body },
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          )
          .then((res) => {
            console.log("벌금 시작 성공 :", res.data);
            Swal.fire(
              "다시 시작 완료",
              "벌금이 적용되었습니다.",
              "success"
            ).then(() => {
              window.location.reload();
            });
          })
          .catch((err) => {
            console.log("벌금 적용 실패 :", err);
            Swal.fire("벌금 시작 실패", "벌금 적용에 실패했습니다.", "error");
          });
      }
    });
  };

  const viewConsumptionHistoryDetail = () => {
    mySwal.fire({
      html: (
        <ConsumptionHistoryDetail
          accountId={accountId}
          allData={allData}
          detailData={data}
        />
      ),
      customClass: {
        popup: "no-scroll-modal"
      },
      showConfirmButton: false,
    });
  };

  const viewFineSetting = () => {
    mySwal.fire({
      html: (
        <FineSetting
          absSaving={data.absSaving}
          perSaving={data.savingDetails}
          accountId={accountId}
          allData={allData}
        />
      ),
      showConfirmButton: false,
    });
  };

  const toggleKebabMenu = () => {
    setShowKebabMenu((prev) => !prev);
  };

  useEffect(() => {
    onGetFineDetail();
  }, []);

  return (
    <div className="flex flex-col select-none cursor-default">

      {/* 벌금 내역 헤더 */}
      <div className="bg-white p-4 rounded shadow-md relative min-h-0">
        <div className="flex items-center justify-center mb-4 relative min-h-0">
          <h2 className="text-2xl mb-2">벌금 상세 보기</h2>
          <button onClick={toggleKebabMenu}>
            <img
              src="/buttonIcons/kebabIcon.png"
              alt="케밥 메뉴"
              width={20}
              height={15}
              className="absolute right-1 top-1"
            />
          </button>

          {showKebabMenu && (
            <div className="absolute right-0 top-10 bg-white border shadow-md rounded-lg z-10 w-25">
              {pause ? (
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={onResumeFine}
                >
                  정지 해제
                </button>
              ) : (
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={onPauseFine}
                >
                  벌금 정지
                </button>
              )}
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={onDeleteFine}
              >
                벌금 해지
              </button>
            </div>
          )}
        </div>

        {/* 벌금 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
          <div className="bg-gray-100 p-3 rounded-lg shadow text-center">
            <p className="text-sm text-gray-500">등록 경과일</p>
            <p className="text-lg font-bold text-indigo-600">
              D + {data.daysPassed}
            </p>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg shadow text-center">
            <p className="text-sm text-gray-500">상태</p>
            <p
              className={`text-lg font-bold ${
                pause ? "text-red-500" : "text-green-500"
              }`}
            >
              {pause ? "일시 정지" : "진행 중"}
            </p>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg shadow text-center">
            <p className="text-sm text-gray-500">이번달 벌금</p>
            <p className="text-lg font-bold text-blue-700">
              ₩{datas.savingAccount.amount.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg shadow text-center">
            <p className="text-sm text-gray-500">오늘 벌금</p>
            <p className="text-lg font-bold text-blue-700">
              ₩{datas.daily.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg shadow text-center">
            <p className="text-sm text-red-500">미납금</p>
            <p className="text-lg font-bold text-red-600">₩{data.misugeum}</p>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg shadow text-center">
            <p className="text-sm text-gray-500">누적 벌금</p>
            <p className="text-lg font-bold text-blue-700">
              ₩{datas.cumulativeFines.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-center ">
          <button
            className="bg-blue-200 rounded-xl py-1 px-5 mt-3 mr-2 text-sm shadow-lg"
            onClick={viewFineSetting}
          >
            벌금 설정 보기
          </button>
          <button
            className="bg-blue-200 rounded-xl py-1 px-5 mt-3 text-sm shadow-lg"
            onClick={viewConsumptionHistoryDetail}
          >
            소비 내역 보기
          </button>
        </div>
      </div>
      {/* 계좌 정보 */}
      <div className="bg-green-200 rounded-lg px-4 py-2 mt-4">
        <div>
          <p className="text-sm text-gray-700">
            {data.bank} {data.accountNumber}
          </p>
          <p className="text-base font-semibold mt-1">
            계좌 잔액: ₩{data.balance?.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FineDetail;
