package org.ssafy.tmt.api.entity.fcm;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.ssafy.tmt.api.entity.user.Users;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(
		name = "fcm_token",
		uniqueConstraints = {
				@UniqueConstraint(columnNames = {"user_id", "deviceToken"})
		}
)
public class FcmToken {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	@Column(nullable = false)
	private String deviceToken;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	@JsonIgnore
	private Users user;

	@CreatedDate
	@Column(updatable = false, nullable = false, columnDefinition = "DATETIME(0)")
	private LocalDateTime createdAt;
}
