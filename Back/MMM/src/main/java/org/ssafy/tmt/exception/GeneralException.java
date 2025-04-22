package org.ssafy.tmt.exception;

import org.ssafy.tmt.util.ErrorCode;

import java.io.IOException;

public class GeneralException extends IOException {
	private final ErrorCode errorCode;

	public GeneralException(ErrorCode errorCode) {
		super(errorCode.getMessage());
		this.errorCode = errorCode;
	}

	public ErrorCode getErrorCode() {
		return errorCode;
	}
}
