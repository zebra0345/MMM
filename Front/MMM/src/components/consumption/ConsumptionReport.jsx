import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { getCardRecommendations } from "../../services/consumptionService";

const ConsumptionReport = ({ monthlyData, tendencyData }) => {
  const [aiAnalysisData, setAiAnalysisData] = useState(null);
  const [cardRecommendations, setCardRecommendations] = useState(null);
  const [isLoadingAiData, setIsLoadingAiData] = useState(false);
  const [aiError, setAiError] = useState(null);
  
  // 분석 기반 카드 추천 데이터 로드
  useEffect(() => {
    const loadCardRecommendations = async () => {
      try {
        setIsLoadingAiData(true);
        const data = await getCardRecommendations();
        setCardRecommendations(data);
      } catch (error) {
        console.error("카드 추천 데이터 로드 실패:", error);
        setAiError("카드 추천 데이터를 불러오는데 실패했습니다. 3개월 이상의 소비 데이터가 필요합니다.");
      } finally {
        setIsLoadingAiData(false);
      }
    };

    if (tendencyData && tendencyData.result) {
      setAiAnalysisData(tendencyData);
      loadCardRecommendations();
    }
  }, [tendencyData]);

  // 기본 색상 세트
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  // 금액 포맷 함수
  const formatAmount = (amount) => {
    return amount ? amount.toLocaleString("ko-KR") + "원" : "0원";
  };

  // 3개월 데이터만 필터링
  const getRecentMonthsData = () => {
    if (!monthlyData || !monthlyData.monthlyReport || monthlyData.monthlyReport.length === 0) {
      return [];
    }

    return [...monthlyData.monthlyReport]
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 3)
      .reverse();
  };

  // 월별 소비 추이 데이터 생성
  const createMonthlyTrendData = () => {
    const recentMonthsData = getRecentMonthsData();

    return recentMonthsData.map((item) => {
      const month = new Date(item.month + "-01").toLocaleDateString("ko-KR", {
        month: "short",
      });

      return {
        name: month,
        소비: item.spendingAmount,
        저축: item.savingAmount,
      };
    });
  };

  // 카테고리별 월간 소비 추이 데이터 생성
  const createCategoryTrendData = () => {
    const recentMonthsData = getRecentMonthsData();
    if (recentMonthsData.length === 0) return [];

    const allCategories = new Set();

    // 모든 카테고리 목록 가져오기
    recentMonthsData.forEach((item) => {
      if (item.categoryData) {
        item.categoryData.forEach((cat) => {
          allCategories.add(cat.name);
        });
      }
    });

    // 월별 카테고리 데이터 생성
    return Array.from(allCategories).map((category) => {
      const data = { name: category };

      recentMonthsData.forEach((item) => {
        const month = new Date(item.month + "-01").toLocaleDateString("ko-KR", {
          month: "short",
        });

        const categoryAmount =
          item.categoryData?.find((cat) => cat.name === category)?.amount || 0;
        data[month] = categoryAmount;
      });

      return data;
    });
  };

  // 카테고리별 총 지출 계산
  const calculateTotalByCategory = () => {
    const recentMonthsData = getRecentMonthsData();
    if (recentMonthsData.length === 0) return [];

    const categoryTotals = {};

    recentMonthsData.forEach((item) => {
      if (item.categoryData) {
        item.categoryData.forEach((cat) => {
          if (!categoryTotals[cat.name]) {
            categoryTotals[cat.name] = 0;
          }
          categoryTotals[cat.name] += cat.amount;
        });
      }
    });

    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        value: amount,
      }))
      .sort((a, b) => b.value - a.value);
  };

  // 저축률 계산
  const calculateSavingRate = () => {
    const recentMonthsData = getRecentMonthsData();
    if (recentMonthsData.length === 0) return "0.0";

    const totalSpending = recentMonthsData.reduce(
      (sum, item) => sum + (item.spendingAmount || 0),
      0
    );
    const totalSaving = recentMonthsData.reduce(
      (sum, item) => sum + (item.savingAmount || 0),
      0
    );

    if (totalSpending + totalSaving === 0) return "0.0";

    return ((totalSaving / (totalSpending + totalSaving)) * 100).toFixed(1);
  };

  // AI 분석 데이터 가공 (레이더 차트용)
  const createAiAnalysisData = () => {
    if (!aiAnalysisData || !aiAnalysisData.result) return [];

    return aiAnalysisData.result
      .filter(category => category.원래량 > 0 || category.예측값 > 0)
      .map((category) => ({
        subject: category.category,
        원래량: category.원래량,
        예측값: category.예측값,
        fullMark: 100,
      }));
  };

  // 월별 통계 계산
  const calculateMonthlyStats = () => {
    const recentMonthsData = getRecentMonthsData();
    if (recentMonthsData.length === 0)
      return { avg: 0, max: 0, min: 0, maxMonth: "", minMonth: "" };

    let totalSpending = 0;
    let maxSpending = 0;
    let minSpending = Number.MAX_SAFE_INTEGER;
    let maxMonth = "";
    let minMonth = "";

    recentMonthsData.forEach((item) => {
      totalSpending += item.spendingAmount || 0;

      if ((item.spendingAmount || 0) > maxSpending) {
        maxSpending = item.spendingAmount || 0;
        maxMonth = item.month;
      }

      if ((item.spendingAmount || 0) < minSpending && (item.spendingAmount || 0) > 0) {
        minSpending = item.spendingAmount || 0;
        minMonth = item.month;
      }
    });

    // 만약 모든 지출이 0이면 minSpending도 0으로 설정
    if (minSpending === Number.MAX_SAFE_INTEGER) {
      minSpending = 0;
    }

    return {
      avg: recentMonthsData.length > 0 ? totalSpending / recentMonthsData.length : 0,
      max: maxSpending,
      min: minSpending,
      maxMonth: maxMonth ? new Date(maxMonth + "-01").toLocaleDateString("ko-KR", {
        month: "long",
      }) : "",
      minMonth: minMonth ? new Date(minMonth + "-01").toLocaleDateString("ko-KR", {
        month: "long",
      }) : "",
    };
  };

  // 데이터 준비
  const monthlyTrendData = createMonthlyTrendData();
  const categoryTrendData = createCategoryTrendData();
  const categoryTotalData = calculateTotalByCategory();
  const aiAnalysisChartData = createAiAnalysisData();
  const monthlyStats = calculateMonthlyStats();
  const savingRate = calculateSavingRate();

  if (!monthlyData || !monthlyData.monthlyReport || monthlyData.monthlyReport.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center">
            소비 리포트 데이터가 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 소비 요약 및 통계 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          최근 3개월 소비 통계
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-500 font-medium">총 소비액</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              {formatAmount(
                monthlyTrendData.reduce((sum, item) => sum + (item.소비 || 0), 0)
              )}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-500 font-medium">총 저축액</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {formatAmount(
                monthlyTrendData.reduce((sum, item) => sum + (item.저축 || 0), 0)
              )}
            </p>
            <p className="text-sm mt-1 text-green-600">저축률: {savingRate}%</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-500 font-medium">
              평균 월 소비액
            </p>
            <p className="text-2xl font-bold text-purple-700 mt-1">
              {formatAmount(monthlyStats.avg)}
            </p>
          </div>
        </div>
      </div>

      {/* 월별 소비 추이 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          월별 소비/저축 추이
        </h2>
        {monthlyTrendData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyTrendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatAmount(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="소비"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="저축" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
            
            {monthlyStats.maxMonth && monthlyStats.minMonth && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">
                    가장 소비가 많았던 달:{" "}
                    <span className="font-semibold text-blue-600">
                      {monthlyStats.maxMonth}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    금액:{" "}
                    <span className="font-semibold text-blue-600">
                      {formatAmount(monthlyStats.max)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    가장 소비가 적었던 달:{" "}
                    <span className="font-semibold text-green-600">
                      {monthlyStats.minMonth}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    금액:{" "}
                    <span className="font-semibold text-green-600">
                      {formatAmount(monthlyStats.min)}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 text-center text-gray-500">
            월별 소비 데이터가 없습니다.
          </div>
        )}
      </div>

      {/* 소비 유형 분석 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          소비 유형 분석
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 파이 차트 */}
          {categoryTotalData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryTotalData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryTotalData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmount(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
              <p className="text-gray-500">카테고리 데이터가 없습니다.</p>
            </div>
          )}

          {/* AI 소비 분석 차트 */}
          <div className="h-80">
            {aiAnalysisChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={aiAnalysisChartData}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="현재 소비"
                    dataKey="원래량"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="예측 소비"
                    dataKey="예측값"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  {isLoadingAiData ? "AI 분석 데이터 로딩 중..." : "AI 분석 데이터가 없습니다."}
                </p>
                {!isLoadingAiData && !aiAnalysisData && !aiError && (
                  <p className="text-sm text-gray-400 mt-2">
                    AI 분석을 위해서는 최소 3개월 이상의 소비 데이터가 필요합니다.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 카테고리별 분석 */}
        {categoryTotalData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">
              카테고리별 소비 분석
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
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
                  {categoryTotalData.map((category, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          ></div>
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                        {formatAmount(category.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {(
                          (category.value /
                            categoryTotalData.reduce(
                              (sum, cat) => sum + cat.value,
                              0
                            )) *
                          100
                        ).toFixed(1)}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 카테고리별 월간 소비 추이 */}
      {categoryTrendData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            카테고리별 월간 소비 추이
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryTrendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatAmount(value)} />
                <Legend />
                {monthlyTrendData.map((month, index) => (
                  <Bar
                    key={month.name}
                    dataKey={month.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI 분석 요약 */}
      {aiAnalysisData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            AI 소비 분석 결과
          </h2>
          <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r-lg mb-5">
            <p className="text-lg font-medium">{aiAnalysisData.요약}</p>
          </div>
          
          <div className="space-y-4">
            {aiAnalysisData.result.filter(item => Math.abs(item.변화량) > 5).map((item, index) => (
              <div 
                key={index} 
                className={`border-l-4 ${item.변화량 > 0 ? 'border-green-500' : 'border-red-500'} pl-4 py-2`}
              >
                <h3 className="text-md font-medium text-gray-800">
                  {item.category} - {item.해석}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  현재 소비 비중: {item.원래량.toFixed(1)}%, 
                  예측 소비 비중: {item.예측값.toFixed(1)}% 
                  ({item.변화량 > 0 ? '+' : ''}{item.변화량.toFixed(1)}%)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 카드 추천 */}
      {cardRecommendations && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            소비 패턴 기반 카드 추천
          </h2>
          <div className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50 rounded-r-lg mb-5">
            <p className="text-sm">
              <span className="font-medium">소비 프로필:</span> {cardRecommendations.user_profile}
            </p>
          </div>
          
          {/* 신용카드 추천 */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">추천 신용카드</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cardRecommendations.recommendation.credit_cards.map((card, index) => (
                <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                  <div className="p-4 border-b bg-gray-50">
                    <h4 className="font-medium text-blue-600">{card.card_name}</h4>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3">{card.benefit}</p>
                    {card.image_url && (
                      <div className="flex justify-center">
                        <img 
                          src={card.image_url} 
                          alt={card.card_name} 
                          className="h-32 object-contain" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 체크카드 추천 */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">추천 체크카드</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cardRecommendations.recommendation.check_cards.map((card, index) => (
                <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                  <div className="p-4 border-b bg-gray-50">
                    <h4 className="font-medium text-green-600">{card.card_name}</h4>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3">{card.benefit}</p>
                    {card.image_url && (
                      <div className="flex justify-center">
                        <img 
                          src={card.image_url} 
                          alt={card.card_name} 
                          className="h-32 object-contain" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {aiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <p className="text-red-700">{aiError}</p>
          <p className="text-sm text-red-600 mt-1">
            AI 분석을 위해서는 최소 3개월 이상의 소비 데이터가 필요합니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConsumptionReport;