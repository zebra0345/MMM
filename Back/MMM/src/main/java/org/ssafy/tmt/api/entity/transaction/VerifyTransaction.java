package org.ssafy.tmt.api.entity.transaction;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;
import org.springframework.data.annotation.CreatedDate;
import org.ssafy.tmt.api.entity.account.Accounts;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class VerifyTransaction {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@NotFound(action = NotFoundAction.IGNORE)
	@JoinColumn(name = "account_id", nullable = false, updatable = false)
	@JsonIgnore
	private Accounts account;

	@Column(nullable = false)
	private String verifyNumber; // 6글자

	@Column(nullable = false)
	private int amount;

	@CreatedDate
	@Column(updatable = false, nullable = false, columnDefinition = "DATETIME(0)")
	private LocalDateTime createdAt;

	@Builder(toBuilder = true)
	public VerifyTransaction(int id, Accounts account, String verifyNumber, int amount, LocalDateTime createdAt) {
		this.id = id;
		this.account = account;
		this.verifyNumber = verifyNumber;
		this.amount = amount;
		this.createdAt = createdAt;
	}
}