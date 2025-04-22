package org.ssafy.tmt.api.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.ssafy.tmt.api.dto.ai.ConsumptionAnalyzeResponse;
import org.ssafy.tmt.api.dto.ai.FastAPIDto;
import org.ssafy.tmt.api.dto.ai.FastAPIRequest;
import org.ssafy.tmt.api.dto.transaction.ConsumptionList;
import org.ssafy.tmt.api.service.transaction.TransactionService;
import org.ssafy.tmt.config.security.CustomUserDetails;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {
    private final TransactionService transactionService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${AI_API_URL}")
    private String fastApiUrl;

    //*********************************************
    //**        AI 소비습관 분석 리포트 제공        **
    //*********************************************
    public ConsumptionAnalyzeResponse analyze(CustomUserDetails user) {
        // url설정하기
        String analyzeUrl = fastApiUrl + "/sobi-analyze";

        // 소비데이터 가져옴
        ConsumptionList consumptionList = (ConsumptionList) transactionService.getConsumptionTransaction(user).getBody();

        // Spring <-> FastAPI 형식 맞추기
        List<FastAPIDto> dtoList = consumptionList.getTransactions().stream()
                .map(tx -> {
                    FastAPIDto dto = new FastAPIDto();
                    dto.setId(tx.getId());
                    dto.setAmount(tx.getAmount());                    // int 형 맞음
                    dto.setCategory(tx.getCategory());
                    dto.setItem(tx.getItem());
                    dto.setCreatedAt(tx.getCreatedAt().toString());   // ISO 8601 포맷
                    return dto;
                })
                .collect(Collectors.toList());

        FastAPIRequest request = new FastAPIRequest(dtoList);
        try {
            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writeValueAsString(request);
            System.out.println("🔍 FastAPI로 보낼 JSON:\n" + json);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        // -------- FASTAPI 분석 내역 가져오기 --------
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<FastAPIRequest> entity = new HttpEntity<>(request, headers);

        // 답변담기
        ResponseEntity<ConsumptionAnalyzeResponse> response = restTemplate.exchange(
                analyzeUrl,
                HttpMethod.POST,
                entity,
                ConsumptionAnalyzeResponse.class
        );
        return response.getBody();
    }
}
