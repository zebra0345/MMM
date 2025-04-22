package org.ssafy.tmt.api.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Recommendation {
    @JsonProperty("credit_cards")
    private List<CardInfo> creditCards;

    @JsonProperty("check_cards")
    private List<CardInfo> checkCards;
}
