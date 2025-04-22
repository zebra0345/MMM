package org.ssafy.tmt.api.request.saving;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.ssafy.tmt.api.dto.saving.AbsSavingDto;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbsSavingUpdateRequestDto {
	List<AbsSavingDto> absSavingDtoList;
}
