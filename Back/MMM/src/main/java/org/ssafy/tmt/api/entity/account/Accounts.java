package org.ssafy.tmt.api.entity.account;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.ssafy.tmt.api.entity.user.Users;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@SQLDelete(sql = "UPDATE accounts SET is_deleted = true WHERE id = ?")
@Where(clause = "is_deleted = false")
public class Accounts {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@NotFound(action = NotFoundAction.IGNORE)
	@JoinColumn(name = "user_id", nullable = false, updatable = false)
	@JsonIgnore
	private Users user;

	@Column(nullable = false)
	private String accountNumber;

	@Column(nullable = false)
	private long balance;

	@Column(nullable = false)
	private String bank;

	@Column(columnDefinition = "TINYINT(1)")
	private boolean isDeleted;

	@CreatedDate
	@Column(updatable = false, nullable = false, columnDefinition = "DATETIME(0)")
	private LocalDateTime createdAt;

	@LastModifiedDate
	@Column(nullable = false, columnDefinition = "DATETIME(0)")
	private LocalDateTime updatedAt;

	@Builder(toBuilder = true)
	public Accounts(int id, Users user, String accountNumber, long balance, String bank, boolean isDeleted, LocalDateTime createdAt, LocalDateTime updatedAt) {
		this.id = id;
		this.user = user;
		this.accountNumber = accountNumber;
		this.balance = balance;
		this.bank = bank;
		this.isDeleted = isDeleted;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	public void updateBalance(long newBalance) {
		this.balance = newBalance;
	}
}
