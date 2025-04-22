package org.ssafy.tmt.api.request.consumption;

import lombok.*;
import org.ssafy.tmt.api.request.saving.SavingOptionRequest;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LimitRequest {
	private Integer maxLimit;
	private Integer tagLimit;
	private MaxTagLimitDto maxTagLimit;

	@Data
	public static class MaxTagLimitDto {
		private List<MaxTagLimitDto.MaxLimitDetailDto> maxLimit;
		private MaxTagLimitDto.TagLimitDetailDto tagLimit;

		@Data
		public static class MaxLimitDetailDto {
			private Integer max;
		}

		@Data
		public static class TagLimitDetailDto {
			private Integer max;
			private String tag;
		}
	}
}

