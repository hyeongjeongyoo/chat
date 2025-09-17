package egov.com.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;

import javax.annotation.PostConstruct;

@Configuration
@PropertySources({
	@PropertySource("classpath:/application.yml")
})
public class EgovConfigApp {

	private static final Logger logger = LoggerFactory.getLogger(EgovConfigApp.class);

	@PostConstruct
	public void loadEnv() {
		try {
			// .env 파일을 로드하되, 오탈자/형식 오류가 있어도 애플리케이션 기동을 막지 않음
			Dotenv dotenv = Dotenv.configure()
				.ignoreIfMalformed()
				.ignoreIfMissing()
				.load();

			// 환경 변수를 시스템 속성으로 설정 (기존 값은 유지)
			dotenv.entries().forEach(entry -> {
				if (System.getProperty(entry.getKey()) == null) {
					System.setProperty(entry.getKey(), entry.getValue());
				}
			});
		} catch (Exception e) {
			logger.warn("Ignoring .env load error; proceeding with existing properties/env", e);
		}
	}
}
