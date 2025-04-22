package org.ssafy.tmt.util;

import jakarta.annotation.PostConstruct;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.response.SingleMessageSentResponse;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SmsCertificationUtil {

    @Value("${coolsms.apikey}")
    private String apiKey;

    @Value("${coolsms.apisecret}")
    private String apiSecret;

    @Value("${coolsms.fromnumber}")
    private String fromNumber;

    DefaultMessageService messageService;

    @PostConstruct // 의존성 주입이 완료된 후 초기화를 수행하는 메서드
    public void init(){
        this.messageService = NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.coolsms.co.kr"); // 메시지 서비스 초기화
    }

    public SingleMessageSentResponse sendSms(String to, String certificationCode){
        Message message = new Message();
        message.setFrom(fromNumber);
        message.setTo(to);
        message.setText("본인확인 인증번호(" + certificationCode + ") 입력시 정상처리 됩니다.");

        SingleMessageSentResponse result = this.messageService.sendOne(new SingleMessageSendingRequest(message));
        return result;
    }
}
