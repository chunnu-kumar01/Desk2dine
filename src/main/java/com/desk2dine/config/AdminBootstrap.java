package com.desk2dine.config;

import com.desk2dine.entity.AdminProfile;
import com.desk2dine.entity.User;
import com.desk2dine.repository.AdminProfileRepository;
import com.desk2dine.repository.UserRepository;
import com.desk2dine.security.Role;
import com.desk2dine.util.PasswordUtil;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.logging.Logger;

/**
 * Ensures at least one ADMIN account exists so the system is never
 * unreachable after a fresh install. The password is hashed at runtime
 * with the exact same PasswordUtil (jBCrypt) the login flow verifies
 * against — deliberately NOT a hardcoded hash string in a SQL script,
 * because different BCrypt library versions use slightly different hash
 * prefixes ($2a$ vs $2b$) and a hash baked in by a different tool can
 * fail to verify.
 *
 * Runs once, after SchemaInitializer (see @Order), and only inserts a
 * row if zero ADMIN users exist yet — so it's safe on every restart.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = Logger.getLogger(AdminBootstrap.class.getName());

    private static final String DEFAULT_ADMIN_EMAIL = "admin@desk2dine.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "Admin@123";

    private final DataSource dataSource;
    private final UserRepository userRepository;
    private final AdminProfileRepository adminProfileRepository;

    public AdminBootstrap(DataSource dataSource, UserRepository userRepository,
                           AdminProfileRepository adminProfileRepository) {
        this.dataSource = dataSource;
        this.userRepository = userRepository;
        this.adminProfileRepository = adminProfileRepository;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (userRepository.countByRole(Role.ADMIN) > 0) {
            log.info("Desk2Dine: an admin account already exists, skipping bootstrap.");
            return;
        }

        User admin = new User();
        admin.setFullName("Desk2Dine Administrator");
        admin.setEmail(DEFAULT_ADMIN_EMAIL);
        admin.setMobileNumber("9999999999");
        admin.setPasswordHash(PasswordUtil.hash(DEFAULT_ADMIN_PASSWORD));
        admin.setRole(Role.ADMIN);
        admin.setActive(true);

        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try {
                userRepository.insert(connection, admin);
                AdminProfile profile = new AdminProfile();
                profile.setUserId(admin.getId());
                profile.setAdminLevel("SUPER");
                adminProfileRepository.insert(connection, profile);
                connection.commit();
            } catch (RuntimeException e) {
                connection.rollback();
                throw e;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (SQLException e) {
            log.severe("Desk2Dine: failed to bootstrap default admin account: " + e.getMessage());
            return;
        }

        log.warning("Desk2Dine: created default admin account — email: " + DEFAULT_ADMIN_EMAIL +
                ", password: " + DEFAULT_ADMIN_PASSWORD + " — please log in and change this password immediately.");
    }
}
