-- Create database
CREATE DATABASE social_services;

-- Create tables
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,  -- food_pantry, dhhs, ywca, etc.
    website VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    description TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    hours TEXT,
    wheelchair_accessible BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL  -- food_assistance, housing, medical, etc.
);

CREATE TABLE organization_services (
    organization_id INTEGER REFERENCES organizations(id),
    service_id INTEGER REFERENCES services(id),
    PRIMARY KEY (organization_id, service_id)
);

CREATE TABLE requirements (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    service_id INTEGER REFERENCES services(id),
    requirement TEXT NOT NULL,
    description TEXT,
    PRIMARY KEY (organization_id, service_id, requirement)
);

-- Create indexes for better query performance
CREATE INDEX idx_org_type ON organizations(type);
CREATE INDEX idx_location_coordinates ON locations(latitude, longitude);
CREATE INDEX idx_org_services ON organization_services(organization_id, service_id);
