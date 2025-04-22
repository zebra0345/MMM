import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getYearlyCategoryData } from "../../services/consumptionService";
import { formatAmount, CHART_COLORS } from "../../utils/formatters";

const YearlyConsumptionChart = () => {
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [yearlyData, setYearlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 연간 데이터 로드
  useEffect(() => {
    const fetchYearlyData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getYearlyCategoryData(selectedYear);
        setYearlyData(data || []);
      } catch (err) {
        console.error("연간 소비 데이터 로드 오류:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        setYearlyData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchYearlyData();
  }, [selectedYear]);

  // 선택 가능한 연도 목록 생성
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    // 현재 연도부터 4년 전까지 (총 5개)
    return Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  };

  // 모든 카테고리 추출
  const getAllCategories = () => {
    if (!yearlyData || yearlyData.length === 0) return [];

    const categoriesSet = new Set();
    yearlyData.forEach((monthData) => {
      if (monthData.categoryTotals) {
        Object.keys(monthData.categoryTotals).forEach((category) => {
          categoriesSet.add(category);
        });
      }
    });

    return Array.from(categoriesSet);
  };

  // 파이 차트 데이터 준비 (연간 카테고리별 합계)
  const preparePieChartData = () => {
    if (!yearlyData || yearlyData.length === 0) return [];

    const categoryTotals = {};
    const categories = getAllCategories();

    categories.forEach((category) => {
      categoryTotals[category] = 0;
    });

    yearlyData.forEach((monthData) => {
      if (monthData.categoryTotals) {
        Object.entries(monthData.categoryTotals).forEach(
          ([category, amount]) => {
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
          }
        );
      }
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  // 라인 차트 데이터 준비 (월별 총 지출)
  const prepareLineChartData = () => {
    if (!yearlyData || yearlyData.length === 0) return [];

    // 데이터 정렬 (월별로)
    const sortedData = [...yearlyData].sort((a, b) => a.month - b.month);

    return sortedData.map((monthData) => {
      const totalAmount = monthData.categoryTotals
        ? Object.values(monthData.categoryTotals).reduce(
            (sum, val) => sum + val,
            0
          )
        : 0;

      return {
        name: `${monthData.month}월`,
        총지출: totalAmount,
      };
    });
  };

  // 연간 총 소비액
  const calculateAnnualTotal = () => {
    if (!yearlyData || yearlyData.length === 0) return 0;

    let total = 0;
    yearlyData.forEach((monthData) => {
      if (monthData.categoryTotals) {
        total += Object.values(monthData.categoryTotals).reduce(
          (sum, val) => sum + val,
          0
        );
      }
    });

    return total;
  };

  // 차트 데이터 준비
  const pieChartData = preparePieChartData();
  const lineChartData = prepareLineChartData();
  const annualTotal = calculateAnnualTotal();

  return (
    <div className="space-y-6">
      {/* 제목 & 연도 선택 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedYear}년 소비 추이
          </h2>

          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연도 선택
            </label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {getYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 총 소비액 요약 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-500 font-medium">
          {selectedYear}년 총 소비액
        </p>
        <p className="text-2xl font-bold text-blue-700 mt-1">
          {formatAmount(annualTotal)}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : yearlyData.length === 0 ? (
        <div className="p-10 text-center text-gray-500">
          {selectedYear}년 소비 데이터가 없습니다.
        </div>
      ) : (
        <>
          {/* 카테고리별 분석 (파이 차트) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedYear}년 카테고리별 소비 분석
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 파이 차트 */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={false} // 라벨 제거
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatAmount(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* 카테고리별 상세 표 */}
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">
                  카테고리별 지출 (내림차순)
                </h3>
                <div className="overflow-y-auto max-h-72 pr-2">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          카테고리
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          금액
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          비율
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pieChartData.map((category, index) => {
                        const percentage =
                          annualTotal > 0
                            ? ((category.value / annualTotal) * 100).toFixed(1)
                            : "0.0";

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{
                                    backgroundColor:
                                      CHART_COLORS[index % CHART_COLORS.length],
                                  }}
                                ></div>
                                <span className="font-medium text-gray-900">
                                  {category.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium">
                              {formatAmount(category.value)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                              {percentage}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 월별 소비 추이 (라인 차트) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedYear}년 월별 소비 추이
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatAmount(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="총지출"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 월별 통계 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedYear}년 월별 통계
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      월
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      소비 금액
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      비율
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lineChartData.map((monthData, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {monthData.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                        {formatAmount(monthData.총지출)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {annualTotal > 0
                          ? `${((monthData.총지출 / annualTotal) * 100).toFixed(
                              1
                            )}%`
                          : "0%"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전체
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                      {formatAmount(annualTotal)}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                      100%
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default YearlyConsumptionChart;
