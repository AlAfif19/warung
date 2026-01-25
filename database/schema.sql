-- Database Schema for HPP Calculator & Business Projection
-- MySQL Database

-- Create database
CREATE DATABASE IF NOT EXISTS warung_hpp;
USE warung_hpp;

-- Table: products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mode ENUM('per_pcs', 'per_batch') NOT NULL DEFAULT 'per_pcs',
    batch_size INT DEFAULT 1 COMMENT 'Number of units per batch if mode is per_batch',
    hpp_per_unit DECIMAL(12, 2) DEFAULT 0.00,
    selling_price DECIMAL(12, 2) DEFAULT 0.00,
    pricing_tier ENUM('competitive', 'standard', 'premium', 'manual') DEFAULT 'standard',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mode (mode),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: raw_materials
CREATE TABLE IF NOT EXISTS raw_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: fixed_costs
CREATE TABLE IF NOT EXISTS fixed_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category ENUM('rent', 'utilities', 'internet', 'salary', 'marketing', 'other') NOT NULL DEFAULT 'other',
    monthly_amount DECIMAL(12, 2) NOT NULL,
    is_marketing BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_marketing (is_marketing)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: product_fixed_cost_allocations
CREATE TABLE IF NOT EXISTS product_fixed_cost_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    fixed_cost_id INT NOT NULL,
    allocation_method ENUM('proportional', 'manual') NOT NULL DEFAULT 'proportional',
    allocated_amount DECIMAL(12, 2) NOT NULL,
    allocation_percentage DECIMAL(5, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (fixed_cost_id) REFERENCES fixed_costs(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_fixed_cost_id (fixed_cost_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: business_projections
CREATE TABLE IF NOT EXISTS business_projections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    scenario_name VARCHAR(255) DEFAULT 'Default',
    target_profit_monthly DECIMAL(12, 2) NOT NULL,
    selling_price_used DECIMAL(12, 2) NOT NULL,
    target_units_monthly INT NOT NULL,
    target_units_daily DECIMAL(10, 2) NOT NULL,
    projected_revenue DECIMAL(12, 2) NOT NULL,
    projected_total_product_cost DECIMAL(12, 2) NOT NULL,
    projected_total_fixed_cost DECIMAL(12, 2) NOT NULL,
    projected_gross_profit DECIMAL(12, 2) NOT NULL,
    projected_net_profit DECIMAL(12, 2) NOT NULL,
    gross_margin_percent DECIMAL(5, 2) NOT NULL,
    net_margin_percent DECIMAL(5, 2) NOT NULL,
    roas_ratio DECIMAL(6, 2) DEFAULT NULL,
    break_even_units INT NOT NULL,
    break_even_revenue DECIMAL(12, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: units_conversion (optional for advanced features)
CREATE TABLE IF NOT EXISTS units_conversion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    base_unit VARCHAR(50) NOT NULL,
    target_unit VARCHAR(50) NOT NULL,
    conversion_factor DECIMAL(10, 6) NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_conversion (base_unit, target_unit),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default unit conversions
INSERT INTO units_conversion (base_unit, target_unit, conversion_factor, category) VALUES
('kg', 'g', 1000, 'weight'),
('g', 'kg', 0.001, 'weight'),
('liter', 'ml', 1000, 'volume'),
('ml', 'liter', 0.001, 'volume'),
('dozen', 'pcs', 12, 'count'),
('pcs', 'dozen', 0.08333, 'count'),
('pack', 'pcs', 1, 'count'),
('box', 'pcs', 1, 'count');

-- Table: scenarios (for saving and comparing different calculation scenarios)
CREATE TABLE IF NOT EXISTS scenarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
