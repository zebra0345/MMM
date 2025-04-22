package org.ssafy.tmt.api.request.saving;

import lombok.*;
import org.ssafy.tmt.api.dto.saving.SavingPercentDetailDto;

import java.util.List;

@Getter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SavingPercentUpdateDto {
	private List<SavingPercentDetailDto> savingPercentDetails;
}
