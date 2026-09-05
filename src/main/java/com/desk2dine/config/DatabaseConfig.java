package com.desk2dine.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * This is the project's JDBC connection utility. Instead of every
 * repository calling DriverManager.getConnection() (which opens and
 * closes a raw TCP connection to MySQL on every single query — slow,
 * and easy to exhaust the database's connection limit under load), we
 * configure one HikariCP connection pool here and hand it out as a
 * Spring bean.
 *
 * HikariCP is a JDBC connection pool, not an ORM: repositories still
 * get a plain java.sql.Connection from it and write raw
 * PreparedStatement / ResultSet code themselves.
 *
 * How it's used: every *Repository class takes this DataSource in its
 * constructor and calls dataSource.getConnection() to get a pooled
 * connection, which is returned to the pool (not actually closed) when
 * the repository calls connection.close() in a try-with-resources block.
 */
@Configuration
public class DatabaseConfig {

    @Value("${app.datasource.url}")
    private String jdbcUrl;

    @Value("${app.datasource.username}")
    private String username;

    @Value("${app.datasource.password}")
    private String password;

    @Value("${app.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String driverClassName;

    @Value("${app.datasource.pool-size:10}")
    private int poolSize;

    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName(driverClassName);
        config.setMaximumPoolSize(poolSize);
        config.setMinimumIdle(2);
        config.setPoolName("Desk2DineHikariPool");
        // Fail fast on a bad connection rather than hanging requests indefinitely
        config.setConnectionTimeout(10_000);
        config.setValidationTimeout(5_000);
        return new HikariDataSource(config);
    }
}
