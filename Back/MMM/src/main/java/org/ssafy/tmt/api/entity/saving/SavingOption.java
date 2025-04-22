package org.ssafy.tmt.api.entity.saving;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;
import org.ssafy.tmt.api.entity.account.SavingAccount;

@Entity
@Getter
@NoArgsConstructor
public class SavingOption {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	// 저축계좌
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "saving_account_id", nullable = false, updatable = false)
	@JsonIgnore
	private SavingAccount savingAccount;

	// 저축방식유형 (0: 절대값, 1: 퍼센트)
	@Column(columnDefinition = "TINYINT(1)")
	private int savingType;

	@Builder(toBuilder = true)
	public SavingOption(SavingAccount savingAccount, int savingType) {
		this.savingAccount = savingAccount;
		this.savingType = savingType;
	}
}
