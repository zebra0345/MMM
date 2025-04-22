package org.ssafy.tmt.api.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CardInfo {
    @JsonProperty("card_name")
    private String cardName;

    @JsonProperty("card_type")
    private String cardType;

    @JsonProperty("benefit")
    private String benefit;

    @JsonProperty("image_url")
    private String imageUrl;
}