import { useState, useEffect } from "react";

const ForcedSavingRatio = ({ onUpdateSavingPercent }) => {
  const [food, setFood] = useState(10);
  const [retail, setRetail] = useState(10);
  const [artSports, setArtSports] = useState(10);
  const [education, setEducation] = useState(10);
  const [lodgment, setLodgment] = useState(10);
  const [management, setManagement] = useState(10);
  const [medical, setMedical] = useState(10);
  const [realEstate, setRealEstate] = useState(10);
  const [repairPersonal, setRepairPersonal] = useState(10);
  const [scienceTechnology, setScienceTechnology] = useState(10);

  useEffect(() => {
    onUpdateSavingPercent([
      { percent: food, tag: "음식" },
      { percent: retail, tag: "소매" },
      { percent: artSports, tag: "예술·스포츠" },
      { percent: education, tag: "교육" },
      { percent: lodgment, tag: "숙박" },
      { percent: management, tag: "시설관리·임대" },
      { percent: medical, tag: "보건의료" },
      { percent: realEstate, tag: "부동산" },
      { percent: repairPersonal, tag: "수리·개인" },
      { percent: scienceTechnology, tag: "과학·기술" },
    ]);
  }, [
    food,
    retail,
    artSports,
    education,
    lodgment,
    management,
    medical,
    realEstate,
    repairPersonal,
    scienceTechnology,
  ]);

  return (
    <div className="flex flex-col flex-1 items-center bg-blue-300 rounded-3xl shadow-lg p-7 mx-5 overflow-hidden min-h-0">
      <h1 className="mb-4 -mt-4 text-2xl">비율 선택</h1>
      <div className="flex flex-col items-center justify-start h-full overflow-y-auto no_scroll scroll-smooth -webkit-overflow-scrolling-touch">
        <div className="flex items-center justify-center gap-2 w-full">
          {/* 음식 컨테이너 */}
          <div className="flex items-center gap-2 bg-white py-3 px-3 rounded-3xl">
            <div className="flex flex-col items-center gap-1">
              <img
                src="/tagIcons/food.png"
                alt="음식 아이콘"
                className="w-7 h-7"
              />
              <p className="text-[12px]">음식</p>
            </div>
            <div className="flex flex-col justify-center items-center ">
              <input
                type="text"
                value={food + "%"} // % 추가
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 남기기
                  value = value === "" ? "" : Math.min(100, Number(value)); // 100 초과 제한
                  setFood(value);
                }}
                className="w-20 h-8 text-center shadow-lg border border-blue-300 rounded-xl"
              />
            </div>
          </div>

          {/* 소매 컨테이너 */}
          <div className="flex items-center gap-2 bg-white py-3 px-3 rounded-3xl">
            <div className="flex flex-col items-center gap-1">
              <img
                src="/tagIcons/retail.png"
                alt="소매 아이콘"
                className="w-7 h-7"
              />
              <p className="text-[12px]">소매</p>
            </div>
            <div className="flex flex-col justify-center items-center ">
              <input
                type="text"
                value={retail + "%"} // % 추가
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 남기기
                  value = value === "" ? "" : Math.min(100, Number(value)); // 100 초과 제한
                  setRetail(value);
                }}
                className="w-20 h-8 text-center shadow-lg border border-blue-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-3  w-full">
          {/* 숙박 컨테이너 */}
          <div className="flex items-center gap-2 bg-white py-3 px-3 rounded-3xl">
            <div className="flex flex-col items-center gap-1">
              <img
                src="/tagIcons/lodgment.png"
                alt="숙박 아이콘"
                className="w-7 h-7"
              />
              <p className="text-[12px]">숙박</p>
            </div>
            <div className="flex flex-col justify-center items-center ">
              <input
                type="text"
                value={lodgment + "%"} // % 추가
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 남기기
                  value = value === "" ? "" : Math.min(100, Number(value)); // 100 초과 제한
                  setLodgment(value);
                }}
                className="w-20 h-8 text-center shadow-lg border border-blue-300 rounded-xl"
              />
            </div>
          </div>

          {/* 수리ㆍ개인 컨테이너 */}
          <div className="flex items-center gap-2 bg-white py-3 px-3 rounded-3xl">
            <div className="flex flex-col items-center gap-1">
              <img
                src="/tagIcons/repairPersonal.png"
                alt="수리ㆍ개인 아이콘"
                className="w-7 h-7"
              />
              <p className="text-[12px]">개인</p>
            </div>
            <div className="flex flex-col justify-center items-center ">
              <input
                type="text"
                value={repairPersonal + "%"} // % 추가
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 남기기
                  value = value === "" ? "" : Math.min(100, Number(value)); // 100 초과 제한
                  setRepairPersonal(value);
                }}
                className="w-20 h-8 text-center shadow-lg border border-blue-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-3 w-full">
          {/* 교육 컨테이너 */}
          <div className="flex items-center gap-2 bg-white py-3 px-3 rounded-3xl">
            <div className="flex flex-col items-center gap-1">
              <img
                src="/tagIcons/education.png"
                alt="교육 아이콘"
                className="w-7 h-7"
              />
              <p className="text-[12px]">교육</p>
            </div>
            <div className="flex flex-col justify-center items-center ">
              <input
                type="text"
                value={education + "%"} // % 추가
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 남기기
                  value = value === "" ? "" : Math.min(100, Number(value)); // 100 초과 제한
                  setEducation(value);
                }}
                className="w-20 h-8 text-center shadow-lg border border-blue-300 rounded-xl"
              />
            </div>
          </div>

          {/* 보건의료 컨테이너 */}
          <div className="flex items-center gap-2 bg-white py-3 px-3 rounded-3xl">
            <div className="flex flex-col items-center gap-1">
              <img
                src="/tagIcons/medical.png"
                alt="의료 아이콘"
                className="w-7 h-7"
              />
              <p className="text-[12px]">의료</p>
            </div>
            <div className="flex flex-col justify-center items-center ">
              <input
                type="text"
                value={medical + "%"} // % 추가
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 남기기
                  value = value === "" ? "" : Math.min(100, Number(value)); // 100 초과 제한
                  setMedical(value);
                }}
                className="w-20 h-8 text-center shadow-lg border border-blue-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-3 w-full">
          {/* 예술ㆍ스포츠 컨테이너 */}
          <div className="flex items-center gap-2 bg-white py-3 px-3 rounded-3xl">
            <div className="flex flex-col items-center gap-1">
              <img
                src="/tagIcons/artSports.png"
                alt="예술ㆍ스포츠 아이콘"
                className="w-7 h-7"
              />
              <p className="text-[12px]">예술</p>
            </div>
            <div className="flex flex-col justify-center items-center ">
              <input
                type="text"
                value={artSports + "%"} // % 추가
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 남기기
                  value = value === "" ? "" : Math.min(100, Number(value)); // 100 초과 제한
                  setArtSports(value);
                }}
                className="w-20 h-8 text-center shadow-lg border border-blue-300 rounded-xl"
              />
            </div>
          </div>

          {/* 시설관리ㆍ임대 컨테이너 */}
          <div className="flex items-center gap-2 bg-white py-3 px-3 rounded-3xl">
            <div className="flex flex-col items-center gap-1">
              <img
                src="/tagIcons/management.png"
                alt="시설관리ㆍ임대 아이콘"
                className="w-7 h-7"
              />
              <p className="text-[12px]">관리</p>
            </div>
            <div className="flex flex-col justify-center items-center ">
              <input
                type="text"
                value={management + "%"} // % 추가
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 남기기
                  value = value === "" ? "" : Math.min(100, Number(value)); // 100 초과 제한
                  setManagement(value);
                }}
                className="w-20 h-8 text-center shadow-lg border border-blue-300 rounded-xl"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          {/* 부동산 컨테이너 */}
          <div className="flex items-center gap-2 bg-white py-3 px-3 rounded-3xl">
            <div className="flex flex-col items-center gap-1">
              <img
                src="/tagIcons/realEstate.png"
                alt="부동산 아이콘"
                className="w-7 h-7"
              />
              <p className="text-[8px]">부동산</p>
            </div>
            <div className="flex flex-col justify-center items-center ">
              <input
                type="text"
                value={realEstate + "%"} // % 추가
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 남기기
                  value = value === "" ? "" : Math.min(100, Number(value)); // 100 초과 제한
                  setRealEstate(value);
                }}
                className="w-20 h-8 text-center shadow-lg border border-blue-300 rounded-xl"
              />
            </div>
          </div>

          {/* 과학ㆍ기술 컨테이너 */}
          <div className="flex items-center gap-2 bg-white py-3 px-3 rounded-3xl">
            <div className="flex flex-col items-center gap-1">
              <img
                src="/tagIcons/scienceTechnology.png"
                alt="소매 아이콘"
                className="w-7 h-7"
              />
              <p className="text-[8px]">과학</p>
            </div>
            <div className="flex flex-col justify-center items-center ">
              <input
                type="text"
                value={scienceTechnology + "%"} // % 추가
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 남기기
                  value = value === "" ? "" : Math.min(100, Number(value)); // 100 초과 제한
                  setScienceTechnology(value);
                }}
                className="w-20 h-8 text-center shadow-lg border border-blue-300 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForcedSavingRatio;
