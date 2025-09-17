package egov.com.config;

import javax.annotation.PostConstruct;
import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import io.github.cdimascio.dotenv.Dotenv;

/**
 * @ClassName : EgovConfigAppDataSource.java
 * @Description : DataSource 설정 (통합)
 *
 * @author : 윤주호
 * @since : 2021. 7. 20
 * @version : 1.0
 *
 *          <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일              수정자               수정내용
 *  -------------  ------------   ---------------------
 *   2021. 7. 20    윤주호               최초 생성
 *   2025. 5. 29    통합                 두 설정 파일 통합
 *          </pre>
 *
 */
@Configuration
public class EgovConfigAppDataSource {
    private static final Logger logger = LoggerFactory.getLogger(EgovConfigAppDataSource.class);

    private String dbType;
    private String dbUrl;
    private String dbUsername;
    private String dbPassword;
    private String dbDriverClassName;

    @PostConstruct
    void init() {
        try {
            // Load .env (root priority): try current dir, then parent dir
            logger.info("Loading .env. user.dir: {}", System.getProperty("user.dir"));
            Dotenv dotenv = Dotenv.configure().directory(".").ignoreIfMalformed().ignoreIfMissing().load();
            String candidateUrl = dotenv.get("SPRING_DATASOURCE_URL");
            if (candidateUrl == null || candidateUrl.trim().isEmpty()) {
                logger.info("SPRING_DATASOURCE_URL not found in ./.env, trying ../.env");
                dotenv = Dotenv.configure().directory("..").ignoreIfMalformed().ignoreIfMissing().load();
            }

            // Get database configuration from .env (initial read)
            this.dbUrl = dotenv.get("SPRING_DATASOURCE_URL");
            this.dbUsername = dotenv.get("SPRING_DATASOURCE_USERNAME");
            this.dbPassword = dotenv.get("SPRING_DATASOURCE_PASSWORD");
            this.dbDriverClassName = "org.mariadb.jdbc.Driver";
            this.dbType = "mariadb";

            // Set all .env variables as system properties for Spring to use
            dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));

            // Specifically verify JWT_SECRET is loaded
            String jwtSecret = dotenv.get("JWT_SECRET");
            if (jwtSecret != null) {
                System.setProperty("JWT_SECRET", jwtSecret);
                logger.info("JWT_SECRET successfully loaded from .env");
            } else {
                logger.error("JWT_SECRET not found in .env file");
            }

            logger.info("Database configuration loaded - URL: {}, Username: {}", this.dbUrl, this.dbUsername);
        } catch (Exception e) {
            logger.error("Error loading environment variables", e);
            throw new RuntimeException("Failed to load environment variables", e);
        }
    }

    /**
     * Primary DataSource using HikariCP
     */
    @Bean(name = { "dataSource", "egov.dataSource", "egovDataSource" })
    @Primary
    public DataSource dataSource() {
        // Read strictly from .env files on disk to avoid any external overrides
        String url = unquote(readEnvFileValue(".", "SPRING_DATASOURCE_URL"));
        String user = unquote(readEnvFileValue(".", "SPRING_DATASOURCE_USERNAME"));
        String pass = unquote(readEnvFileValue(".", "SPRING_DATASOURCE_PASSWORD"));
        String driver = unquote(readEnvFileValue(".", "SPRING_DATASOURCE_DRIVER_CLASS_NAME"));

        if (isEmpty(url) || isEmpty(user) || isEmpty(pass) || isEmpty(driver)) {
            if (isEmpty(url)) url = unquote(readEnvFileValue("..", "SPRING_DATASOURCE_URL"));
            if (isEmpty(user)) user = unquote(readEnvFileValue("..", "SPRING_DATASOURCE_USERNAME"));
            if (isEmpty(pass)) pass = unquote(readEnvFileValue("..", "SPRING_DATASOURCE_PASSWORD"));
            if (isEmpty(driver)) driver = unquote(readEnvFileValue("..", "SPRING_DATASOURCE_DRIVER_CLASS_NAME"));
        }

        if (isEmpty(driver)) driver = "org.mariadb.jdbc.Driver";

        if (!isEmpty(url) && url.startsWith("jdbc:h2:")) {
            logger.error("H2 URL detected in .env but only MariaDB is allowed. URL: {}", url);
            throw new IllegalStateException("H2 is not allowed. Please set SPRING_DATASOURCE_URL to a MariaDB URL in .env");
        }

        HikariConfig hikariConfig = new HikariConfig();
        hikariConfig.setJdbcUrl(url);
        hikariConfig.setUsername(user);
        hikariConfig.setPassword(pass);
        hikariConfig.setDriverClassName(driver);

        // HikariCP 추가 설정
        hikariConfig.setMaximumPoolSize(10);
        hikariConfig.setMinimumIdle(2);
        hikariConfig.setConnectionTimeout(30000);
        hikariConfig.setIdleTimeout(600000);
        hikariConfig.setMaxLifetime(1800000);

        logger.info("Creating HikariDataSource with URL: {}", url);
        return new HikariDataSource(hikariConfig);
    }

    private String readEnvFileValue(String directory, String key) {
        java.nio.file.Path path = java.nio.file.Paths.get(directory, ".env");
        try {
            if (!java.nio.file.Files.exists(path)) {
                return null;
            }
            java.util.List<String> lines = java.nio.file.Files.readAllLines(path);
            for (String line : lines) {
                if (line == null) continue;
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) continue;
                int idx = trimmed.indexOf('=');
                if (idx <= 0) continue;
                String k = trimmed.substring(0, idx).trim();
                if (!k.equals(key)) continue;
                String v = trimmed.substring(idx + 1).trim();
                return v;
            }
            return null;
        } catch (Exception e) {
            logger.warn("Failed to read {} from {}/.env", key, directory, e);
            return null;
        }
    }

    private boolean isEmpty(String s) {
        return s == null || s.trim().isEmpty();
    }

    private String firstNonEmpty(String a, String b) {
        if (!isEmpty(a)) return a;
        if (!isEmpty(b)) return b;
        return null;
    }

    private String unquote(String value) {
        if (value == null) return null;
        String v = value.trim();
        if ((v.startsWith("\"") && v.endsWith("\"")) || (v.startsWith("'") && v.endsWith("'"))) {
            return v.substring(1, v.length() - 1);
        }
        return v;
    }
}