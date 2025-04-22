package org.ssafy.tmt.api.service.saving;

import org.springframework.http.ResponseEntity;
import org.ssafy.tmt.api.dto.saving.PauseSavingDto;
import org.ssafy.tmt.api.request.saving.AbsSavingUpdateRequestDto;
import org.ssafy.tmt.api.request.saving.SavingOptionRequest;
import org.ssafy.tmt.api.request.saving.SavingPercentUpdateDto;
import org.ssafy.tmt.config.security.CustomUserDetails;

import java.io.IOException;

public interface SavingService {
	ResponseEntity<Object> setSavingOption(SavingOptionRequest savingOptionRequest, CustomUserDetails customUserDetails);
	void forcedSaving() throws IOException;
	ResponseEntity<Object> getSaving(CustomUserDetails customUserDetails);
	ResponseEntity<Object> pauseSaving(PauseSavingDto pauseSavingDto,CustomUserDetails customUserDetails);
	ResponseEntity<Object> resumeSaving(PauseSavingDto pauseSavingDto, CustomUserDetails customUserDetails);
	ResponseEntity<Object> deleteSaving(PauseSavingDto pauseSavingDto, CustomUserDetails customUserDetails);
	ResponseEntity<Object> testPage();
	ResponseEntity<Object> savingDetail(int savingAccountId, CustomUserDetails customUserDetails);
	ResponseEntity<Object> calculationDetail(CustomUserDetails customUserDetails);
	ResponseEntity<Object> updateSavingPercent(SavingPercentUpdateDto savingPercentUpdateDto, CustomUserDetails customUserDetails);
	ResponseEntity<Object> updateAbsSaving(AbsSavingUpdateRequestDto absSavingUpdateRequestDto, CustomUserDetails customUserDetails);
}
