// src/utils/formatters.js
/**
 * 금액을 포맷팅하는 함수
 * @param {number} amount - 포맷팅할 금액
 * @returns {string} - 포맷팅된 금액 문자열
 */
export const formatAmount = (amount) => {
  return amount ? amount.toLocaleString("ko-KR") + "원" : "0원";
};

/**
 * 두 날짜가 같은 날인지 비교하는 함수
 * @param {Date} date1 - 첫 번째 날짜
 * @param {Date} date2 - 두 번째 날짜
 * @returns {boolean} - 두 날짜가 같은 날인지 여부
 */
export const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * 년월 포맷(YYYY-MM)을 사용자 친화적인 형태로 변환
 * @param {string} yyyymm - YYYY-MM 형식의 문자열
 * @returns {string} - 사용자 친화적인 형태의 날짜 문자열 (예: 2025년 4월)
 */
export const formatMonth = (yyyymm) => {
  if (!yyyymm) return "";
  const year = yyyymm.slice(0, 4);
  const month = yyyymm.slice(5, 7);
  return `${year}년 ${month}월`;
};

/**
 * 색상 배열 - 차트에서 공통으로 사용
 */
export const CHART_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FF6B6B",
  "#4ECDC4",
  "#C7F464",
  "#FF9800",
];