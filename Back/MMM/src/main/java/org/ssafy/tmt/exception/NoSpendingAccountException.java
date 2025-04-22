package org.ssafy.tmt.exception;

public class NoSpendingAccountException extends RuntimeException {
    public NoSpendingAccountException(String message) {
        super(message);
    }
}
