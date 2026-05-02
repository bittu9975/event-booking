-- ============================================
-- Event Booking System - PostgreSQL Setup
-- ============================================

-- Drop tables (safe re-run)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop old ENUMs (cleanup if they exist)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(100)  UNIQUE NOT NULL,
    password    VARCHAR(255)  NOT NULL,

    -- ✅ FIX: no ENUM
    role        VARCHAR(10) NOT NULL DEFAULT 'USER'
                CHECK (role IN ('USER', 'ADMIN')),

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Events Table
-- ============================================
CREATE TABLE events (
    id               BIGSERIAL PRIMARY KEY,
    title            VARCHAR(255)    NOT NULL,
    description      TEXT,
    date             TIMESTAMP       NOT NULL,
    location         VARCHAR(255)    NOT NULL,
    price            NUMERIC(10, 2)  NOT NULL DEFAULT 0.00,
    total_seats      INT             NOT NULL,
    available_seats  INT             NOT NULL,
    image_url        VARCHAR(500),
    category         VARCHAR(100)    NOT NULL,
    created_by       BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Bookings Table (🔥 MAIN FIX HERE)
-- ============================================
CREATE TABLE bookings (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id     BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    tickets      INT NOT NULL DEFAULT 1,
    total_price  NUMERIC(10, 2) NOT NULL,
    qr_code      TEXT,

    -- ✅ FIX: replaced ENUM with VARCHAR
    status       VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED'
                CHECK (status IN ('CONFIRMED', 'CANCELLED')),

    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_events_category   ON events(category);
CREATE INDEX idx_events_date       ON events(date);
CREATE INDEX idx_bookings_user_id  ON bookings(user_id);
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_status   ON bookings(status);

-- ============================================
-- Seed Data
-- ============================================

INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@eventbook.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'ADMIN');

INSERT INTO events (title, description, date, location, price, total_seats, available_seats, image_url, category, created_by) VALUES
('TechConf 2025', 'Annual technology conference', '2025-08-15 09:00:00', 'Mumbai Convention Center', 1500.00, 500, 500, '', 'Technology', 1);

-- ============================================
-- Verify
-- ============================================
SELECT 'Users:' AS table_name, COUNT(*) FROM users
UNION ALL
SELECT 'Events:', COUNT(*) FROM events
UNION ALL
SELECT 'Bookings:', COUNT(*) FROM bookings;