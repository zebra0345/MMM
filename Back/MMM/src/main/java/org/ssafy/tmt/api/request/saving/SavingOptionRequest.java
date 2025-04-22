package org.ssafy.tmt.api.request.saving;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Data
public class SavingOptionRequest {
	@NotNull
	private String savingAccountNumber;
	private SavingTypeDto savingType;

	@Data
	public static class SavingTypeDto {
		@NotNull
		private Integer savingType;
		private List<AbsSavingDto> absSaving;
		private PerSavingDto perSaving;

		@Data
		public static class AbsSavingDto {
			private Integer maxAmount;
			private Integer savingAmount;
			private boolean active;
		}

		@Data
		public static class PerSavingDto {
			private List<SavingPercentDto> savingPercent;
			private SavingMaxMinDto maxMin;

			@Data
			public static class SavingMaxMinDto {
				private Integer maxAmount;
				private Integer minAmount;
			}
		}

		@Data
		public static class SavingPercentDto {
			@NotNull
			private Integer percent;
			private String tag;
		}
	}
}
