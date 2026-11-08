-- Add office hierarchy, GPS coordinates, description, and status fields to identity.offices
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'identity' AND table_name = 'offices') THEN 
        ALTER TABLE identity.offices ADD COLUMN IF NOT EXISTS office_type varchar(50) NOT NULL DEFAULT 'HeadOffice';
        ALTER TABLE identity.offices ADD COLUMN IF NOT EXISTS description text;
        ALTER TABLE identity.offices ADD COLUMN IF NOT EXISTS location_address varchar(500);
        ALTER TABLE identity.offices ADD COLUMN IF NOT EXISTS location varchar(500);
        ALTER TABLE identity.offices ADD COLUMN IF NOT EXISTS latitude double precision;
        ALTER TABLE identity.offices ADD COLUMN IF NOT EXISTS longitude double precision;
        ALTER TABLE identity.offices ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

        -- For existing offices with parent_office_id, update their office_type if still default
        UPDATE identity.offices 
        SET office_type = 'AreaOffice' 
        WHERE parent_office_id IS NOT NULL AND office_type = 'HeadOffice';
    END IF; 
END $$;
