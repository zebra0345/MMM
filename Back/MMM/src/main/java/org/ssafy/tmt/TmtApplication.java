package org.ssafy.tmt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.ssafy.tmt.util.DotenvLoader;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
@EnableJpaAuditing
@EnableScheduling
@EnableTransactionManagement
public class TmtApplication {

	public static void main(String[] args) {
		// .env 파일을 로드하여 시스템 속성 설정
		DotenvLoader.loadEnvProperties();

		SpringApplication.run(TmtApplication.class, args);
	}

}
