package org.ssafy.tmt.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {
	@Value("${FCM_CERTIFICATION}")
	private String credentialPath;

	@Bean
	public FirebaseApp firebaseApp() {
		if (FirebaseApp.getApps().isEmpty()) {
			try (InputStream serviceAccount = new ClassPathResource(credentialPath).getInputStream()) {
				FirebaseOptions options = FirebaseOptions.builder()
						.setCredentials(GoogleCredentials.fromStream(serviceAccount))
						.build();
				return FirebaseApp.initializeApp(options);
			} catch (IOException e) {
				throw new RuntimeException("Failed to initialize Firebase", e);
			}
		}
		return FirebaseApp.getInstance();
	}
}
