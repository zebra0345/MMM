package org.ssafy.tmt.api.controller.user;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.ssafy.tmt.api.request.user.*;
import org.ssafy.tmt.api.service.user.UserService;
import org.ssafy.tmt.config.security.CustomUserDetails;
import org.ssafy.tmt.util.MessageUtil;
import org.ssafy.tmt.util.RedisUtil;
import org.ssafy.tmt.util.Response;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final RedisUtil redisUtil;
    private final UserService userService;

    @PostMapping("/validemail")
    public ResponseEntity<Object> SendEmail(@RequestBody EmailCheckRequest EmailCheckRequest) {
        System.out.println(EmailCheckRequest);
        return userService.sendVerificationCode(EmailCheckRequest);
    }

    @PostMapping("/vertifyemail")
    public ResponseEntity<Object> verifyCertification(@RequestBody EmailVertifyRequest emailVertifyRequest) {
        return userService.vertifyCode(emailVertifyRequest);
    }

    @PostMapping("/validphone")
    public ResponseEntity<Object> SendPhone(@RequestBody PhoneCertifyRequest phoneCertifyRequest) {
        return userService.sendVerificationCode(phoneCertifyRequest);
    }

    @PostMapping("/vertifyphone")
    public ResponseEntity<Object> verifyCertification(@RequestBody PhoneVertifyRequest phoneVertifyRequest) {
        return userService.vertifyCode(phoneVertifyRequest);
    }

    @PostMapping("/signup")
    public ResponseEntity<Object> signUp(@RequestBody SignUpRequest signUpRequest) {
        return userService.signUp(signUpRequest);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginUserRequest loginUserRequest, HttpServletRequest request, HttpServletResponse response) {
        return userService.login(loginUserRequest, request, response);
    }

    @GetMapping("/test")
    public ResponseEntity<Object> getUserInfo(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage("사용자 인증 문제가 발생했습니다."));
        }
        System.out.println("✅ 인증된 사용자 이메일: " + customUserDetails.getEmail());
        return ResponseEntity.ok(customUserDetails.getEmail());
    }
    @PatchMapping("")
    public ResponseEntity<Object> updateUser(@RequestBody UpdateUserRequest updateUserRequest, @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        return userService.updateUser(updateUserRequest, customUserDetails);
    }

    @PostMapping("/logout")
    public ResponseEntity<Object> logout(@AuthenticationPrincipal CustomUserDetails customUserDetails
    ,HttpServletResponse response, HttpServletRequest request) {
        return userService.logout( request, response, customUserDetails);
    }

    @PostMapping("/emailcheck")
    public ResponseEntity<Object> emailCheck(@RequestBody EmailCheckRequest emailCheckRequest) {
        return userService.emailCheck(emailCheckRequest);
    }

    @DeleteMapping("")
    public ResponseEntity<Object> deleteUser(@AuthenticationPrincipal CustomUserDetails customUserDetails, HttpServletRequest request
    , HttpServletResponse response) {
        return userService.deleteUser(customUserDetails, request, response);
    }

    @PostMapping("/password-change")
    public ResponseEntity<Object> passwordChange(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                 @RequestBody PasswordChangeRequest passwordChangeRequest) {
        return userService.changePassword(passwordChangeRequest, customUserDetails);
    }

    @PostMapping("/password-find")
    public ResponseEntity<Object> passwordFind(@RequestBody EmailCheckRequest emailCheckRequest) {
        return userService.findPassword(emailCheckRequest);
    }




}
