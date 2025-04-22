package org.ssafy.tmt.api.dto.ai;

import lombok.Data;

import java.util.List;

@Data
public class ConsumptionAnalyzeResponse {
    private String 요약;
    private List<ConsumptionAnalyzeResult> result;
}
