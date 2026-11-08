-- Add area type, GPS coordinates, altitude, accuracy, and landmark fields to projects.intervention_areas
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'projects' AND table_name = 'intervention_areas') THEN 
        ALTER TABLE projects.intervention_areas ADD COLUMN IF NOT EXISTS area_type varchar(50) NOT NULL DEFAULT 'Region';
        ALTER TABLE projects.intervention_areas ADD COLUMN IF NOT EXISTS latitude double precision;
        ALTER TABLE projects.intervention_areas ADD COLUMN IF NOT EXISTS longitude double precision;
        ALTER TABLE projects.intervention_areas ADD COLUMN IF NOT EXISTS altitude double precision;
        ALTER TABLE projects.intervention_areas ADD COLUMN IF NOT EXISTS accuracy double precision;
        ALTER TABLE projects.intervention_areas ADD COLUMN IF NOT EXISTS gps_source varchar(50);
        ALTER TABLE projects.intervention_areas ADD COLUMN IF NOT EXISTS landmark_or_address varchar(500);

        -- Map existing levels to area_type if needed
        UPDATE projects.intervention_areas SET area_type = 'Country' WHERE level = 0 AND area_type = 'Region';
        UPDATE projects.intervention_areas SET area_type = 'Region' WHERE level = 1;
        UPDATE projects.intervention_areas SET area_type = 'Zone' WHERE level = 2;
        UPDATE projects.intervention_areas SET area_type = 'Woreda' WHERE level = 3;
        UPDATE projects.intervention_areas SET area_type = 'Kebele' WHERE level = 4;
        UPDATE projects.intervention_areas SET area_type = 'Site' WHERE level >= 5;
    END IF; 

    -- Seed permissions for intervention areas if identity.permissions table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'identity' AND table_name = 'permissions') THEN
        INSERT INTO identity.permissions (id, code, display_name, module, resource, action)
        VALUES 
            (gen_random_uuid(), 'projects.interventionareas.read', 'View Intervention Areas', 'Projects', 'InterventionAreas', 'read'),
            (gen_random_uuid(), 'projects.interventionareas.create', 'Create Intervention Areas', 'Projects', 'InterventionAreas', 'create'),
            (gen_random_uuid(), 'projects.interventionareas.update', 'Update Intervention Areas', 'Projects', 'InterventionAreas', 'update'),
            (gen_random_uuid(), 'projects.interventionareas.delete', 'Delete Intervention Areas', 'Projects', 'InterventionAreas', 'delete'),
            (gen_random_uuid(), 'projects.interventionareas.manage', 'Manage Intervention Area Allocations', 'Projects', 'InterventionAreas', 'manage')
        ON CONFLICT (code) DO NOTHING;
    END IF;
END $$;
