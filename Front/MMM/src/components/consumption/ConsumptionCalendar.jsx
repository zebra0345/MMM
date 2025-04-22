import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import {
  getDailyReport,
  getDailyReportByDate,
  getFixedExpenses,
  addFixedExpense,
  deleteFixedExpense,
} from "../../services/consumptionService";
import { formatAmount, isSameDay } from "../../utils/formatters";

const ConsumptionCalendar = ({ dailyData, fixedExpenses }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDayConsumptions, setSelectedDayConsumptions] = useState([]);
  const [selectedDayFixedExpenses, setSelectedDayFixedExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 고정 지출 추가 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFixedExpense, setNewFixedExpense] = useState({
    accountNumber: "",
    amount: "",
    item: "",
    paymentDate: new Date().getDate(),
  });

  // 소비 내역 모달 상태
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [isLoadingDailyData, setIsLoadingDailyData] = useState(false);

  // 로컬 데이터 상태 (props로 받은 데이터 이외에 컴포넌트에서 필요한 상태)
  const [localDailyData, setLocalDailyData] = useState(dailyData);
  const [localFixedExpenses, setLocalFixedExpenses] = useState(fixedExpenses);

  // 로딩된 날짜별 소비 데이터를 캐시하기 위한 상태
  const [dateDailyDataCache, setDateDailyDataCache] = useState({});

  // 로그인 확인
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Props로 전달된 데이터 업데이트
  useEffect(() => {
    if (dailyData) {
      setLocalDailyData(dailyData);

      // 오늘 날짜 데이터를 캐시에 저장
      const today = new Date().toISOString().split("T")[0];
      setDateDailyDataCache((prev) => ({
        ...prev,
        [today]: dailyData,
      }));
    }
    if (fixedExpenses) {
      setLocalFixedExpenses(fixedExpenses);
    }
  }, [dailyData, fixedExpenses]);

  // 데이터가 없을 경우 직접 로드
  useEffect(() => {
    const fetchMissingData = async () => {
      try {
        setIsLoading(true);

        if (!localFixedExpenses || localFixedExpenses.length === 0) {
          const fetchedFixedExpenses = await getFixedExpenses();
          setLocalFixedExpenses(fetchedFixedExpenses);
        }

        // 오늘 날짜 데이터가 없으면 로드
        if (!localDailyData) {
          const dailyReportData = await getDailyReport();
          setLocalDailyData(dailyReportData);

          // 캐시에 저장
          const today = new Date().toISOString().split("T")[0];
          setDateDailyDataCache((prev) => ({
            ...prev,
            [today]: dailyReportData,
          }));
        }
      } catch (err) {
        console.error("데이터 로드 오류:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn() && (!localFixedExpenses || !localDailyData)) {
      fetchMissingData();
    }
  }, [isLoggedIn, localDailyData, localFixedExpenses]);

  // 달력 생성 함수
  const generateCalendarDays = useCallback(
    (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();

      // 해당 월의 첫 날과 마지막 날 계산
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      // 달력에 표시할 날짜 배열 생성
      const days = [];

      // 첫 주의 시작일 이전의 지난 달 날짜 추가
      const firstDayOfWeek = firstDay.getDay(); // 0: 일요일, 1: 월요일, ...
      for (let i = 0; i < firstDayOfWeek; i++) {
        const prevMonthDay = new Date(year, month, -i);
        days.unshift({
          date: prevMonthDay,
          isCurrentMonth: false,
          isToday: isSameDay(prevMonthDay, new Date()),
          isSelected: isSameDay(prevMonthDay, selectedDate),
        });
      }

      // 현재 월의 날짜 추가
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const currentDay = new Date(year, month, i);
        days.push({
          date: currentDay,
          isCurrentMonth: true,
          isToday: isSameDay(currentDay, new Date()),
          isSelected: isSameDay(currentDay, selectedDate),
        });
      }

      // 마지막 주의 다음 달 날짜 추가
      const remainingDays = 7 - (days.length % 7);
      if (remainingDays < 7) {
        for (let i = 1; i <= remainingDays; i++) {
          const nextMonthDay = new Date(year, month + 1, i);
          days.push({
            date: nextMonthDay,
            isCurrentMonth: false,
            isToday: isSameDay(nextMonthDay, new Date()),
            isSelected: isSameDay(nextMonthDay, selectedDate),
          });
        }
      }

      setCalendarDays(days);
    },
    [selectedDate]
  );

  // 달력 데이터 생성
  useEffect(() => {
    generateCalendarDays(currentDate);
  }, [currentDate, generateCalendarDays]);

  // 이전 달 이동
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // 다음 달 이동
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 날짜 선택 및 소비 내역 로드
  const selectDate = async (date) => {
    setSelectedDate(date);

    // 해당 날짜의 고정 지출 가져오기
    const fixedExpensesForDate = getFixedExpensesForDate(date);
    setSelectedDayFixedExpenses(fixedExpensesForDate);

    try {
      setIsLoadingDailyData(true);

      // ISO 형식의 날짜 문자열 (YYYY-MM-DD)로 변환
      const dateStr = formatDateToString(date);

      // 캐시에 해당 날짜 데이터가 있는지 확인
      if (dateDailyDataCache[dateStr]) {
        setSelectedDayConsumptions(
          getConsumptionsForDate(date, dateDailyDataCache[dateStr])
        );
      } else {
        // 오늘 날짜인 경우 오늘의 API 사용
        let dailyData;

        try {
          if (isSameDay(date, new Date())) {
            dailyData = await getDailyReport();
          } else {
            // 과거 날짜는 날짜별 API 사용
            dailyData = await getDailyReportByDate(dateStr);
          }

          // API 오류가 있는 경우 처리
          if (dailyData && dailyData.error) {
            console.warn(`데이터 로드 경고: ${dailyData.error}`);
            // 오류 표시는 하지만 UI 표시를 위해 계속 진행
          }

          // 캐시에 저장
          setDateDailyDataCache((prev) => ({
            ...prev,
            [dateStr]: dailyData,
          }));

          setSelectedDayConsumptions(getConsumptionsForDate(date, dailyData));
        } catch (loadError) {
          console.error(`데이터 로드 실패: ${loadError.message}`);
          setSelectedDayConsumptions([]);
          setError(`${dateStr} 날짜의 소비 데이터를 불러오는데 실패했습니다.`);
        }
      }
    } catch (err) {
      console.error(`${formatDateToString(date)} 데이터 로드 오류:`, err);
      setSelectedDayConsumptions([]);
      setError("소비 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingDailyData(false);
      setShowConsumptionModal(true);
    }
  };

  // 특정 날짜와 데이터에서 소비 내역 가져오기
  const getConsumptionsForDate = (date, data) => {
    if (!data || !data.dailyReport) return [];

    return data.dailyReport.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return isSameDay(itemDate, date);
    });
  };

  // 선택된 날짜의 고정 지출 찾기
  const getFixedExpensesForDate = useCallback(
    (date) => {
      if (!localFixedExpenses || !localFixedExpenses.length) return [];

      // 선택된 날짜와 같은 일자에 결제되는 고정 지출 항목 찾기
      return localFixedExpenses.filter((expense) => {
        return expense.paymentDate === date.getDate();
      });
    },
    [localFixedExpenses]
  );

  // 날짜별 고정 지출이 있는지 확인
  const hasFixedExpenseForDate = useCallback(
    (date) => {
      return getFixedExpensesForDate(date).length > 0;
    },
    [getFixedExpensesForDate]
  );

  // 날짜별 소비 내역이 있는지 확인
  const hasConsumptionForDate = useCallback(
    (date) => {
      // 날짜 문자열로 변환
      const dateStr = formatDateToString(date);

      // 캐시에 데이터가 있는지 확인
      if (dateDailyDataCache[dateStr]) {
        return (
          getConsumptionsForDate(date, dateDailyDataCache[dateStr]).length > 0
        );
      }

      // 오늘 날짜인 경우 로컬 데이터 사용
      if (isSameDay(date, new Date()) && localDailyData) {
        return getConsumptionsForDate(date, localDailyData).length > 0;
      }

      // 캐시에 없는 과거 날짜는 알 수 없으므로 false 반환
      // (선택 시 API 호출하여 확인)
      return false;
    },
    [dateDailyDataCache, localDailyData]
  );

  // 고정 지출 추가 핸들러
  const handleAddFixedExpense = async (e) => {
    e.preventDefault();

    if (!newFixedExpense.amount || !newFixedExpense.item) {
      setError("필수 항목을 모두 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);

      await addFixedExpense({
        accountNumber: newFixedExpense.accountNumber || null,
        amount: parseInt(newFixedExpense.amount),
        item: newFixedExpense.item,
        paymentDate: parseInt(newFixedExpense.paymentDate),
      });

      // 고정 지출 목록 새로고침
      const updatedExpenses = await getFixedExpenses();
      setLocalFixedExpenses(updatedExpenses);

      // 모달 닫고 폼 초기화
      setShowAddModal(false);
      setNewFixedExpense({
        accountNumber: "",
        amount: "",
        item: "",
        paymentDate: new Date().getDate(),
      });

      // 선택된 날짜가 새 고정지출의 결제일과 같다면 선택된 날짜의 고정지출 목록도 업데이트
      if (selectedDate.getDate() === parseInt(newFixedExpense.paymentDate)) {
        setSelectedDayFixedExpenses(
          updatedExpenses.filter(
            (expense) => expense.paymentDate === selectedDate.getDate()
          )
        );
      }
    } catch (err) {
      console.error(`고정 지출 추가 오류: ${err}`);
      setError("고정 지출 추가 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 고정 지출 삭제 핸들러
  const handleDeleteFixedExpense = async (expenseId) => {
    if (window.confirm("이 고정 지출을 삭제하시겠습니까?")) {
      try {
        setIsLoading(true);

        await deleteFixedExpense(expenseId);

        // 고정 지출 목록 새로고침
        const updatedExpenses = await getFixedExpenses();
        setLocalFixedExpenses(updatedExpenses);

        // 선택된 날짜의 고정지출 목록도 업데이트
        setSelectedDayFixedExpenses(
          updatedExpenses.filter(
            (expense) => expense.paymentDate === selectedDate.getDate()
          )
        );
      } catch (err) {
        console.error(`고정 지출 삭제 오류: ${err}`);
        setError("고정 지출 삭제 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFixedExpense({
      ...newFixedExpense,
      [name]: value,
    });
  };

  // 선택된 날짜의 총 소비 및 저축 금액 계산
  const getSelectedDateTotals = useCallback(() => {
    const fixedExpensesAmount = selectedDayFixedExpenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    const spendingAmount = selectedDayConsumptions.reduce(
      (total, item) => total + item.spendingAmount,
      0
    );

    const savingAmount = selectedDayConsumptions.reduce(
      (total, item) => total + item.savingAmount,
      0
    );

    return {
      spending: spendingAmount + fixedExpensesAmount,
      saving: savingAmount,
    };
  }, [selectedDayConsumptions, selectedDayFixedExpenses]);

  // 에러 메시지 초기화
  const clearError = () => {
    setError(null);
  };

  return (
    <div className="space-y-6">
      {isLoading && !showConsumptionModal && !showAddModal ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={clearError}
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>닫기</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      ) : (
        <>
          {/* 달력 헤더 */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={goToPreviousMonth}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-gray-800">
                {currentDate.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                })}
              </h2>
              <button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={goToNextMonth}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 달력 그리드 */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 border-b">
              {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                <div
                  key={day}
                  className={`py-2 text-center text-sm font-medium ${
                    index === 0
                      ? "text-red-500"
                      : index === 6
                      ? "text-blue-500"
                      : "text-gray-500"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[80px] p-2 border-b border-r ${
                    !day.isCurrentMonth ? "bg-gray-50" : ""
                  } ${day.isSelected ? "bg-blue-50" : ""} ${
                    day.isToday ? "border-2 border-blue-500" : ""
                  } cursor-pointer hover:bg-blue-50`}
                  onClick={() => selectDate(day.date)}
                >
                  <div className="flex justify-between">
                    <span
                      className={`inline-block h-6 w-6 leading-6 text-center rounded-full ${
                        day.isToday ? "bg-blue-500 text-white" : ""
                      } ${
                        day.date.getDay() === 0
                          ? "text-red-500"
                          : day.date.getDay() === 6
                          ? "text-blue-500"
                          : ""
                      } ${
                        !day.isCurrentMonth ? "text-gray-400" : "text-gray-900"
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                  </div>

                  {/* 소비 내역 및 고정 지출 표시 */}
                  <div className="mt-1 flex space-x-1">
                    {hasFixedExpenseForDate(day.date) && (
                      <div
                        className="h-2 w-2 rounded-full bg-red-500"
                        title="고정 지출"
                      ></div>
                    )}
                    {hasConsumptionForDate(day.date) && (
                      <div
                        className="h-2 w-2 rounded-full bg-blue-500"
                        title="소비 내역"
                      ></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 고정 지출 추가 버튼 */}
          <div className="flex justify-end">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition"
              onClick={() => setShowAddModal(true)}
            >
              + 고정 지출 추가
            </button>
          </div>

          {/* 소비 내역 상세 모달 */}
          {showConsumptionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-lg w-full p-6 mx-4 max-h-[80vh] relative">
                <button
                    className="text-gray-400 hover:text-gray-600 absolute top-6 right-7"
                    onClick={() => setShowConsumptionModal(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                </button>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedDate.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })}
                  </h3>
                </div>

                <div className="overflow-y-auto max-h-[70vh] no_scroll">
                  {/* 요약 정보 */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-500 font-medium">
                        오늘의 총 소비
                      </p>
                      <p className="text-xl font-bold text-blue-700 mt-1">
                        {formatAmount(getSelectedDateTotals().spending)}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-500 font-medium">
                        오늘의 총 벌금
                      </p>
                      <p className="text-xl font-bold text-green-700 mt-1">
                        {formatAmount(getSelectedDateTotals().saving)}
                      </p>
                    </div>
                  </div>

                  {isLoadingDailyData ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* 고정 지출 목록 */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <h3 className="text-md font-semibold text-gray-800">
                            고정 지출
                          </h3>
                        </div>

                        {selectedDayFixedExpenses.length > 0 ? (
                          <ul className="divide-y">
                            {selectedDayFixedExpenses.map((expense) => (
                              <li
                                key={expense.id}
                                className="p-4 hover:bg-gray-50"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {expense.item}
                                    </p>
                                    {expense.accountNumber && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {expense.bank} {expense.accountNumber}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-base font-semibold text-red-600 mr-4">
                                      {formatAmount(expense.amount)}
                                    </span>
                                    <button
                                      className="text-gray-400 hover:text-red-500 transition"
                                      onClick={() =>
                                        handleDeleteFixedExpense(expense.id)
                                      }
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            등록된 고정 지출이 없습니다.
                          </div>
                        )}
                      </div>

                      {/* 소비 내역 목록 */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <h3 className="text-md font-semibold text-gray-800">
                            소비 내역
                            <span className="text-xs text-gray-500 ml-2">
                              {formatDateToString(selectedDate)}
                            </span>
                          </h3>
                        </div>

                        {selectedDayConsumptions.length > 0 ? (
                          <ul className="divide-y">
                            {selectedDayConsumptions.map((item) => (
                              <li key={item.id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {item.item}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(
                                        item.createdAt
                                      ).toLocaleTimeString("ko-KR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    {item.spendingAmount > 0 && (
                                      <p className="text-sm font-semibold text-red-600">
                                        {formatAmount(item.spendingAmount)}
                                      </p>
                                    )}
                                    {item.savingAmount > 0 && (
                                      <p className="text-xs font-medium text-green-600 mt-1">
                                        저축: {formatAmount(item.savingAmount)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            등록된 소비 내역이 없습니다.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 고정 지출 추가 모달 */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6 mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    고정 지출 추가
                  </h3>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowAddModal(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleAddFixedExpense}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      항목 *
                    </label>
                    <input
                      type="text"
                      name="item"
                      value={newFixedExpense.item}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="항목 입력 (예: 넷플릭스, 월세)"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      금액 *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={newFixedExpense.amount}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="금액 입력"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      결제일 *
                    </label>
                    <input
                      type="number"
                      name="paymentDate"
                      value={newFixedExpense.paymentDate}
                      onChange={handleInputChange}
                      min="1"
                      max="31"
                      className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="매월 결제일 (1-31)"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      계좌번호 (선택)
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={newFixedExpense.accountNumber}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="계좌번호 입력"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowAddModal(false)}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      disabled={isLoading}
                    >
                      {isLoading ? "처리 중..." : "추가하기"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ConsumptionCalendar;
