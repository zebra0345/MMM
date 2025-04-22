package org.ssafy.tmt.api.controller.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.ssafy.tmt.api.dto.ai.CardRecommendResponse;
import org.ssafy.tmt.api.dto.ai.ConsumptionAnalyzeResponse;
import org.ssafy.tmt.api.service.ai.AiService;
import org.ssafy.tmt.api.service.ai.CardService;
import org.ssafy.tmt.config.security.CustomUserDetails;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {
    private final AiService aiService;
    private final CardService cardService;
    @GetMapping("/analyze")
    public ResponseEntity<ConsumptionAnalyzeResponse> analyze(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(aiService.analyze(user));
    }

    @GetMapping("/card-recommend")
    public ResponseEntity<CardRecommendResponse> recommend(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(cardService.cardRecommend(user));
    }
}
