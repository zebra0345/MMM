package org.ssafy.tmt.api.entity.saving;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AbsSaving {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	// 저축방식
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "saving_option_id", nullable = false, updatable = false)
	@JsonIgnore
	private SavingOption savingOption;

	// 상한값
	@Column
	@Builder.Default
	private int maxAmount=0;

	// 저축액
	@Column
	@Builder.Default
	private int savingAmount=0;

	// 활성여부
	@Column(columnDefinition = "TINYINT(1)", nullable = false)
	@Builder.Default
	private boolean active=false;

	public void update(int savingAmount, boolean active) {
		this.savingAmount = savingAmount;
		this.active = active;
	}
}
