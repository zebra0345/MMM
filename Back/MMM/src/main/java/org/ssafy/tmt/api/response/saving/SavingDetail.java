package org.ssafy.tmt.api.response.saving;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.ssafy.tmt.api.dto.saving.SavingPercentDetailDto;
import org.ssafy.tmt.api.entity.saving.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SavingDetail {
	// 계좌번호
	private String accountNumber;
	// 잔액
	private long balance;
	// 은행명
	private String bank;
	// 월별 벌금액
	private long monthFines;
	// 일시정지 유무
	private boolean pause;
	// 생성후 경과일
	private int daysPassed;
	// 미수금
	private long misugeum;
	private int savingType;
	private List<AbsSaving> absSaving;
	private List<SavingPercentDetailDto> savingDetails;
	private CumulativeFines cumulativeFine;
	private MaxMin maxMin;
}
