package org.ssafy.tmt.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.ssafy.tmt.api.entity.user.Session;
import org.ssafy.tmt.api.repository.users.SessionRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SessionValidationFilter extends OncePerRequestFilter {

    private final SessionRepository sessionRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        Cookie[] cookies = request.getCookies();
        String sessionId = null;

        System.out.println("여기는 세션 밸리드 필터");
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("SessionId".equals(cookie.getName())) {
                    sessionId = cookie.getValue();
                    break;
                }
            }
        }
        System.out.println("세션 아이디 == " + sessionId);

        if (sessionId != null) {
            try {
                int sessionIdInt = Integer.parseInt(sessionId);
                Optional<Session> userSession = sessionRepository.findBySessionId(sessionIdInt);

                if (userSession.isPresent() && userSession.get().getExpiryTime().isAfter(LocalDateTime.now())) {
                    filterChain.doFilter(request, response);
                } else {

                    System.out.println("세션이 유효하지 않기 때문에 여기로 들어옵니다.");

                    Cookie cookie = new Cookie("SessionId", null);
                    cookie.setHttpOnly(true);
                    cookie.setPath("/");
                    cookie.setMaxAge(0);
//                   cookie.setSecure(true); // HTTPS 환경이라면 추가
                    response.addCookie(cookie);

                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Session expired.");
                    return;
                }
            } catch (NumberFormatException e) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid session ID format.");
                return;
            }
        } else {

            System.out.println("세션 아이디가 없으니까 여기로 들어온다.");
            if (request.getRequestURI().equals("/api/user/login") || request.getRequestURI().equals("/api/user/signup")
            || request.getRequestURI().equals("/api/user/emailcheck") || request.getRequestURI().equals("/api/user/validemail")
            || request.getRequestURI().equals("/api/user/vertifyemail") || request.getRequestURI().equals("/api/user/validphone")
            || request.getRequestURI().equals("/api/user/validphone") || request.getRequestURI().equals("/api/user/password-find")
            || request.getRequestURI().equals("/api/actuator/health") || request.getRequestURI().equals("/api/ws-stomp")
            || request.getRequestURI().equals("/api/chat/messages") || request.getRequestURI().equals("/api/chat/search")
            || request.getRequestURI().equals("/ws-stomp") || request.getRequestURI().equals("/api/fcm")) {

                filterChain.doFilter(request, response);
                return;
            } else {
                // 인증이 필요한 요청이고 세션 ID가 없는 경우
                System.out.println("세션 아이디도 없고 인증이 필요한 경로로 접근했습니다.");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized access. Please log in.");
                System.out.println("🚨 sendError() 호출 직후! (여기가 실행되면 이상함)");
                return;
            }
        }
    }
}
