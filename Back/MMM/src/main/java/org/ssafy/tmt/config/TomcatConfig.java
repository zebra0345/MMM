package org.ssafy.tmt.config;

import org.apache.catalina.Context;
import org.apache.catalina.connector.Connector;
import org.apache.tomcat.util.descriptor.web.SecurityCollection;
import org.apache.tomcat.util.descriptor.web.SecurityConstraint;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.servlet.server.ServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "app.tomcat.redirect.enabled", havingValue = "true", matchIfMissing = true)
public class TomcatConfig {

	@Bean
	public ServletWebServerFactory servletContainer() {
		TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory() {
			@Override
			protected void postProcessContext(Context context) {
				// 모든 요청을 HTTPS로 강제하기 위한 설정
				SecurityConstraint securityConstraint = new SecurityConstraint();
				securityConstraint.setUserConstraint("CONFIDENTIAL");
				SecurityCollection collection = new SecurityCollection();
				collection.addPattern("/*");
				securityConstraint.addCollection(collection);
				context.addConstraint(securityConstraint);
			}
		};
		// HTTP 포트에서 HTTPS 포트로 리다이렉트하는 커넥터 추가 (예: HTTP 8080 → HTTPS 8443)
		tomcat.addAdditionalTomcatConnectors(httpToHttpsRedirectConnector());
		return tomcat;
	}

	private Connector httpToHttpsRedirectConnector() {
		Connector connector = new Connector(TomcatServletWebServerFactory.DEFAULT_PROTOCOL);
		connector.setScheme("http");
		connector.setPort(8080); // HTTP 포트
		connector.setSecure(false);
		connector.setRedirectPort(8443); // HTTPS 포트 (application.properties의 server.port와 일치)
		return connector;
	}
}
