package org.ssafy.tmt.api.service.email;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
}
