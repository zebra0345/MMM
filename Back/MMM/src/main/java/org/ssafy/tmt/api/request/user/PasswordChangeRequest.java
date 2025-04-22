package org.ssafy.tmt.api.request.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PasswordChangeRequest {

    private String currentPassword;
    private String newPassword;

}
