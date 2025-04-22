package org.ssafy.tmt.api.entity.account;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.ssafy.tmt.api.entity.user.Users;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SavingAccount {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	// 계좌
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "account_id", nullable = false, updatable = false)
	@JsonIgnore
	private Accounts account;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@NotFound(action = NotFoundAction.IGNORE)
	@JoinColumn(name = "user_id", nullable = false, updatable = false)
	@JsonIgnore
	private Users user;

	// 계좌번호
	@Column
	private String accountNumber;

	// 월별 벌금액
	@Column
	@Builder.Default
	private long monthFines = 0;

	// 미수금
	@Column(nullable = false)
	@Builder.Default
	private long misugeum=0;

	// 생성시각
	@CreatedDate
	@Column(updatable = false, nullable = false, columnDefinition = "DATETIME(0)")
	private LocalDateTime createdAt;

	// 수정시각
	@LastModifiedDate
	@Column(nullable = false, columnDefinition = "DATETIME(0)")
	private LocalDateTime updatedAt;

	// 일시정지
	@Column(columnDefinition = "TINYINT(1)")
	@Builder.Default
	private boolean pause=false;

	public void updateMisugeum(long newMisugeum) {
		this.misugeum = newMisugeum;
	}

	public void updateAmount(long newAmount) {
		this.monthFines = newAmount;
	}

	public void updatePause(boolean newPause) {
		this.pause = newPause;
	}
}
