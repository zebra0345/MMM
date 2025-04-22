package org.ssafy.tmt.api.entity.consumption;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class MaxLimit {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	// 소비제한
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "limit_id", nullable = false, updatable = false)
	@JsonIgnore
	private Limit limit;

	// 상한선 금액
	@Column
	private int max;

	@Builder(toBuilder = true)
	public MaxLimit(Limit limit, int max) {
		this.limit = limit;
		this.max = max;
	}
}
