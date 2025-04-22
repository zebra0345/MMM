package org.ssafy.tmt.api.service.user;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.ssafy.tmt.api.request.user.*;
import org.ssafy.tmt.config.security.CustomUserDetails;

public interface UserService {
    ResponseEntity<Object> sendVerificationCode(EmailCheckRequest emailCheckRequest);
    ResponseEntity<Object> vertifyCode(EmailVertifyRequest emailVertifyRequest);
    ResponseEntity<Object> sendVerificationCode(PhoneCertifyRequest phoneCertifyRequest);
    ResponseEntity<Object> vertifyCode(PhoneVertifyRequest phoneVertifyRequest);
    ResponseEntity<Object> signUp(SignUpRequest signUpRequest);
    ResponseEntity<Object> updateUser(UpdateUserRequest updateUserRequest, CustomUserDetails customUserDetails);
    ResponseEntity<Object> login(LoginUserRequest loginUserRequest, HttpServletRequest request, HttpServletResponse response);
    ResponseEntity<Object> logout(HttpServletRequest request, HttpServletResponse response, CustomUserDetails customUserDetails);
    boolean isSessionValid(HttpServletRequest request);
    ResponseEntity<Object> emailCheck(EmailCheckRequest emailCheckRequest);
    ResponseEntity<Object> deleteUser(CustomUserDetails customUserDetails, HttpServletRequest request, HttpServletResponse responses);
    ResponseEntity<Object> changePassword(PasswordChangeRequest passwordChangeRequest, CustomUserDetails customUserDetails);
    ResponseEntity<Object> findPassword(EmailCheckRequest emailCheckRequest);
}
