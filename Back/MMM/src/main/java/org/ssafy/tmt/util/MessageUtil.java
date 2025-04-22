package org.ssafy.tmt.util;

import org.ssafy.tmt.api.response.MessageOnly;

public class MessageUtil {

	public static MessageOnly buildMessage(String message) {
		return MessageOnly.builder().message(message).build();
	}
}
