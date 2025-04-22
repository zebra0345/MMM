package org.ssafy.tmt.api.service.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.http.server.reactive.HttpHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.ssafy.tmt.api.dto.ai.*;
import org.ssafy.tmt.api.dto.transaction.ConsumptionList;
import org.ssafy.tmt.api.service.transaction.TransactionService;
import org.ssafy.tmt.config.security.CustomUserDetails;
import org.springframework.http.*;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardService {
    private final TransactionService transactionService;
    private final RestTemplate restTemplate = new RestTemplate();


    @Value("${AI_API_URL}")
    private String fastAPIUrl;

    // 소비내역 제공
    public CardRecommendResponse cardRecommend(CustomUserDetails userDetails) {
        String url = fastAPIUrl + "/card-recommend";

        ConsumptionList consumptionList = (ConsumptionList) transactionService.getConsumptionTransaction(userDetails).getBody();

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

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.ALL));
        HttpEntity<FastAPIRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<CardRecommendResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                CardRecommendResponse.class
        );
        System.out.println(response.getBody());
        return response.getBody();
    }
}
