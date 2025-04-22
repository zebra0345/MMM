package org.ssafy.tmt.util;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Random;


@RequiredArgsConstructor
@Service
public class RedisUtil {

    @Value("${spring.data.redis.duration}")
    private int duration;
    private final RedisTemplate<String, String> template;

    public String getData(String key) {
        ValueOperations<String, String> valueOperations = template.opsForValue();
        return valueOperations.get(key);
    }

    public void setDataExpire(String key, String value) {
        ValueOperations<String, String> valueOperations = template.opsForValue();
        Duration expireDuration = Duration.ofSeconds(duration);
        valueOperations.set(key, value, expireDuration);
    }

    public boolean existData(String key) {
        return Boolean.TRUE.equals(template.hasKey(key));
    }

    public void deleteData(String key) {
        template.delete(key);
    }

    public void createRedisData(String toemail, String code) {
        if (existData(toemail)) {
            deleteData(toemail);
        }
        setDataExpire(toemail, code);
    }

    public String createCertifyNum() {
        int leftLimit = 48;
        int rightLimit = 58;
        int targetStringLength = 6;
        Random random = new Random();

        return random.ints(leftLimit, rightLimit)
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }
}