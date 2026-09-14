-- Create user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'pmix') THEN
    CREATE USER pmix WITH PASSWORD 'pmix123';
  END IF;
END
$$;

-- Create database if not exists
SELECT 'CREATE DATABASE pmix_dev OWNER pmix'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'pmix_dev')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pmix_dev TO pmix;