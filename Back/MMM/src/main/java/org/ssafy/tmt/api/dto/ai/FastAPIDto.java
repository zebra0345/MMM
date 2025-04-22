package org.ssafy.tmt.api.dto.ai;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FastAPIDto {
    private int id;
    private long amount;
    private String category;
    private String item;
    private String createdAt; // ISO 8601 포맷
}
