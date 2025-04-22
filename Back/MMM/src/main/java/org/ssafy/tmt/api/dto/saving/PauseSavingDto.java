package org.ssafy.tmt.api.dto.saving;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PauseSavingDto {
	private String savingAccountNumber;
}
