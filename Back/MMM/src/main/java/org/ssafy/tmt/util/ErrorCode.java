package org.ssafy.tmt.util;

public enum ErrorCode {
	FCM_SEND_ERROR("FCM 메시지 전송 중 오류가 발생했습니다."),
	INVALID_INPUT("디바이스 토큰이 없습니다.");

	private final String message;

	ErrorCode(String message) {
		this.message = message;
	}

	public String getMessage() {
		return message;
	}
}
