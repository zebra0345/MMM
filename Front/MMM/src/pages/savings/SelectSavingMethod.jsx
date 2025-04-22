import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const SelectSavingMethod = () => {
  const location = useLocation();
  const savingListData = location.state?.savingListData;
  const nav = useNavigate();
  const mySwal = withReactContent(Swal);
  const [data, setData] = useState([]);

  const onGetData = () => {
    axios
      .get(import.meta.env.VITE_BASE_URL + "/saving", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
      .then((res) => {
        setData(res.data);
        console.log("savingListData :", res.data);
      })
      .catch((err) => {
        console.log("저축 리스트 가져오기 에러 :", err);
      });
  };

  const onGoForcedSaving = () => {
    mySwal
      .fire({
        title: "벌금 계좌 생성",
        html: `
        <p>벌금 계좌를 생성하시겠습니까?</p>
        <p style="margin-top: 5px; margin-bottom: 5px;">
          <span style="color: red;">비율</span> 또는 
          <span style="color: blue;">절대금액</span>으로
        </p>
        <p>벌금을 설정하게 됩니다.</p>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#aaa",
        confirmButtonText: "네, 시작할게요!",
        cancelButtonText: "취소",
        backdrop: true,
        customClass: {
          popup: "w-full sm:w-96 select-none cursor-default", // 반응형 모달 크기 조정
        },
      })

      .then((result) => {
        if (result.isConfirmed) {
          nav("/saving/forcedSaving");
        }
      });
  };

  const onGoJointSaving = () => {
    mySwal
      .fire({
        title: "그룹 채팅방을 생성할까요?",
        text: "친구들과 함께 소비 상황을 공유할 수 있어요!",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#00b894",
        cancelButtonColor: "#aaa",
        confirmButtonText: "네, 만들게요!",
        cancelButtonText: "취소",
        backdrop: true,
        customClass: {
          popup: "w-full sm:w-96 select-none cursor-default", // 반응형 모달 크기 조정
        },
      })
      .then((result) => {
        if (result.isConfirmed) {
          nav("/saving/jointSaving");
        }
      });
  };
  const onProtect = () => {
    mySwal
      .fire({
        title: "생성 실패",
        text: "이미 등록된 벌금 계좌가 있습니다 !",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#00b894",
        cancelButtonColor: "#aaa",
        confirmButtonText: "홈으로 돌아가기",
        cancelButtonText: "취소",
        backdrop: true,
        customClass: {
          popup: "w-full sm:w-96", // 반응형 모달 크기 조정
        },
      })
      .then((result) => {
        if (result.isConfirmed) {
          nav("/");
        }
      });
  };

  useEffect(() => {
    onGetData();
    console.log("받아온 savingListData:", savingListData);
    console.log("벌금 데이터 :", data);
  }, [savingListData]);

  return (
    <div className="min-h-0 flex flex-col bg-gradient-to-b from-blue-100 to-white overflow-y-auto no_scroll">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex py-12 bg-blue-400 items-center justify-center mb-10 px-8 shadow-md relative z-10"
      >
        <div className="flex items-center w-full max-w-screen-lg justify-center text-center py-5 -mt-5">
          <h1 className="text-4xl text-white font-normal tracking-wide drop-shadow-sm">
            벌금 및 그룹채팅
          </h1>
        </div>
      </motion.div>

      {/* 본문 박스 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        className="flex flex-col items-center justify-center py-16 px-10 w-full max-w-xl mx-auto rounded-[50px] bg-white -mt-20 relative z-10"
      >
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-blue-100 rounded-2xl px-8 py-3 mb-10 text-2xl text-gray-700 font-normal shadow-inner"
        >
          벌금 및 그룹채팅 선택
        </motion.h2>

        {/* 벌금 버튼 */}
        <motion.button
          onClick={() => {
            data ? onProtect() : onGoForcedSaving();
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="px-12 mb-8 h-40 text-xl bg-blue-200 rounded-3xl shadow-lg text-red-500 w-80 hover:bg-blue-300 transition-all duration-300 ease-in-out"
        >
          <div className="text-3xl font-normal">벌금 계좌 생성</div>
          <div className="text-base font-light opacity-70 mt-2 text-black">
            소비 태그별 또는 절대 금액으로 <br />
            벌금을 설정해보세요!
          </div>
        </motion.button>

        {/* 그룹 채팅 버튼 */}
        <motion.button
          onClick={onGoJointSaving}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="px-12 h-40 text-xl bg-blue-200 rounded-3xl shadow-lg text-green-500 w-80 hover:bg-blue-300 transition-all duration-300 ease-in-out"
        >
          <div className="text-3xl font-normal">그룹 채팅방 생성</div>
          <div className="text-base font-light opacity-70 mt-2 text-black">
            내 소비 현황을 친구와 공유해봐요!
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SelectSavingMethod;
