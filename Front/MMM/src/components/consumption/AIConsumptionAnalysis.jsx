import { useState, useEffect } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  getConsumptionTendency,
  getCardRecommendations,
} from "../../services/consumptionService";

const AIConsumptionAnalysis = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [cardRecommendations, setCardRecommendations] = useState(null);
  const [selectedTab, setSelectedTab] = useState("analysis");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 선택된 탭에 따라 필요한 데이터만 로드
        if (selectedTab === "analysis") {
          if (!analysisData) {
            const data = await getConsumptionTendency();
            setAnalysisData(data);
          }
        } else if (selectedTab === "recommendations") {
          if (!cardRecommendations) {
            const data = await getCardRecommendations();
            setCardRecommendations(data);
          }
        }
      } catch (err) {
        console.error(`AI 데이터 로드 오류: ${err}`);
        setError(
          "데이터를 불러오는 중 오류가 발생했습니다. 3개월 이상의 소비 데이터가 필요합니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedTab, analysisData, cardRecommendations]);

  // 레이더 차트 데이터 준비
  const prepareRadarChartData = () => {
    if (!analysisData || !analysisData.result) return [];

    return analysisData.result
      .filter((category) => category.원래량 > 0 || category.예측값 > 0)
      .map((category) => ({
        subject: category.category,
        현재소비: category.원래량,
        예측소비: category.예측값,
        fullMark: 100,
      }));
  };

  // 변화량이 큰 카테고리 추출 (상위 5개)
  const getSignificantChanges = () => {
    if (!analysisData || !analysisData.result) return [];

    return [...analysisData.result]
      .filter((item) => Math.abs(item.변화량) > 0)
      .sort((a, b) => Math.abs(b.변화량) - Math.abs(a.변화량))
      .slice(0, 5);
  };

  // 카드 분류 (신용카드, 체크카드)
  const getCardsGrouped = () => {
    if (!cardRecommendations || !cardRecommendations.recommendation)
      return { credit: [], check: [] };

    return {
      credit: cardRecommendations.recommendation.credit_cards || [],
      check: cardRecommendations.recommendation.check_cards || [],
    };
  };

  const radarData = prepareRadarChartData();
  const significantChanges = getSignificantChanges();
  const cardsGrouped = getCardsGrouped();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <p className="mt-2 text-sm">
            AI 분석을 위해서는 최소 3개월 이상의 소비 데이터가 필요합니다.
          </p>
        </div>
      );
    }

    // 소비 패턴 분석 탭
    if (selectedTab === "analysis") {
      return (
        <div className="space-y-6">
          {/* 소비 패턴 분석 섹션 */}
          {analysisData ? (
            <>
              {/* 요약 */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  소비 패턴 요약
                </h3>
                <p className="text-blue-700">{analysisData.요약}</p>
              </div>

              {/* 레이더 차트 */}
              {radarData.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-md font-medium text-gray-800 mb-4">
                    현재 소비 vs 예측 소비 패턴
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        data={radarData}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="현재 소비"
                          dataKey="현재소비"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Radar
                          name="예측 소비"
                          dataKey="예측소비"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* 주요 변화 */}
              {significantChanges.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-md font-medium text-gray-800 mb-4">
                    주목할 만한 소비 변화
                  </h3>
                  <div className="space-y-4">
                    {significantChanges.map((item, index) => (
                      <div
                        key={index}
                        className={`border-l-4 ${
                          item.변화량 > 0
                            ? "border-red-500"
                            : "border-green-500"
                        } pl-4 py-3 bg-gray-50 rounded-r-lg`}
                      >
                        <h4 className="font-medium text-gray-800">
                          {item.category} 카테고리
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          현재 소비 비중은 {item.원래량.toFixed(1)}%이며, 다음
                          달에는 {item.예측값.toFixed(1)}%로
                          <span
                            className={
                              item.변화량 > 0
                                ? "text-red-600 font-medium"
                                : "text-green-600 font-medium"
                            }
                          >
                            {" "}
                            {Math.abs(item.변화량).toFixed(1)}%{" "}
                            {item.변화량 > 0 ? "증가" : "감소"}{" "}
                          </span>
                          할 것으로 예상됩니다. {item.해석}입니다.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 전체 카테고리 변화 */}
              {analysisData.result && analysisData.result.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <h3 className="text-md font-medium text-gray-800 p-4 bg-gray-50 border-b">
                    전체 카테고리 변화
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            카테고리
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            현재
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            예측
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            변화
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            해석
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analysisData.result.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              {item.원래량.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              {item.예측값.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                              <span
                                className={`${
                                  item.변화량 > 0
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {item.변화량 > 0 ? "+" : ""}
                                {item.변화량.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {item.해석}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                소비 분석 데이터가 없습니다
              </h3>
              <p className="text-yellow-700">
                소비 패턴 분석을 위해서는 최소 3개월 이상의 소비 데이터가
                필요합니다. 소비 내역을 꾸준히 기록하면 AI가 당신의 소비 패턴을
                분석해 드립니다.
              </p>
            </div>
          )}
        </div>
      );
    }

    // 카드 추천 탭
    if (selectedTab === "recommendations") {
      if (!cardRecommendations) {
        return (
          <div className="p-10 text-center text-gray-500">
            카드 추천 데이터가 없습니다.
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {/* 소비 프로필 */}
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              소비 프로필
            </h3>
            <p className="text-purple-700">
              {cardRecommendations.user_profile}
            </p>
          </div>

          {/* 신용카드 추천 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              추천 신용카드
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cardsGrouped.credit.map((card, index) => (
                <div
                  key={index}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition duration-300"
                >
                  <div className="p-4 bg-blue-50 border-b">
                    <h4 className="font-medium text-blue-700">
                      {card.card_name}
                    </h4>
                  </div>
                  <div className="p-4 flex flex-col h-full">
                    {card.image_url && (
                      <div className="flex justify-center mb-4">
                        <img
                          src={card.image_url}
                          alt={card.card_name}
                          className="h-32 object-contain"
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-600 flex-grow">
                      {card.benefit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 체크카드 추천 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              추천 체크카드
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cardsGrouped.check.map((card, index) => (
                <div
                  key={index}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition duration-300"
                >
                  <div className="p-4 bg-green-50 border-b">
                    <h4 className="font-medium text-green-700">
                      {card.card_name}
                    </h4>
                  </div>
                  <div className="p-4 flex flex-col h-full">
                    {card.image_url && (
                      <div className="flex justify-center mb-4">
                        <img
                          src={card.image_url}
                          alt={card.card_name}
                          className="h-32 object-contain"
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-600 flex-grow">
                      {card.benefit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* 탭 메뉴 */}
      <div className="bg-white shadow rounded-lg">
        <div className="flex">
          <button
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              selectedTab === "analysis"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setSelectedTab("analysis")}
          >
            소비 패턴 분석
          </button>
          <button
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              selectedTab === "recommendations"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setSelectedTab("recommendations")}
          >
            카드 추천
          </button>
        </div>
      </div>

      {/* 탭 내용 */}
      {renderContent()}
    </div>
  );
};

export default AIConsumptionAnalysis;
