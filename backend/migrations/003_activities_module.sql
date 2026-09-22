CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL
        CHECK (type IN ('call', 'email', 'meeting', 'note')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_contact_id
    ON activities(contact_id);

CREATE INDEX IF NOT EXISTS idx_activities_created_at
    ON activities(created_at);