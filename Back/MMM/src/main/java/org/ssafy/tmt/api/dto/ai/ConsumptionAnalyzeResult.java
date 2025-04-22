package org.ssafy.tmt.api.dto.ai;

import lombok.Data;
// -*- coding: utf-8 -*-
@Data
public class ConsumptionAnalyzeResult {
    private String category;
    private double 원래량;
    private double 예측값;
    private double 변화량;
    private String 해석;
}
