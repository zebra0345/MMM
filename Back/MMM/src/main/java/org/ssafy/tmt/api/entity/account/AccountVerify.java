package org.ssafy.tmt.api.entity.account;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

@Entity
@Getter
@NoArgsConstructor
public class AccountVerify {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@NotFound(action = NotFoundAction.IGNORE)
	@JoinColumn(name = "account_id", nullable = false, updatable = false)
	@JsonIgnore
	private Accounts account;

	@Column(nullable = false, columnDefinition = "TINYINT(1)")
	private boolean verify;

	@Builder
	public AccountVerify(int id, Accounts account, boolean verify) {
		this.id = id;
		this.account = account;
		this.verify = verify;
	}
}
