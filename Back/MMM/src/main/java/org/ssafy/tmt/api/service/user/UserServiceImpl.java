package org.ssafy.tmt.api.service.user;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.nurigo.sdk.message.response.SingleMessageSentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.ssafy.tmt.api.dto.Elastic.User;
import org.ssafy.tmt.api.entity.user.Session;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.repository.users.SessionRepository;
import org.ssafy.tmt.api.repository.users.UsersRepository;
import org.ssafy.tmt.api.request.user.*;
import org.ssafy.tmt.api.service.elastic.UserSearchService;
import org.ssafy.tmt.api.service.email.EmailService;
import org.ssafy.tmt.config.security.CustomUserDetails;
import org.ssafy.tmt.exception.UnauthorizedException;
import org.ssafy.tmt.util.MessageUtil;
import org.ssafy.tmt.util.RedisUtil;
import org.ssafy.tmt.util.Response;
import org.ssafy.tmt.util.SmsCertificationUtil;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService{

    private final RedisUtil redisUtil;
    private final EmailService emailService;
    private final SmsCertificationUtil smsCertificationUtil;
    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionRepository sessionRepository;
    private final UserSearchService userSearchService;
    @Autowired
    private AuthenticationManager authenticationManager;

    public ResponseEntity<Object> sendVerificationCode(EmailCheckRequest emailCheckRequest) {
        String email = emailCheckRequest.getEmail();
        System.out.println("여기는 센드벌팊피케이션 코드 " +  emailCheckRequest.getEmail());
        String subject = "인증번호 입니다.";
        String certifyNumber = redisUtil.createCertifyNum();
        String body = "<인증 번호는 (" + certifyNumber + ") 입니다. \n"
                + "아래 링크를 클릭하여 인증을 완료하세요 \n"
                + "<a href='https://j12c207.p.ssafy.io/'>인증 페이지로 이동</a>";
        try {
            emailService.sendEmail(email, subject, body);
            System.out.println(email + subject + body);
            redisUtil.createRedisData(email, certifyNumber);
            return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
        }  catch (Exception e) {
            log.error("이메일 전송 중 오류 발생: {}", e.getMessage());
            return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage(e.getMessage()));
        }
    }

    public ResponseEntity<Object> vertifyCode(EmailVertifyRequest emailVertifyRequest) {

        String email = emailVertifyRequest.getEmail();
        String validNum = emailVertifyRequest.getValidNum();
        String code = redisUtil.getData(email);

        if(validNum != null) {
            if (code != null && code.equals(validNum)) {
                return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
            }
            else {
                log.error("이메일 인증 중 오류 발생: {}", "인증번호를 잘못 입력");
                return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage("mistake valid num"));
            }
        }
        else {
            log.error("인증번호를 입력하세요: {}", "인증번호 없음");
            return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage("none valid"));
        }
    }

    public ResponseEntity<Object> sendVerificationCode(PhoneCertifyRequest phoneCertifyRequest) {

        String phone = phoneCertifyRequest.getPhone();
        String code = redisUtil.createCertifyNum();

        try{
            SingleMessageSentResponse response = smsCertificationUtil.sendSms(phone, code);

            if(response.getStatusCode().equals("2000")) {
                redisUtil.createRedisData(phone, code);
                return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
            }
            else {
                return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("메세지 전송이 실패했습니다."));
            }

        } catch (Exception e) {
            log.error("핸드폰 인증이 보내지지 않았습니다.: {}", e.getMessage());
            return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage(e.getMessage()));
        }
    }

    public ResponseEntity<Object> vertifyCode(PhoneVertifyRequest phoneVertifyRequest) {

        String phone = phoneVertifyRequest.getPhone();
        String validNum = phoneVertifyRequest.getValidNum();
        String code = redisUtil.getData(phone);

        if(validNum != null) {
            if (code != null && code.equals(validNum)) {
                return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
            }
            else {
                log.error("휴대폰 인증 중 오류 발생: {}", "인증번호를 잘못 입력");
                return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage("mistake valid num"));
            }
        }
        else {
            log.error("인증번호를 입력하세요: {}", "인증번호 없음");
            return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage("none valid"));
        }
    }

    public ResponseEntity<Object> signUp(SignUpRequest signUpRequest) {
        try {
            String birth = signUpRequest.getBirth(); // "19990821"
            LocalDate dateBirth = LocalDate.parse(birth, DateTimeFormatter.ofPattern("yyyyMMdd"));

            int gender = 0;
            if ("남성".equals(signUpRequest.getGender())) {
                gender = 1;
            } else if ("여성".equals(signUpRequest.getGender())) {
                gender = 2;
            }

            String phone = signUpRequest.getPhone();
            String formatPhone = formatPhoneNumber(phone);


            String password = signUpRequest.getPassword();
            String encodePassword = passwordEncoder.encode(password);

            Users.UsersBuilder userBuilder = Users.builder()
                    .name(signUpRequest.getName())
                    .email(signUpRequest.getEmail())
                    .phone(formatPhone)
                    .birth(dateBirth)
                    .gender(gender)
                    .password(encodePassword);

            if (signUpRequest.getAddress() != null && !signUpRequest.getAddress().isEmpty()) {
                userBuilder.address(signUpRequest.getAddress());
            }

            Users user = userBuilder.build();
            usersRepository.save(user);

            Optional <Users> optionalUsers = usersRepository.findByEmail(signUpRequest.getEmail());

            if(optionalUsers.isPresent()) {
                Users testUser = optionalUsers.get();

                User elaUser = User.builder()
                        .id(testUser.getId())
                        .name(testUser.getName())
                        .email(testUser.getEmail())
                        .build();

                userSearchService.save(elaUser);
            }

            return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
        } catch (DateTimeParseException e) {
            log.error("날짜 변경중 오류 발생: {}", e.getMessage());
            return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage("Date type error"));
        } catch (Exception e) {
            log.error("회원가입 중 오류가 발생: {}", e.getMessage());
            return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage("회원가입 중 오류 발생"));
        }
    }

    public ResponseEntity<Object> login(LoginUserRequest loginUserRequest, HttpServletRequest request,
                                        HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginUserRequest.getEmail(), loginUserRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println("✅ 인증 저장 확인: " + SecurityContextHolder.getContext().getAuthentication());

            if (authentication.isAuthenticated()) {
                HttpSession session = request.getSession();
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                    session.setAttribute("loginUser", userDetails.getEmail());

                LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));

                Optional<Session> existingSession = sessionRepository.findByEmail(userDetails.getEmail());

                if (existingSession.isPresent()) {
                    Session sessionToUpdate = existingSession.get();
                    sessionToUpdate.updateLastAccessTime();
                    sessionRepository.save(sessionToUpdate);
                    System.out.println("🔄 기존 세션 갱신 완료: " + sessionToUpdate);
                } else {
                    Session newSession = Session.builder()
                            .email(userDetails.getEmail())
                            .expiryTime(now.plusMinutes(60))
                            .lastAccessTime(now)
                            .creationTime(now)
                            .build();
                    sessionRepository.save(newSession);
                    System.out.println("🆕 새 세션 생성 완료: " + newSession);
                }

                Optional<Session> userSession = sessionRepository.findByEmail(userDetails.getEmail());

                if(userSession.isPresent()) {
                    Cookie cookie = new Cookie("SessionId", String.valueOf(userSession.get().getSessionId()));
//                    cookie.setHttpOnly(true);
                    cookie.setMaxAge(60 * 60);
                    cookie.setSecure(true);
                    cookie.setPath("/");
                    response.addCookie(cookie);

                }
                Map<String, Object> resultMap = new HashMap<>();
                resultMap.put("message", "success");
                resultMap.put("email", userDetails.getEmail());
                resultMap.put("userId", userDetails.getId());
                resultMap.put("name", userDetails.getName());

                return Response.Response(HttpStatus.OK, resultMap);
            }
            else {
                System.out.println("이거 인증안됨");
            }

            return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
        } catch (AuthenticationException e) {
            log.error("로그인 중 오류가 발생: {}", e.getMessage());
            return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage("로그인 중 오류 발생"));
        }
    }


    public ResponseEntity<Object> updateUser(UpdateUserRequest updateUserRequest, CustomUserDetails customUserDetails) {
        checkAuthentication(customUserDetails);

        int id = customUserDetails.getId();
        Optional<Users> users = usersRepository.findById(id);

        if (users.isPresent()) {
            Users user = users.get();
            user.setAddress(updateUserRequest.getAddress());

            usersRepository.save(user);
            return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
        }
        else {
            return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage("사용자 변경 중 오류가 발생했습니다."));
        }
    }

    public ResponseEntity<Object> logout(HttpServletRequest request, HttpServletResponse response, CustomUserDetails customUserDetails) {
        checkAuthentication(customUserDetails);

        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);

        if(session != null) {
            session.invalidate();
            Optional<Session> userSession = sessionRepository.findByEmail(customUserDetails.getEmail());
            if(userSession.isPresent()) {
                sessionRepository.deleteBySessionId(userSession.get().getSessionId());
            }
        }
            Cookie cookie = new Cookie("SessionId", null);
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(0);
            response.addCookie(cookie);

            return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));

    }

    public ResponseEntity<Object> emailCheck(EmailCheckRequest emailCheckRequest) {
        String email = emailCheckRequest.getEmail();

        Optional<Users> users = usersRepository.findByEmail(email);

        if(users.isEmpty()) {
            return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("no duplication"));
        } else {
            return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("duplication"));
        }
    }

    public ResponseEntity<Object> deleteUser(CustomUserDetails customUserDetails, HttpServletRequest request
    , HttpServletResponse response) {
        checkAuthentication(customUserDetails);

        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);

        if(session != null) {
            session.invalidate();
            Optional<Session> userSession = sessionRepository.findByEmail(customUserDetails.getEmail());
            if(userSession.isPresent()) {
                sessionRepository.deleteBySessionId(userSession.get().getSessionId());
            }
        }
        Cookie cookie = new Cookie("SessionId", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        int userId = customUserDetails.getId();
        usersRepository.deleteById(userId);

        return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
    }

    public ResponseEntity<Object> changePassword(PasswordChangeRequest passwordChangeRequest, CustomUserDetails customUserDetails) {
        checkAuthentication(customUserDetails);

        String currentPassword = passwordChangeRequest.getCurrentPassword();
        String newPassword = passwordChangeRequest.getNewPassword();

        Optional<Users> optionalUser = usersRepository.findById(customUserDetails.getId());

        if (optionalUser.isPresent()) {
            Users user = optionalUser.get(); // Optional에서 Users 객체 추출

            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return Response.Response(HttpStatus.UNAUTHORIZED, MessageUtil.buildMessage("현재 비밀번호가 일치하지 않습니다."));
            } else {
                String encodedPassword = passwordEncoder.encode(newPassword);
                user.setPassword(encodedPassword);
                usersRepository.save(user);
                return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
            }
        } else {
            // 사용자가 존재하지 않을 때 처리
            return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("사용자를 찾을 수 없습니다."));
        }
    }

    public ResponseEntity<Object> findPassword(EmailCheckRequest emailCheckRequest) {

        String userEmail = emailCheckRequest.getEmail();

        Optional<Users> OptionalUsers = usersRepository.findByEmail(userEmail);

        if(OptionalUsers.isEmpty()) {
            return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("등록되지 않은 이메일입니다."));
        } else {
            Users user = OptionalUsers.get();

            String subject = "임시 비밀번호 입니다.";
            String number = redisUtil.createCertifyNum();
            String body = "임시 비밀번호는 (" + number + ") 입니다.";
            emailService.sendEmail(userEmail, subject, body);
            String encodedPassword = passwordEncoder.encode(String.valueOf(number));

            user.setPassword(encodedPassword);
            usersRepository.save(user);
            return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
        }
    }



    public String formatPhoneNumber(String phoneNumber) {
        // 전화번호에서 숫자만 추출
        String digits = phoneNumber.replaceAll("[^0-9]", "");

        // 길이 체크 (예: 10자리 또는 11자리)
        if (digits.length() == 10) {
            return digits.substring(0, 3) + "-" + digits.substring(3, 7) + "-" + digits.substring(7);
        } else if (digits.length() == 11) {
            return digits.substring(0, 3) + "-" + digits.substring(3, 7) + "-" + digits.substring(7);
        } else {
            throw new IllegalArgumentException("Invalid phone number format");
        }
    }

    public boolean isSessionValid(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        String sessionId = null;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("SessionId".equals(cookie.getName())) {
                    sessionId = cookie.getValue();
                    break;
                }
            }
        }
        if (sessionId != null) {
            try {
                int sessionIdInt = Integer.parseInt(sessionId);

                Optional<Session> userSession = sessionRepository.findBySessionId(sessionIdInt);

                if (userSession.isPresent() && userSession.get().getExpiryTime().isAfter(LocalDateTime.now())) {
                    return true;
                }
            } catch (NumberFormatException e) {
                System.out.println("Invalid session ID format: " + sessionId);
            }
        }
        return false;
    }

    private void checkAuthentication(CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            throw new UnauthorizedException("사용자 인증 문제가 발생했습니다.");
        }
    }

}
