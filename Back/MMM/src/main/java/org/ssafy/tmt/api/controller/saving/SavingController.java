package org.ssafy.tmt.api.controller.saving;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;
import org.ssafy.tmt.api.dto.saving.PauseSavingDto;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.repository.accounts.SavingAccountRepository;
import org.ssafy.tmt.api.request.saving.AbsSavingUpdateRequestDto;
import org.ssafy.tmt.api.request.saving.SavingOptionRequest;
import org.ssafy.tmt.api.request.saving.SavingPercentUpdateDto;
import org.ssafy.tmt.api.service.saving.SavingService;
import org.ssafy.tmt.config.security.CustomUserDetails;
import org.ssafy.tmt.util.MessageUtil;
import org.ssafy.tmt.util.Response;

import java.beans.PropertyEditorSupport;
import java.io.IOException;

@RestController
@RequestMapping("/saving")
@Slf4j
@RequiredArgsConstructor
public class SavingController {
	private final SavingService savingService;
	private final SavingAccountRepository savingAccountRepository;

	@PostMapping("/choice")
	public ResponseEntity<Object> setSavingOption(@ModelAttribute SavingOptionRequest savingOption,
												  @AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return savingService.setSavingOption(savingOption, customUserDetails);
	}

	@GetMapping("/test")
	public ResponseEntity<Object> test() throws IOException {
		savingService.forcedSaving();
		return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
	}

	@GetMapping
	public ResponseEntity<Object> getSavingDtoList(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return savingService.getSaving(customUserDetails);
	}

	@PatchMapping("/pause")
	public ResponseEntity<Object> pause(@RequestBody PauseSavingDto pauseSavingDto, @AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return savingService.pauseSaving(pauseSavingDto, customUserDetails);
	}

	@PatchMapping("/resume")
	public ResponseEntity<Object> resume(@RequestBody PauseSavingDto pauseSavingDto, @AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return savingService.resumeSaving(pauseSavingDto, customUserDetails);
	}

	@DeleteMapping
	public ResponseEntity<Object> deleteSaving(@RequestBody PauseSavingDto pauseSavingDto, @AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return savingService.deleteSaving(pauseSavingDto, customUserDetails);
	}

	@GetMapping("/testpage")
	public ResponseEntity<Object> testpage(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return savingService.testPage();
	}

	@InitBinder
	public void initBinder(WebDataBinder binder) {
		binder.registerCustomEditor(SavingOptionRequest.SavingTypeDto.class, new PropertyEditorSupport() {
			@Override
			public void setAsText(String text) throws IllegalArgumentException {
				try {
					SavingOptionRequest.SavingTypeDto dto = new ObjectMapper().readValue(text, SavingOptionRequest.SavingTypeDto.class);
					setValue(dto);
				} catch (IOException e) {
					throw new IllegalArgumentException("Invalid JSON for savingType", e);
				}
			}
		});
	}

	@GetMapping("/{saving_account_id}")
	public ResponseEntity<Object> savingDetail(@PathVariable("saving_account_id") int savingAccountId, @AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return savingService.savingDetail(savingAccountId, customUserDetails);
	}

	@GetMapping("/detailtransaction")
	public ResponseEntity<Object> detailTransaction(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return savingService.calculationDetail(customUserDetails);
	}

	@PatchMapping("/percent")
	public ResponseEntity<Object> updatePercent(@RequestBody SavingPercentUpdateDto savingPercentUpdateDto, @AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return savingService.updateSavingPercent(savingPercentUpdateDto, customUserDetails);
	}

	@PatchMapping("/abs")
	public ResponseEntity<Object> updateAbs(@RequestBody AbsSavingUpdateRequestDto absSavingUpdateRequestDto, @AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return savingService.updateAbsSaving(absSavingUpdateRequestDto, customUserDetails);
	}
}
