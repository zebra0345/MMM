package org.ssafy.tmt.api.entity.saving;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class MaxMin {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	// 저축방식
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "saving_option_id", nullable = false, updatable = false)
	@JsonIgnore
	private SavingOption savingOption;

	// 최대저축금액
	@Column
	private Integer maxAmount;

	// 최소저축금액
	@Column
	private Integer minAmount;

	@Builder(toBuilder = true)
	public MaxMin(SavingOption savingOption, Integer maxAmount, Integer minAmount) {
		this.savingOption = savingOption;
		this.maxAmount = maxAmount;
		this.minAmount = minAmount;
	}
}
