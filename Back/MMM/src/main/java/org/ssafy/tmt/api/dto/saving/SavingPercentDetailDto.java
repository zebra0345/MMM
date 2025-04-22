package org.ssafy.tmt.api.dto.saving;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SavingPercentDetailDto {
	private int id;
	private String tag;
	private int percent;
}
