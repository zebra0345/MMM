package org.ssafy.tmt.api.entity.account;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@EntityListeners(AuditingEntityListener.class)
public class SpendingAccount {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	// 계좌
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@NotFound(action = NotFoundAction.IGNORE)
	@JoinColumn(name = "account_id", nullable = false, updatable = false)
	@JsonIgnore
	private Accounts account;

	// 예금주명
	@Column
	private String name;

	// 계좌번호
	@Column(unique = true)
	private String accountNumber;

	// 은행명
	@Column
	private String bank;

	// 생성시각
	@CreatedDate
	@Column(updatable = false, nullable = false, columnDefinition = "DATETIME(0)")
	private LocalDateTime createdAt;

	// 수정시각
	@LastModifiedDate
	@Column(nullable = false, columnDefinition = "DATETIME(0)")
	private LocalDateTime updatedAt;
}
