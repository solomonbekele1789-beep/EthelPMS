-- Add user history, employment, and personal information fields to identity.users
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'identity' AND table_name = 'users') THEN 
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS middle_name varchar(100);
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS date_of_birth date;
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS gender varchar(20);
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS address varchar(500);
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS employee_id varchar(50);
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS employment_date date;
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS level_of_education varchar(100);
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS qualification varchar(200);
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS basic_salary numeric(18,2);
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES identity.users(id) ON DELETE SET NULL;
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS profile_photo_url text;
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS region varchar(100);
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS office_level varchar(50);
    END IF; 
END $$;
