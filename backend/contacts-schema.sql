CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    name VARCHAR(120) NOT NULL,
    company VARCHAR(160),
    email VARCHAR(160),
    phone VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'hot', 'warm', 'cold', 'converted')),
    tags TEXT[] NOT NULL DEFAULT '{}',
    source VARCHAR(80),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_owner_id
    ON contacts(owner_id);

CREATE INDEX IF NOT EXISTS idx_contacts_status
    ON contacts(status);

CREATE INDEX IF NOT EXISTS idx_contacts_name_company
    ON contacts(name, company);