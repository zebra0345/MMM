package org.ssafy.tmt.util;

import io.github.cdimascio.dotenv.Dotenv;

public class DotenvLoader {
	public static void loadEnvProperties() {
		Dotenv dotenv = Dotenv.load();

		// env 환경변수
		System.setProperty("SMTP_EMAIL", dotenv.get("SMTP_EMAIL"));
		System.setProperty("SMTP_PASS", dotenv.get("SMTP_PASS"));
		System.setProperty("REDIS_HOST", dotenv.get("REDIS_HOST"));
		System.setProperty("REDIS_PORT", dotenv.get("REDIS_PORT"));
		System.setProperty("REDIS_DURATION", dotenv.get("REDIS_DURATION"));
		System.setProperty("DATABASE_URL", dotenv.get("DATABASE_URL"));
		System.setProperty("DATABASE_USERNAME", dotenv.get("DATABASE_USERNAME"));
		System.setProperty("DATABASE_PASSWORD", dotenv.get("DATABASE_PASSWORD"));
		System.setProperty("SMS_KEY", dotenv.get("SMS_KEY"));
		System.setProperty("SMS_SECRET", dotenv.get("SMS_SECRET"));
		System.setProperty("SMS_PHONE", dotenv.get("SMS_PHONE"));
		System.setProperty("ELASTIC", dotenv.get("ELASTIC"));
		System.setProperty("ALLOWED_IPS", dotenv.get("ALLOWED_IPS"));
		System.setProperty("AI_API_URL", dotenv.get("AI_API_URL"));
		System.setProperty("FCM_CERTIFICATION", dotenv.get("FCM_CERTIFICATION"));
	}
}
