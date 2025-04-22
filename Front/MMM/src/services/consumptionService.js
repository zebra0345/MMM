import api from "../axios";

// 소비 분석 관련 API
export const getMonthlyReport = async (year) => {
  try {
    // 변경된 API 경로 - yearly-category에서 월별 데이터 가져오기
    const response = await api.get("/transaction/yearly-category", {
      params: { year },
    });

    // API에서 반환된 데이터를 이전 형식과 유사하게 변환
    const monthlyReport = response.data.map((monthData) => {
      const categoryData = Object.entries(monthData.categoryTotals).map(
        ([name, amount]) => ({
          name,
          amount,
        })
      );

      // 총 지출액 계산
      const spendingAmount = Object.values(monthData.categoryTotals).reduce(
        (sum, amount) => sum + amount,
        0
      );

      return {
        month: `${year}-${String(monthData.month).padStart(2, "0")}`,
        spendingAmount,
        savingAmount: 0, // 저축 데이터가 없으므로 0으로 설정
        categoryData,
      };
    });

    return {
      monthlyReport,
      totalSpendingAmount: monthlyReport.reduce(
        (sum, report) => sum + report.spendingAmount,
        0
      ),
      totalSavingAmount: 0, // 저축 데이터가 없으므로 0으로 설정
    };
  } catch (error) {
    console.error("월별 리포트 조회 에러:", error);
    return {
      monthlyReport: [],
      totalSpendingAmount: 0,
      totalSavingAmount: 0,
    };
  }
};

// 오늘 일자 소비 데이터 조회 API
export const getDailyReport = async () => {
  try {
    // 현재 날짜의 일별 소비 데이터 조회 (오늘 소비내역만 조회)
    const response = await api.get("/spending/analyze/daily");

    // 응답 데이터 처리
    if (!response.data || !response.data.dailyReport) {
      return {
        dailyReport: [],
        totalSpendingAmount: 0,
        totalSavingAmount: 0,
      };
    }

    return response.data;
  } catch (error) {
    console.error("오늘 일별 리포트 조회 에러:", error);
    return {
      dailyReport: [],
      totalSpendingAmount: 0,
      totalSavingAmount: 0,
    };
  }
};

// 특정 날짜의 일별 소비 보고서 조회
export const getDailyReportByDate = async (dateStr) => {
  try {
    // 날짜 형식 검증 (YYYY-MM-DD)
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error("잘못된 날짜 형식입니다. YYYY-MM-DD 형식이여야 합니다.");
    }

    // 특정 날짜의 소비 데이터 조회
    // 개발 환경에서 API 오류 발생 시 빈 데이터 반환
    try {
      const response = await api.get(`/spending/daily-report/${dateStr}`);

      // 응답 데이터가 없는 경우 기본값 반환
      if (!response.data) {
        return {
          dailyReport: [],
          totalSpendingAmount: 0,
          totalSavingAmount: 0,
        };
      }

      // 응답 데이터가 dailyReport 형태가 아닌 경우 변환
      if (!response.data.dailyReport) {
        // 응답이 배열인 경우, dailyReport 객체로 변환
        if (Array.isArray(response.data)) {
          const totalSpendingAmount = response.data.reduce(
            (sum, item) => sum + (item.spendingAmount || 0),
            0
          );
          const totalSavingAmount = response.data.reduce(
            (sum, item) => sum + (item.savingAmount || 0),
            0
          );

          return {
            dailyReport: response.data,
            totalSpendingAmount,
            totalSavingAmount,
          };
        }

        // 일관된 형식으로 반환
        return {
          dailyReport: [],
          totalSpendingAmount: 0,
          totalSavingAmount: 0,
        };
      }

      return response.data;
    } catch (apiError) {
      console.warn(
        `API 호출 오류: ${apiError.message}. 빈 데이터를 반환합니다.`
      );

      // API 오류 발생 시 빈 데이터 반환 (개발 중 서버 오류 대응)
      return {
        dailyReport: [],
        totalSpendingAmount: 0,
        totalSavingAmount: 0,
        error: "데이터를 불러올 수 없습니다. 서버 오류가 발생했습니다.",
      };
    }
  } catch (error) {
    console.error(`${dateStr} 일별 리포트 조회 에러:`, error);
    return {
      dailyReport: [],
      totalSpendingAmount: 0,
      totalSavingAmount: 0,
      error: error.message,
    };
  }
};

// AI 분석 관련 API
export const getConsumptionTendency = async () => {
  try {
    // 소비 형태 분석 API
    const response = await api.get("/ai/analyze");
    return response.data;
  } catch (error) {
    console.error("소비 유형 조회 에러:", error);
    // 에러 발생 시 null 반환하고 컴포넌트에서 처리
    return null;
  }
};

// 카드 추천 API
export const getCardRecommendations = async () => {
  try {
    const response = await api.get("/ai/card-recommend", {
      timeout: 20000, // 타임아웃을 20000밀리초(20초)로 설정
    });
    return response.data;
  } catch (error) {
    console.error("카드 추천 에러:", error);
    return null;
  }
};

// 고정지출 관련 API
export const getFixedExpenses = async () => {
  try {
    const response = await api.get("/spending/fixed-expense");
    return response.data;
  } catch (error) {
    console.error("고정지출 조회 에러:", error);
    return [];
  }
};

export const addFixedExpense = async (expense) => {
  try {
    const response = await api.post("/spending/fixed-expense", {
      accountNumber: expense.accountNumber || null,
      amount: expense.amount,
      item: expense.item,
      paymentDate: expense.paymentDate,
    });
    return response.data;
  } catch (error) {
    console.error("고정지출 추가 에러:", error);
    throw error;
  }
};

export const deleteFixedExpense = async (expenseId) => {
  try {
    const response = await api.delete("/spending/fixed-expense", {
      data: { fixedExpenseId: expenseId },
    });
    return response.data;
  } catch (error) {
    console.error("고정지출 삭제 에러:", error);
    throw error;
  }
};

// 연간 카테고리별 소비 데이터 조회 API
export const getYearlyCategoryData = async (year) => {
  try {
    const response = await api.get("/transaction/yearly-category", {
      params: { year },
    });
    return response.data;
  } catch (error) {
    console.error("연간 카테고리 데이터 조회 에러:", error);
    return [];
  }
};
