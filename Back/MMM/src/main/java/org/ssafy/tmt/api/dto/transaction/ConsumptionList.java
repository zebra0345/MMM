package org.ssafy.tmt.api.dto.transaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.ssafy.tmt.api.entity.transaction.SpendingTransaction;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConsumptionList {
	List<SpendingTransaction> transactions;
}
