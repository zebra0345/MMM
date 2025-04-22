import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SavingGoal = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 추가
  const [goal, setGoal] = useState("");
  const [goalPrice, setGoalPrice] = useState("");
  const [image, setImage] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState("");

  const body = {
    start: startDate,
    end: endDate,
    amount: goalPrice,
    item: goal,
  };

  const onCreateGoal = (e) => setGoal(e.target.value);
  const onCreateComma = (e) => {
    let inputValue = e.target.value.replace(/[^0-9]/g, "");
    let Value = e.target.value.replace(/[^0-9]/g, "");
    inputValue = Number(inputValue).toLocaleString();
    setGoalPrice(Value);
    setPrice(inputValue);
  };

  const onImageUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      if (uploadedFile.size > 1024 * 1024 * 10) {
        alert("10MB 이하의 파일만 업로드 가능합니다.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          imageFile: uploadedFile,
          previewUrl: e.target.result,
        };
        setImage(newImage);
        localStorage.setItem("image", JSON.stringify(newImage)); // 이미지 localStorage 저장
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const onSaveAndNavigate = () => {
    localStorage.setItem("savingData", JSON.stringify(body));
    navigate("/saving/selectGoalAccount"); // 페이지 이동
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex py-20 bg-blue-400 items-center justify-center">
        <h1 className="text-3xl font-bold text-white -mt-15">저 축</h1>
      </div>
      <div className="py-8 px-10 h-full w-full mx-auto rounded-[60px] bg-white shadow-lg z-10 -mt-15">
        <div className="bg-gray-100 p-3 rounded-3xl shadow-lg">
          <h1>목표</h1>
          <textarea
            className="w-full h-13 bg-blue-200 mt-3 rounded-full p-3 shadow-lg"
            placeholder="목표를 입력해주세요"
            value={goal}
            onChange={onCreateGoal}
          />
        </div>
        <div className="bg-gray-100 p-3 rounded-3xl shadow-lg mt-5">
          <h2>금액</h2>
          <div className="relative w-full">
            <input
              type="text"
              value={price}
              onChange={onCreateComma}
              placeholder="금액을 입력해주세요"
              className="w-full h-13 bg-blue-200 mt-3 rounded-full p-3 shadow-lg pl-4 pr-12"
            />
            <span className="absolute right-4 top-1/3 text-lg">원</span>
          </div>
        </div>
        <div className="bg-gray-100 p-3 rounded-3xl shadow-lg mt-5">
          <h3>사진 첨부</h3>
          <div className="flex flex-col items-center justify-center mt-3 h-50 bg-blue-100 rounded-3xl p-3 shadow-lg">
            {image ? (
              <div className="mt-3 flex">
                <img
                  src={image.previewUrl}
                  alt="Uploaded Preview"
                  className="w-40 h-40 rounded-lg object-cover"
                />
                <button
                  className="absolute bg-red-400 text-white py-2 px-4 rounded-lg h-10 ml-43 mt-30 shadow-md transition-transform duration-200 active:scale-90"
                  onClick={() => setImage(null)}
                >
                  삭제
                </button>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="postImage"
                  className="flex items-center justify-center w-20 h-20 bg-blue-200 rounded-full cursor-pointer"
                >
                  <img
                    src="/buttonIcons/plusIcon.png"
                    alt="camera"
                    className="w-8 h-8"
                  />
                </label>
                <input
                  type="file"
                  id="postImage"
                  name="image"
                  accept="image/*"
                  className="hidden"
                  onChange={onImageUpload}
                />
              </div>
            )}
          </div>
        </div>
        <div className="bg-gray-100 p-3 rounded-3xl shadow-lg mt-5">
          <h4>목표 기간</h4>
          <p className="text-[14px] mt-5">시작 날짜</p>
          <input
            type="date"
            className="w-full h-13 bg-blue-200 mt-3 rounded-full p-3 shadow-lg"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <p className="text-[14px] mt-5">종료 날짜</p>
          <input
            type="date"
            className="w-full h-13 bg-blue-200 mt-3 rounded-full p-3 shadow-lg"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mb-5">
        <button
          onClick={onSaveAndNavigate}
          className="flex items-center justify-center bg-gradient-to-r from-blue-400 to-green-200 mt-3 rounded-full p-3 shadow-xl w-30 h-13 active:scale-95 text-xl"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default SavingGoal;
