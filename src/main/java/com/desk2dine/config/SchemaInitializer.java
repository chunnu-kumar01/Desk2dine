package com.desk2dine.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Creates the database schema and seeds reference data automatically at
 * startup, using nothing but plain JDBC (Statement + SQL scripts) — no
 * Hibernate "ddl-auto", no Flyway/Liquibase dependency required.
 *
 * Why: the assignment requires "create all SQL tables automatically or
 * provide complete SQL scripts" — this class does both at once, since
 * the scripts live in src/main/resources/db and are executed verbatim.
 *
 * How it works:
 *   1. Reads db/schema.sql and executes every statement. Every CREATE
 *      TABLE uses "IF NOT EXISTS" so this is safe to run on every
 *      application restart.
 *   2. Reads db/data.sql but only executes it the first time (checked
 *      via "SELECT COUNT(*) FROM categories"), so restarting the app
 *      never creates duplicate sample rows.
 *
 * Runs before AdminBootstrap (see @Order) so the users table exists
 * before AdminBootstrap tries to insert into it.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SchemaInitializer implements ApplicationRunner {

    private static final Logger log = Logger.getLogger(SchemaInitializer.class.getName());

    private final DataSource dataSource;

    public SchemaInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            runScript(connection, "db/schema.sql");
            if (!hasReferenceData(connection)) {
                runScript(connection, "db/data.sql");
                log.info("Desk2Dine: seeded sample categories, menu items, and delivery locations.");
            } else {
                log.info("Desk2Dine: reference data already present, skipping seed.");
            }
        }
        log.info("Desk2Dine: database schema is ready.");
    }

    private boolean hasReferenceData(Connection connection) throws SQLException {
        try (Statement statement = connection.createStatement();
             var resultSet = statement.executeQuery("SELECT COUNT(*) FROM categories")) {
            return resultSet.next() && resultSet.getInt(1) > 0;
        }
    }

    /** Reads a .sql file from the classpath and executes each ";"-terminated statement. */
    private void runScript(Connection connection, String classpathLocation) throws IOException, SQLException {
        String sql = readClasspathFile(classpathLocation);
        List<String> statements = splitStatements(sql);

        try (Statement statement = connection.createStatement()) {
            for (String sqlStatement : statements) {
                try {
                    statement.execute(sqlStatement);
                } catch (SQLException e) {
                    log.log(Level.WARNING, "Skipping statement in " + classpathLocation + " (" + e.getMessage() + ")");
                }
            }
        }
    }

    private String readClasspathFile(String location) throws IOException {
        StringBuilder builder = new StringBuilder();
        try (InputStream inputStream = new ClassPathResource(location).getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                // Skip full-line comments so they don't interfere with statement splitting
                if (line.trim().startsWith("--") || line.trim().isEmpty()) {
                    continue;
                }
                builder.append(line).append('\n');
            }
        }
        return builder.toString();
    }

    private List<String> splitStatements(String sql) {
        List<String> statements = new ArrayList<>();
        for (String part : sql.split(";")) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) {
                statements.add(trimmed);
            }
        }
        return statements;
    }
}
