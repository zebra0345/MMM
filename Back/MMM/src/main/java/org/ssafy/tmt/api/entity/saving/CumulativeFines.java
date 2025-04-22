package org.ssafy.tmt.api.entity.saving;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.ssafy.tmt.api.entity.account.SavingAccount;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CumulativeFines {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "saving_account_id", nullable = false, updatable = false)
    private SavingAccount savingAccount;

    @Column
    @Builder.Default
    private long cumulativeFines=0;

    public void updateCumulativeFines(long cumulativeFine) {
        this.cumulativeFines += cumulativeFine;
    }
}
