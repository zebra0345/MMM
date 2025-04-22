import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import {
  getMonthlyReport,
  getDailyReport,
  getFixedExpenses,
} from "../services/consumptionService";
import ConsumptionCalendar from "../components/consumption/ConsumptionCalendar";
import MonthlyConsumption from "../components/consumption/MonthlyConsumption";
import YearlyConsumptionChart from "../components/consumption/YearlyConsumptionChart";
import AIConsumptionAnalysis from "../components/consumption/AIConsumptionAnalysis";

const Consumption = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();

  // React 상태
  const [activeTab, setActiveTab] = useState("calendar");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [monthlyData, setMonthlyData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [fixedExpenses, setFixedExpenses] = useState([]);

  // 로그인 확인
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 현재 활성화된 탭에 따라 필요한 데이터만 가져오기
        if (activeTab === "calendar") {
          // 캘린더 탭에서는 일별 소비 데이터와 고정 지출 데이터 필요
          if (!dailyData) {
            const dailyReportData = await getDailyReport();
            setDailyData(dailyReportData);
          }

          if (!fixedExpenses.length) {
            const expensesData = await getFixedExpenses();
            setFixedExpenses(expensesData);
          }
        } else if (activeTab === "monthly" && !monthlyData) {
          // 현재 연도의 데이터를 가져옴
          const currentYear = new Date().getFullYear();
          const data = await getMonthlyReport(currentYear);
          setMonthlyData(data);
        }
        // yearly 탭과 ai 탭은 해당 컴포넌트 내부에서 데이터를 로드
      } catch (err) {
        console.error(`데이터 로딩 오류: ${err}`);
        setError(
          "데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn()) {
      fetchData();
    }
  }, [activeTab, monthlyData, dailyData, fixedExpenses.length, isLoggedIn]);

  // 데이터 새로고침 함수
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (activeTab === "calendar") {
        const dailyReportData = await getDailyReport();
        setDailyData(dailyReportData);

        const expensesData = await getFixedExpenses();
        setFixedExpenses(expensesData);
      } else if (activeTab === "monthly") {
        const currentYear = new Date().getFullYear();
        const data = await getMonthlyReport(currentYear);
        setMonthlyData(data);
      }
      // yearly 탭과 ai 탭은 해당 컴포넌트 내부에서 새로고침 처리
    } catch (err) {
      console.error(`데이터 새로고침 오류: ${err}`);
      setError(
        "데이터를 새로고침하는 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-0 h-full flex flex-col bg-gray-50">
      {/* 상단 헤더 */}
      <div className="bg-blue-500 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">소비 분석</h1>
          <p className="text-sm opacity-80 mt-1">
            소비 내역을 확인하고 패턴을 분석해보세요
          </p>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "calendar"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("calendar")}
            >
              캘린더
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "monthly"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("monthly")}
            >
              월간 소비
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "yearly"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("yearly")}
            >
              연간 소비
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "ai"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("ai")}
            >
              AI 분석
            </button>
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="container mx-auto px-4 py-6 flex-grow min-h-0 h-full overflow-y-auto no_scroll">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={refreshData}
            >
              <svg
                className="fill-current h-6 w-6 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ) : (
          <>
            {activeTab === "calendar" && (
              <ConsumptionCalendar
                dailyData={dailyData}
                fixedExpenses={fixedExpenses}
              />
            )}
            {activeTab === "monthly" && (
              <MonthlyConsumption data={monthlyData} />
            )}
            {activeTab === "yearly" && <YearlyConsumptionChart />}
            {activeTab === "ai" && <AIConsumptionAnalysis />}
          </>
        )}
      </div>
    </div>
  );
};

export default Consumption;
