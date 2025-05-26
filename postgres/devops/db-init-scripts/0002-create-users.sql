-- ================================
-- Create Roles and Users
-- ================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'web_site') THEN
        CREATE ROLE web_site;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'web_client') THEN
        CREATE USER web_client WITH ENCRYPTED PASSWORD 'P@ssw0rd';
    END IF;

    -- Add users to group
    GRANT web_site TO web_client;
END $$;

-- ================================
-- Step 3: Grant Connection Privileges
-- ================================
GRANT CONNECT ON DATABASE exercise TO web_site;

-- ================================
-- Step 4: Grant Object Privileges in Each Database
-- ================================
\c  exercise;
GRANT USAGE ON SCHEMA public TO web_site;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO web_site;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO web_site;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO web_site;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO web_site;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
	GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO web_site;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
	GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO web_site;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
	GRANT EXECUTE ON FUNCTIONS TO web_site;
