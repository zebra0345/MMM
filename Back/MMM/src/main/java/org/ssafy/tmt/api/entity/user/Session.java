package org.ssafy.tmt.api.entity.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "sessions")
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id", nullable = false, unique = true)
    private int sessionId;

    @Column(name = "session_email", nullable = false)
    private String email;

    @Column(name = "expire_time", nullable = false)
    private LocalDateTime expiryTime;

    @Column(name = "last_access_time", nullable = false)
    private LocalDateTime lastAccessTime;

    @Column(name = "creation_time", nullable = false)
    private LocalDateTime creationTime;



    @PrePersist
    public void prePersist() {
        this.creationTime = LocalDateTime.now();

        this.lastAccessTime = this.creationTime;

        this.expiryTime = this.lastAccessTime.plusMinutes(60);
    }

    // lastAccessTime 업데이트 메서드
    public void updateLastAccessTime() {
        this.lastAccessTime = LocalDateTime.now();
        this.expiryTime = this.lastAccessTime.plusMinutes(60);
    }
}