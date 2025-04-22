package org.ssafy.tmt.api.entity.saving;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.entity.account.SpendingAccount;
import org.ssafy.tmt.api.entity.user.Users;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MoneyFlow {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	// 저축계좌
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "saving_account_id", nullable = false, updatable = false)
	@JsonIgnore
	private SavingAccount savingAccount;

	// 출금계좌
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "spending_account_id", nullable = false, updatable = false)
	@JsonIgnore
	private SpendingAccount spendingAccount;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, updatable = false)
	@JsonIgnore
	private Users user;
}
