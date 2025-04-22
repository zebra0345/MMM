package org.ssafy.tmt.api.entity.saving;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class SavingPercent {
	@Id
	@GeneratedValue(strategy= GenerationType.IDENTITY)
	private int id;

	// 저축방식
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "saving_option_id", nullable = false, updatable = false)
	@JsonIgnore
	private SavingOption savingOption;

	// 소비태그
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "sobi_tag_id", nullable = false)
	@JsonIgnore
	private SobiTag sobiTag;

	// 저축비율
	@Column
	private int percent;

	public void updatePercent(int percent) {
		this.percent = percent;
	}
}
