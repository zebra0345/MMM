package org.ssafy.tmt.api.entity.spending;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.ssafy.tmt.api.entity.user.Users;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DailyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users users;

    @Column(nullable = false)
    private LocalDate dailyReportDate; // 데일리리포트 날짜

    @Column(nullable = false)
    private long totalSpendingAmount;

    @Column(nullable = false)
    private long totalSavingAmount;

    @OneToMany(mappedBy = "dailyReport", cascade = CascadeType.ALL, orphanRemoval = true)
    @Column(nullable = false)
    private List<DailySpending> spendingList; // 데일리리포트 상세내역

    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;

    // 연관관계 설정
    public void addDailySpending(DailySpending dailySpending) {
        this.spendingList.add(dailySpending);
        dailySpending.setDailyReport(this);
    }
}
