package org.ssafy.tmt.api.entity.saving;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class SobiTag {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	// 소비태그 이름
	@Column
	private String name;

	@Builder
	public SobiTag(String name) {
		this.name = name;
	}
}
