package org.ssafy.tmt.api.request.fcm;

import lombok.*;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FcmRequestDto {
	private String title;
	private String body;
	@Builder.Default
	private String clickAction = "/";
	private boolean warn;
}
