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
import {
  formatAmount,
  formatMonth,
  CHART_COLORS,
} from "../../utils/formatters";

const MonthlyConsumption = ({ data }) => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  ); // YYYY-MM 형식
  const [prevMonth, setPrevMonth] = useState("");

  // 선택된 월이 변경될 때 이전 월 계산
  useEffect(() => {
    const selectedDate = new Date(selectedMonth + "-01");
    const prevDate = new Date(selectedDate);
    prevDate.setMonth(selectedDate.getMonth() - 1);
    setPrevMonth(prevDate.toISOString().slice(0, 7));
  }, [selectedMonth]);

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">
          월간 소비 데이터가 없습니다.
        </p>
      </div>
    );
  }

  // 데이터 형식에 따라 적절히 가공
  const monthlyData = data.monthlyReport || [];

  // 선택된 월의 데이터 찾기
  const currentMonthData = monthlyData.find(
    (item) => item.month === selectedMonth
  ) || {
    month: selectedMonth,
    spendingAmount: 0,
    savingAmount: 0,
    categoryData: [],
  };

  // 이전 월의 데이터 찾기
  const previousMonthData = monthlyData.find(
    (item) => item.month === prevMonth
  ) || {
    month: prevMonth,
    spendingAmount: 0,
    savingAmount: 0,
    categoryData: [],
  };

  // 카테고리별 데이터 가공 (파이 차트용)
  const categoryData = [...(currentMonthData.categoryData || [])].sort(
    (a, b) => b.amount - a.amount
  );

  // 월별 옵션 생성
  const getMonthOptions = () => {
    const months = new Set(monthlyData.map((item) => item.month));
    // 현재 월 추가 (데이터에 없을 경우)
    months.add(selectedMonth);
    return Array.from(months).sort((a, b) => b.localeCompare(a)); // 내림차순 정렬
  };

  // 카테고리별 이전 월 대비 변화 계산
  const calculateChange = (category) => {
    const currentCategoryData = currentMonthData.categoryData?.find(
      (c) => c.name === category
    ) || { amount: 0 };
    const prevCategoryData = previousMonthData.categoryData?.find(
      (c) => c.name === category
    ) || { amount: 0 };

    if (prevCategoryData.amount === 0) return null; // 이전 달 데이터가 없으면 변화율 계산 불가

    const change =
      ((currentCategoryData.amount - prevCategoryData.amount) /
        prevCategoryData.amount) *
      100;
    return change.toFixed(1);
  };

  // 총 소비 변화율 계산
  const calculateTotalChange = () => {
    if (previousMonthData.spendingAmount === 0) return null;

    const change =
      ((currentMonthData.spendingAmount - previousMonthData.spendingAmount) /
        previousMonthData.spendingAmount) *
      100;
    return change.toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* 월 선택 */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          월 선택
        </label>
        <select
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {getMonthOptions().map((month) => (
            <option key={month} value={month}>
              {formatMonth(month)}
            </option>
          ))}
        </select>
      </div>

      {/* 월별 요약 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {formatMonth(selectedMonth)} 소비 요약
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-500 font-medium">총 소비 금액</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              {formatAmount(currentMonthData.spendingAmount)}
            </p>
            {calculateTotalChange() !== null && (
              <p
                className={`text-sm mt-1 ${
                  parseFloat(calculateTotalChange()) > 0
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {parseFloat(calculateTotalChange()) > 0 ? "▲" : "▼"}{" "}
                {Math.abs(parseFloat(calculateTotalChange()))}% (전월 대비)
              </p>
            )}
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-500 font-medium">총 벌금 금액</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {formatAmount(currentMonthData.savingAmount)}
            </p>
            <p className="text-sm text-green-600 mt-1">
              {currentMonthData.spendingAmount > 0
                ? `벌금율: ${(
                    (currentMonthData.savingAmount /
                      (currentMonthData.spendingAmount +
                        currentMonthData.savingAmount)) *
                    100
                  ).toFixed(1)}%`
                : "벌금율: 0%"}
            </p>
          </div>
        </div>
      </div>

      {/* 카테고리별 지출 분석 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          카테고리별 지출 분석
        </h2>

        {categoryData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 파이 차트 */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="name"
                    label={false} // 라벨 제거
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatAmount(value)}
                    labelFormatter={(name) => `${name}`}
                  />
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
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        변화율
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryData.map((category, index) => {
                      const percentage =
                        currentMonthData.spendingAmount > 0
                          ? (
                              (category.amount /
                                currentMonthData.spendingAmount) *
                              100
                            ).toFixed(1)
                          : "0.0";
                      const change = calculateChange(category.name);

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
                            {formatAmount(category.amount)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                            {percentage}%
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                            {change !== null ? (
                              <span
                                className={`${
                                  parseFloat(change) > 0
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {parseFloat(change) > 0 ? "▲" : "▼"}{" "}
                                {Math.abs(parseFloat(change))}%
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-gray-500">
            {formatMonth(selectedMonth)}의 카테고리별 소비 데이터가 없습니다.
          </div>
        )}
      </div>

      {/* 이전 달 대비 비교 */}
      {categoryData.length > 0 && previousMonthData.spendingAmount > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            이전 달 대비 변화
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {formatMonth(prevMonth)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {formatMonth(selectedMonth)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    변화
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryData.map((category, index) => {
                  const prevCategoryData = previousMonthData.categoryData?.find(
                    (c) => c.name === category.name
                  ) || { amount: 0 };
                  const change = calculateChange(category.name);

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 font-medium">
                        {formatAmount(prevCategoryData.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                        {formatAmount(category.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {change !== null ? (
                          <span
                            className={`${
                              parseFloat(change) > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {parseFloat(change) > 0 ? "▲" : "▼"}{" "}
                            {Math.abs(parseFloat(change))}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    합계
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {formatAmount(previousMonthData.spendingAmount)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                    {formatAmount(currentMonthData.spendingAmount)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    {calculateTotalChange() !== null ? (
                      <span
                        className={`${
                          parseFloat(calculateTotalChange()) > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {parseFloat(calculateTotalChange()) > 0 ? "▲" : "▼"}{" "}
                        {Math.abs(parseFloat(calculateTotalChange()))}%
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 소비 인사이트 */}
      {calculateTotalChange() !== null && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            소비 인사이트
          </h2>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-md font-medium text-gray-800">
                총 소비 변화
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {parseFloat(calculateTotalChange()) > 0
                  ? `${formatMonth(
                      selectedMonth
                    )}의 총 소비는 전월 대비 ${Math.abs(
                      parseFloat(calculateTotalChange())
                    )}% 증가했습니다.`
                  : `${formatMonth(
                      selectedMonth
                    )}의 총 소비는 전월 대비 ${Math.abs(
                      parseFloat(calculateTotalChange())
                    )}% 감소했습니다.`}
              </p>
            </div>

            {categoryData.map((category, index) => {
              const change = calculateChange(category.name);
              if (change === null) return null;

              const isIncrease = parseFloat(change) > 5; // 5% 이상 증가한 경우
              const isDecrease = parseFloat(change) < -5; // 5% 이상 감소한 경우

              if (!isIncrease && !isDecrease) return null;

              return (
                <div
                  key={index}
                  className={`border-l-4 ${
                    isIncrease ? "border-red-500" : "border-green-500"
                  } pl-4 py-2`}
                >
                  <h3 className="text-md font-medium text-gray-800">
                    {category.name} 지출 {isIncrease ? "증가" : "감소"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {isIncrease
                      ? `${category.name} 지출이 전월 대비 ${Math.abs(
                          parseFloat(change)
                        )}% 증가했습니다. 해당 카테고리의 지출을 줄이는 방안을 고려해보세요.`
                      : `${category.name} 지출이 전월 대비 ${Math.abs(
                          parseFloat(change)
                        )}% 감소했습니다. 좋은 소비 습관을 유지하고 있습니다!`}
                  </p>
                </div>
              );
            })}

            {/* 가장 많은 지출 카테고리 분석 */}
            {categoryData.length > 0 && (
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h3 className="text-md font-medium text-gray-800">
                  주요 지출 카테고리
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formatMonth(selectedMonth)}의 가장 많은 지출은{" "}
                  {categoryData[0].name}({formatAmount(categoryData[0].amount)}
                  )입니다.
                  {currentMonthData.spendingAmount > 0 &&
                    ` 전체 지출의 ${(
                      (categoryData[0].amount /
                        currentMonthData.spendingAmount) *
                      100
                    ).toFixed(1)}%를 차지하고 있습니다.`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyConsumption;
