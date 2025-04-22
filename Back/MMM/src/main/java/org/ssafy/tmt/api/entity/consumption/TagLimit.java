package org.ssafy.tmt.api.entity.consumption;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.ssafy.tmt.api.entity.saving.SobiTag;

@Entity
@Getter
@NoArgsConstructor
public class TagLimit {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	// 소비제한
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "limit_id", nullable = false, updatable = false)
	@JsonIgnore
	private Limit limit;

	// 소비태그
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "sobi_tag_id", nullable = false, updatable = false)
	@JsonIgnore
	private SobiTag sobiTag;

	// 소비금액선
	@Column
	private int max;

	@Builder(toBuilder = true)
	public TagLimit(Limit limit, SobiTag sobiTag, int max) {
		this.limit = limit;
		this.sobiTag = sobiTag;
		this.max = max;
	}
}