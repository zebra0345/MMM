package org.ssafy.tmt.api.entity.consumption;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.ssafy.tmt.api.entity.user.Users;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "limit_table")
public class Limit {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	// 회원
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, updatable = false)
	@JsonIgnore
	private Users user;

	// 소비상한선
	@Column(columnDefinition = "TINYINT(1)")
	private int max_limit;

	// 소비금액선
	@Column(columnDefinition = "TINYINT(1)")
	private int tag_limit;

	@Builder(toBuilder = true)
	public Limit(Users user, int max_limit, int tag_limit) {
		this.user = user;
		this.max_limit = max_limit;
		this.tag_limit = tag_limit;
	}
}
