package org.ssafy.tmt.api.entity.spending;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DailySpending {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_report_id", nullable = false)
    private DailyReport dailyReport;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String item;

    @Column(nullable = false)
    private long amount;

    @Column(nullable = false)
    private long savingAmount;

    @Column(nullable = false)
    private long spendingAmount;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
