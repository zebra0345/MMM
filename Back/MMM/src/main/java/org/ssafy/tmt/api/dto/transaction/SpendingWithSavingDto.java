package org.ssafy.tmt.api.dto.transaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SpendingWithSavingDto {
    private int id;
    private String item;
    private long spendingAmount;
    private long savingAmount;
    private LocalDateTime createdAt;
}
