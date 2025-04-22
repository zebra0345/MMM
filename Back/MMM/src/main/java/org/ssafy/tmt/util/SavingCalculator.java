package org.ssafy.tmt.util;

import org.ssafy.tmt.api.entity.saving.AbsSaving;
import org.ssafy.tmt.api.entity.saving.MaxMin;
import org.ssafy.tmt.api.entity.saving.SavingPercent;
import org.ssafy.tmt.api.entity.transaction.SpendingTransaction;

import java.util.List;
import java.util.Optional;

public class SavingCalculator {

    // 절대금액
    public static long absSave(List<AbsSaving> absSavings, SpendingTransaction spendingTransaction) {
        long total = 0; // 저축액

        if (spendingTransaction.getCategory().equals("MMM")) {
            return total;
        }

        long spendingAmount = spendingTransaction.getAmount();

        long maxAmount1 = absSavings.get(0).getMaxAmount();
        boolean activate1 = absSavings.get(0).isActive();
        long savingAmount1 = absSavings.get(0).getSavingAmount();

        long maxAmount2 = absSavings.get(1).getMaxAmount();
        boolean activate2 = absSavings.get(1).isActive();
        long savingAmount2 = absSavings.get(1).getSavingAmount();

        long maxAmount3 = absSavings.get(2).getMaxAmount();
        boolean activate3 = absSavings.get(2).isActive();
        long savingAmount3 = absSavings.get(2).getSavingAmount();

        if (spendingAmount >= maxAmount3 && activate3) {
            total += savingAmount3;
        } else if (spendingAmount >= maxAmount2 && activate2) {
            total += savingAmount2;
        } else if (spendingAmount >= maxAmount1 && activate1) {
            total += savingAmount1;
        }

        return total;
    }

    // 비율
    public static long perSave(List<SavingPercent> savingPercentList, MaxMin maxMin, SpendingTransaction spendingTransaction) {
        String category = spendingTransaction.getCategory();
        if (spendingTransaction.getCategory().equals("MMM")) {
            return 0;
        }
        long spendingAmount = spendingTransaction.getAmount();
        long savingAmount = 0; // 저축액

        Integer maxAmount = null;
        Integer minAmount = null;
        if (maxMin != null) {
            maxAmount = maxMin.getMaxAmount();
            minAmount = maxMin.getMinAmount();
        }

        // 카테고리와 일치하는 SavingPercent 찾기
        Optional<SavingPercent> savingPercent = savingPercentList.stream()
                .filter(sp -> sp.getSobiTag().equals(category))
                .findFirst();

        if (savingPercent.isPresent()) {
            savingAmount = spendingAmount * savingPercent.get().getPercent() / 100;
        } else {
            savingAmount = spendingAmount * 10 / 100; // 기본값 10%
        }

        // 최대 최소 범위
        if (maxAmount != null && savingAmount > maxAmount) {
            savingAmount = maxAmount;
        } else if (minAmount != null && savingAmount < minAmount) {
            savingAmount = minAmount;
        }

        return savingAmount;
    }
}
