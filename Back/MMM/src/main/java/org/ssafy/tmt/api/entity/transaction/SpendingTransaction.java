package org.ssafy.tmt.api.entity.transaction;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.entity.account.SpendingAccount;
import org.ssafy.tmt.api.entity.user.Users;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SpendingTransaction {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	// 출금계좌
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "spending_account_id", nullable = false, updatable = false)
	@JsonIgnore
	private SpendingAccount spendingAccount;

	// 저축계좌
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "saving_account_id")
	@JsonIgnore
	private SavingAccount savingAccount;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, updatable = false)
	@JsonIgnore
	private Users user;

	// 카테고리
	@Column
	private String category;

	// 인출금액
	@Column
	private long amount;

	// 결제 항목
	@Column
	private String item;

	// 거래일시
	@CreatedDate
	@Column(updatable = false, nullable = false, columnDefinition = "DATETIME(0)")
	private LocalDateTime createdAt;

	public void deleteSavingAccount() {
		this.savingAccount = null;
	}
}
