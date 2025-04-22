package org.ssafy.tmt.api.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CardRecommendResponse {
    @JsonProperty("user_profile")
    private String userProfile;

    @JsonProperty("recommendation")
    private Recommendation recommendation;
}