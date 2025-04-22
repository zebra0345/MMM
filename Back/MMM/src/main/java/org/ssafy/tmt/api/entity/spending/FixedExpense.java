package org.ssafy.tmt.api.entity.spending;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.ssafy.tmt.api.entity.account.SpendingAccount;
import org.ssafy.tmt.api.entity.user.Users;

import java.time.LocalDateTime;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FixedExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spending_account_id")
    private SpendingAccount spendingAccount;

    @Column(nullable = false)
    private long amount;

    @Column(nullable = false, length = 30)
    private String item;

    @Column(nullable = false)
    private int paymentDate; // 결제일

    @Column(nullable = false)
    @Builder.Default
    private boolean isDeleted = false;

    @CreatedDate
    @Column(updatable = false, nullable = false, columnDefinition = "DATETIME(0)")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false, columnDefinition = "DATETIME(0)")
    private LocalDateTime updatedAt;

    public void updateAccount(SpendingAccount spendingAccount) {
        this.spendingAccount = spendingAccount;
    }
}
