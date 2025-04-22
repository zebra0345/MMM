import { atom, selector } from "recoil";

// Recoil persist를 제거하고 일반 Recoil atom만 사용
// recoil-persist 설정 문제로 오류가 발생할 수 있음

// 현재 선택된 소비 분석 탭 (월별/일별/태그)
export const consumptionTabAtom = atom({
    key: "consumptionTabAtom",
    default: "monthly",
});

// 선택된 날짜 (월별 또는 일별)
export const selectedDateAtom = atom({
    key: "selectedDateAtom",
    default: new Date(),
});

// 월별 소비 데이터
export const monthlyConsumptionAtom = atom({
    key: "monthlyConsumptionAtom",
    default: null,
});

// 일별 소비 데이터
export const dailyConsumptionAtom = atom({
    key: "dailyConsumptionAtom",
    default: null,
});

// 소비 유형 데이터
export const consumptionTendencyAtom = atom({
    key: "consumptionTendencyAtom",
    default: null,
});

// 소비 태그 목록
export const consumptionTagsAtom = atom({
    key: "consumptionTagsAtom",
    default: [],
});

// 데이터 로딩 상태
export const dataLoadingAtom = atom({
    key: "dataLoadingAtom",
    default: false,
});

// 오류 상태
export const errorAtom = atom({
    key: "errorAtom",
    default: null,
});

// 총 소비액 셀렉터 (월별)
export const totalMonthlyConsumptionSelector = selector({
    key: "totalMonthlyConsumptionSelector",
    get: ({ get }) => {
        const monthlyData = get(monthlyConsumptionAtom);
        if (!monthlyData || !monthlyData.categoryData) return 0;
        
        return monthlyData.categoryData.reduce((sum, category) => sum + category.value, 0);
    },
});

// 총 소비액 셀렉터 (일별)
export const totalDailyConsumptionSelector = selector({
    key: "totalDailyConsumptionSelector",
    get: ({ get }) => {
        const dailyData = get(dailyConsumptionAtom);
        if (!dailyData || !dailyData.categoryData) return 0;
        
        return dailyData.categoryData.reduce((sum, category) => sum + category.value, 0);
    },
});

// 소비 분석 데이터 상태
export const hasConsumptionDataSelector = selector({
    key: "hasConsumptionDataSelector",
    get: ({ get }) => {
        const activeTab = get(consumptionTabAtom);
        const monthlyData = get(monthlyConsumptionAtom);
        const dailyData = get(dailyConsumptionAtom);
        
        if (activeTab === "monthly") {
            return !!monthlyData;
        } else if (activeTab === "daily") {
            return !!dailyData;
        }
        
        return false;
    },
});