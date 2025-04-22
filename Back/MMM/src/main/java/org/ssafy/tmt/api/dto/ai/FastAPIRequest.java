package org.ssafy.tmt.api.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FastAPIRequest {
    private List<FastAPIDto> transactions;
}