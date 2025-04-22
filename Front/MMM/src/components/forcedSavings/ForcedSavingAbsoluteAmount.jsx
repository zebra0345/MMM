import { useState, useEffect } from "react";

const ForcedSavingAbsoluteAmount = ({
  onUpdateSavingAbsoluteAmount,
  one: setOne,
  ten: setTen,
  fifty: setFifty,
}) => {
  const [checkedItems, setCheckedItems] = useState({});

  const savingOptions = [
    { maxAmount: "1,000원 이상", savingAmount: "500원 출금" },
    { maxAmount: "10,000원 이상", savingAmount: "5,000원 출금" },
    { maxAmount: "50,000원 이상", savingAmount: "10,000원 출금" },
  ];

  const handleCheck = (index) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));

    if (index === 0) setOne((prev) => !prev);
    if (index === 1) setTen((prev) => !prev);
    if (index === 2) setFifty((prev) => !prev);
  };

  useEffect(() => {
    const selectedData = savingOptions
      .filter((_, index) => checkedItems[index])
      .map((item) => ({
        maxAmount: parseInt(item.maxAmount.replace(/[^0-9]/g, ""), 10),
        savingAmount: parseInt(item.savingAmount.replace(/[^0-9]/g, ""), 10),
      }));

    onUpdateSavingAbsoluteAmount(selectedData);
  }, [checkedItems]);

  return (
    <div className="flex flex-col items-center bg-blue-300 rounded-3xl shadow-lg p-7 w-full h-full">
      <h1 className="mb-4 text-2xl">절대 금액</h1>
      <div className="flex flex-col items-center h-full overflow-y-auto no_scroll">
        {savingOptions.map((option, index) => (
          <div
            key={index}
            className="flex items-center w-full bg-white rounded-2xl p-4 mb-6 shadow-md"
          >
            <input
              type="checkbox"
              checked={checkedItems[index] || false}
              onChange={() => handleCheck(index)}
              className="mr-3 w-5 h-5"
            />
            <div className="flex flex-1 justify-between">
              <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl">
                {option.maxAmount}
              </div>
              <div className="bg-yellow-300 text-gray-900 px-4 py-2 rounded-2xl">
                {option.savingAmount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ForcedSavingAbsoluteAmount;
