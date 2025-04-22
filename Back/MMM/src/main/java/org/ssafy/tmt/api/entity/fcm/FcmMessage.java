package org.ssafy.tmt.api.entity.fcm;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.ssafy.tmt.api.entity.user.Users;

import java.time.LocalDateTime;

@Entity
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class FcmMessage {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	@JsonIgnore
	private Users user;

	@Column
	private String title;

	@Column
	private String body;

	@Column
	@Builder.Default
	private String clickAction = "/";

	@Column(columnDefinition = "TINYINT(1)")
	private boolean warn;

	@Column(columnDefinition = "TINYINT(1)")
	@Builder.Default
	private boolean readStatus=false;

	@CreatedDate
	@Column(updatable = false, nullable = false, columnDefinition = "DATETIME(0)")
	private LocalDateTime createdAt;

	public void readMessage() {
		this.readStatus=true;
	}
}
