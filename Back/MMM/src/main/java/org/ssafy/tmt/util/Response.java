package org.ssafy.tmt.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class Response {
	public static ResponseEntity<Object> Response(HttpStatus code, Object dto) {
		return ResponseEntity.status(code).body(dto);
	}
}
