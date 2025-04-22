package org.ssafy.tmt.api.dto.saving;

import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AbsSavingDto {
	private int id;
	private int maxAmount;
	private int savingAmount;
	private boolean active;
}
