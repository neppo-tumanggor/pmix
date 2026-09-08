-- Create user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mixer') THEN
    CREATE USER mixer WITH PASSWORD 'mixer123';
  END IF;
END
$$;

-- Create database if not exists
SELECT 'CREATE DATABASE mixer_dev OWNER mixer'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mixer_dev')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE mixer_dev TO mixer;