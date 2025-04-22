package org.ssafy.tmt.api.response;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MessageOnly {
	String message;

	@Builder
	public MessageOnly(String message) {
		this.message = message;
	}
}
