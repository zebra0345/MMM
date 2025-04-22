import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

import ForcedSavingRatio from "../../components/forcedSavings/ForcedSavingRatio";
import ForcedSavingAbsoluteAmount from "../../components/forcedSavings/ForcedSavingAbsoluteAmount";

const ForcedSaving = () => {
  const [method, setMethod] = useState(""); // 비율 또는 절대금액 선택 상태
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [savingPercent, setSavingPercent] = useState({});
  const [savingAbsoluteAmount, setSavingAbsoluteAmount] = useState([]);
  const [isActiveOneThousand, setIsActiveOneThousand] = useState(false);
  const [isActiveTenThousand, setIsActiveTenThousand] = useState(false);
  const [isActiveFiftyThousand, setIsActiveFiftyThousand] = useState(false);

  const nav = useNavigate();

  const onClickRatio = () => {
    setSelectedMethod(1);
    setMethod("비율");
  };
  const onClickAbsolute = () => {
    setSelectedMethod(0);
    setMethod("절대금액");
  };

  const data = {
    type: false,
    savingType: {
      savingType: selectedMethod,
      absSaving:
        method === "절대금액"
          ? [
            {
              maxAmount: 1000,
              savingAmount: 500,
              active: isActiveOneThousand,
            },
            {
              maxAmount: 10000,
              savingAmount: 5000,
              active: isActiveTenThousand,
            },
            {
              maxAmount: 50000,
              savingAmount: 10000,
              active: isActiveFiftyThousand,
            },
          ]
          : null,
      perSaving:
        method === "비율"
          ? {
            savingPercent: savingPercent,
            maxMin: {
              maxAmount: null,
              minAmount: null,
            },
          }
          : {
            savingPercent: [
              {
                percent: 0,
                tag: null,
              },
            ],
            maxMin: {
              maxAmount: null,
              minAmount: null,
            },
          },
    },
  };

  const onGoSelectAccount = () => {
    localStorage.setItem("savingData", JSON.stringify(data));
    nav("/saving/selectAccount");
  };

  useEffect(() => {
    console.log("------------------");
    console.log("data : ", data);
  }, [data, method, savingPercent, savingAbsoluteAmount]);

  return (

    <div className="min-h-0 h-full flex flex-1 flex-col overflow-y-auto no_scroll">
      <div className="flex py-20 bg-blue-400 items-center justify-center mb-10 px-8">
        <div className="flex items-center w-full max-w-screen-lg justify-between text-center -mt-10">
          {/* 단계 표시 */}
          <span className="text-lg text-gray-300">벌금 및 그룹채팅</span>
          <div className="flex-1 h-[1px] bg-gray-300 mx-2"></div> {/* 선 */}
          <span className="text-lg text-white">벌금 옵션 선택</span>
          <div className="flex-1 h-[1px] bg-gray-300 mx-2"></div> {/* 선 */}
          <span className="text-lg text-gray-300">계좌 선택</span>
        </div>
      </div>
      {/* 메인 컨텐츠 */}
      <div className="py-8 px-2 w-full mx-auto rounded-[60px] bg-white z-10 -mt-23 min-0">
        <div className="flex flex-col items-center min-h-0">
          <h1 className="bg-blue-100 rounded-2xl px-15 py-2 mb-1 text-2xl">
            벌금 옵션
          </h1>
          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={method === "비율" ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={onClickRatio}
              className={`flex w-35 px-6 py-8 h-10 items-center justify-center text-xl mt-3 rounded-3xl shadow-lg transition-all duration-300 ${method === "비율"
                ? "bg-blue-500 text-white border-4 border-white shadow-xl"
                : "bg-blue-200"
                }`}
            >
              비 율
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={method === "절대금액" ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={onClickAbsolute}
              className={`flex w-35 px-6 py-8 h-10 items-center justify-center text-xl mt-3 rounded-3xl shadow-lg transition-all duration-300 ${method === "절대금액"
                ? "bg-blue-500 text-white border-4 border-white shadow-xl"
                : "bg-blue-200"
                }`}
            >
              절대 금액
            </motion.button>
          </div>
          {method === "" && (
            <p className="text-lg opacity-60 mt-20">
              비율 또는 절대금액을 선택해주세요...
            </p>
          )}
        </div>
        <div className="flex flex-col items-center min-h-0">
          {method && (
            <motion.div
              key={selectedMethod}
              className="flex felx-1 flex-col mt-5 min-h-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {method === "비율" ? (
                <ForcedSavingRatio onUpdateSavingPercent={setSavingPercent} />
              ) : (
                <ForcedSavingAbsoluteAmount
                  onUpdateSavingAbsoluteAmount={setSavingAbsoluteAmount}
                  one={setIsActiveOneThousand}
                  ten={setIsActiveTenThousand}
                  fifty={setIsActiveFiftyThousand}
                />
              )}
            </motion.div>
          )}
          {method && (
            <button
              type="submit"
              className="flex items-center px-5 h-10 mt-5 mb-5 text-xl bg-blue-400 rounded-3xl shadow-xl"
              onClick={onGoSelectAccount}
            >
              선택 완료
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForcedSaving;
