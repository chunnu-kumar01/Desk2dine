-- =====================================================================
-- Desk2Dine — MySQL schema
-- Executed automatically on application startup by SchemaInitializer
-- (see com.desk2dine.config.SchemaInitializer). Every statement is
-- idempotent (CREATE TABLE IF NOT EXISTS, indexes declared inline) so
-- it is safe to start the app repeatedly against the same database.
-- =====================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- users: one row per person who can log in (faculty or admin)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150)    NOT NULL,
    email           VARCHAR(190)    NOT NULL,
    mobile_number   VARCHAR(15)     NOT NULL,
    password_hash   VARCHAR(60)     NOT NULL,
    role            ENUM('FACULTY','ADMIN') NOT NULL,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email),
    KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- faculty: extra profile fields for users with role = FACULTY (1-to-1)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty (
    user_id         BIGINT          PRIMARY KEY,
    department      VARCHAR(100),
    designation     VARCHAR(100),
    CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- admin: extra profile fields for users with role = ADMIN (1-to-1)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin (
    user_id         BIGINT          PRIMARY KEY,
    admin_level     VARCHAR(50)     NOT NULL DEFAULT 'STANDARD',
    CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- categories: menu categories (Beverages, Snacks, ...)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    description     VARCHAR(255),
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_categories_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- menu_items: items faculty can order, each belonging to a category
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id     BIGINT          NOT NULL,
    name            VARCHAR(120)    NOT NULL,
    description     VARCHAR(255),
    price           DECIMAL(10,2)   NOT NULL,
    image_url       VARCHAR(255),
    is_available    TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_category FOREIGN KEY (category_id) REFERENCES categories (id),
    KEY idx_menu_category (category_id),
    KEY idx_menu_name (name),
    KEY idx_menu_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- delivery_locations: rooms/blocks orders can be delivered to
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delivery_locations (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    block           VARCHAR(50),
    floor           VARCHAR(20),
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    CONSTRAINT uq_location_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- bill_number_sequence: a single-row counter used to atomically hand
-- out the next bill number (see OrderRepository#nextBillNumber). Using
-- "UPDATE ... SET last_value = LAST_INSERT_ID(last_value + 1)" is a
-- well-known MySQL trick for a race-free counter without locking the
-- whole orders table, which is safer under concurrent bill generation
-- than "SELECT MAX(bill_number)+1 FROM orders".
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bill_number_sequence (
    id          TINYINT PRIMARY KEY,
    counter     BIGINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO bill_number_sequence (id, counter) VALUES (1, 0);

-- ---------------------------------------------------------------------
-- orders: one row per placed order; drives the PLACED..COMPLETED workflow
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT          NOT NULL,
    delivery_location_id    BIGINT          NOT NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'PLACED',
    total_amount            DECIMAL(10,2)   NOT NULL,
    bill_number             BIGINT,
    order_time              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivered_time          TIMESTAMP       NULL,
    received_time           TIMESTAMP       NULL,
    billed_time             TIMESTAMP       NULL,
    paid_time               TIMESTAMP       NULL,
    completed_time          TIMESTAMP       NULL,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_orders_location FOREIGN KEY (delivery_location_id) REFERENCES delivery_locations (id),
    CONSTRAINT uq_orders_bill_number UNIQUE (bill_number),
    KEY idx_orders_user (user_id),
    KEY idx_orders_status (status),
    KEY idx_orders_time (order_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- order_items: line items of an order (menu item + qty), price snapshot
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT          NOT NULL,
    menu_item_id    BIGINT          NOT NULL,
    item_name       VARCHAR(120)    NOT NULL,
    unit_price      DECIMAL(10,2)   NOT NULL,
    quantity        INT             NOT NULL,
    amount          DECIMAL(10,2)   NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_menu FOREIGN KEY (menu_item_id) REFERENCES menu_items (id),
    KEY idx_order_items_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- payments: one payment record per order, created when the bill is generated
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT          NOT NULL,
    bill_number     BIGINT          NOT NULL,
    amount          DECIMAL(10,2)   NOT NULL,
    payment_method  VARCHAR(30)     NOT NULL DEFAULT 'CASH',
    payment_status  VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    paid_at         TIMESTAMP       NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT uq_payments_order UNIQUE (order_id),
    KEY idx_payments_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- favourites: faculty members can star menu items for quick reordering
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favourites (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    menu_item_id    BIGINT          NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_menu FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE CASCADE,
    CONSTRAINT uq_fav_user_item UNIQUE (user_id, menu_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- notifications: in-app alerts for a user (order status changes, etc.)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    title           VARCHAR(150)    NOT NULL,
    message         VARCHAR(500)    NOT NULL,
    is_read         TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    KEY idx_notif_user (user_id),
    KEY idx_notif_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- password_reset_tokens: single-use, expiring tokens for forgot-password
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    token           VARCHAR(120)    NOT NULL,
    expires_at      TIMESTAMP       NOT NULL,
    used            TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_prt_token UNIQUE (token),
    KEY idx_prt_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- audit_logs: append-only trail of security-sensitive / business actions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT,
    action          VARCHAR(80)     NOT NULL,
    entity_type     VARCHAR(60),
    entity_id       BIGINT,
    details         VARCHAR(500),
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    KEY idx_audit_user (user_id),
    KEY idx_audit_action (action),
    KEY idx_audit_time (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
