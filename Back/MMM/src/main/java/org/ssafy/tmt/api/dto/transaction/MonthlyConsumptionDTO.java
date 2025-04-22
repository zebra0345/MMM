package org.ssafy.tmt.api.dto.transaction;

import lombok.*;

import java.util.Map;

// Year의 소비내역을 반환하는 래퍼
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyConsumptionDTO {
    public int month;
    private Map<String, Long> categoryTotals;
}
