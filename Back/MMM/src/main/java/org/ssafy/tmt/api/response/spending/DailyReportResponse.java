package org.ssafy.tmt.api.response.spending;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.ssafy.tmt.api.dto.transaction.SpendingWithSavingDto;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DailyReportResponse {
    List<SpendingWithSavingDto> dailyReport;
    private long totalSpendingAmount;
    private long totalSavingAmount;
}
