package org.ssafy.tmt.api.request.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SignUpRequest {

    private String email;
    private String password;
    private String name;
    private String phone;
    private String birth;
    private String gender;
    private String address;

}
