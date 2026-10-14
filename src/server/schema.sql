-- Disruptajob schema.
--
-- Shaped around the product's central claim: capability is derived from evidence, never declared.
-- So `capability` has no score column — scores are computed from tagged projects at read time and
-- there is deliberately nowhere to write one directly.
--
-- Privacy is likewise structural: `candidate.discoverability` defaults to 'hidden', and
-- `blocked_company` exists so "my current employer must never see this" is enforced by a join
-- rather than by remembering to filter.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS account (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('talent', 'employer')),
  -- Prototype auth: no password hashing, no email delivery. Sign-in is by email only.
  candidate_id  TEXT,
  company_id    TEXT,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
  token       TEXT PRIMARY KEY,
  account_id  TEXT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL
);

-- --- Candidate side --------------------------------------------------------

CREATE TABLE IF NOT EXISTS candidate (
  id                  TEXT PRIMARY KEY,
  slug                TEXT NOT NULL UNIQUE,
  name                TEXT NOT NULL,
  headline            TEXT NOT NULL DEFAULT '',
  short_description   TEXT NOT NULL DEFAULT '',
  location            TEXT NOT NULL DEFAULT '',
  availability        TEXT NOT NULL DEFAULT 'open',
  avatar_initials     TEXT NOT NULL DEFAULT '',
  accent_index        INTEGER NOT NULL DEFAULT 0,
  -- Never assume consent: a profile is invisible to search until explicitly opened up.
  discoverability     TEXT NOT NULL DEFAULT 'hidden'
                      CHECK (discoverability IN ('hidden', 'open', 'selectively-open')),
  -- Private. Only ever compared, never returned to an employer.
  comp_floor          TEXT,
  location_constraint TEXT,
  created_at          TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blocked_company (
  candidate_id  TEXT NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  company_name  TEXT NOT NULL,
  PRIMARY KEY (candidate_id, company_name)
);

CREATE TABLE IF NOT EXISTS candidate_role_type (
  candidate_id  TEXT NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  role_type     TEXT NOT NULL,
  PRIMARY KEY (candidate_id, role_type)
);

CREATE TABLE IF NOT EXISTS candidate_arrangement (
  candidate_id  TEXT NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  arrangement   TEXT NOT NULL CHECK (arrangement IN ('remote', 'hybrid', 'onsite')),
  PRIMARY KEY (candidate_id, arrangement)
);

CREATE TABLE IF NOT EXISTS candidate_dealbreaker (
  candidate_id  TEXT NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  dealbreaker   TEXT NOT NULL,
  PRIMARY KEY (candidate_id, dealbreaker)
);

CREATE TABLE IF NOT EXISTS experience (
  id            TEXT PRIMARY KEY,
  candidate_id  TEXT NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  company       TEXT NOT NULL,
  role          TEXT NOT NULL,
  start_date    TEXT NOT NULL,
  end_date      TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS education (
  id            TEXT PRIMARY KEY,
  candidate_id  TEXT NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  institution   TEXT NOT NULL,
  qualification TEXT NOT NULL,
  end_year      TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

-- --- Evidence --------------------------------------------------------------

CREATE TABLE IF NOT EXISTS project (
  id              TEXT PRIMARY KEY,
  owner_id        TEXT NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  slug            TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  thumbnail_seed  TEXT NOT NULL DEFAULT '',
  outcome         TEXT NOT NULL DEFAULT '',
  problem         TEXT NOT NULL DEFAULT '',
  what_i_built    TEXT NOT NULL DEFAULT '',
  my_contribution TEXT NOT NULL DEFAULT '',
  demo_url        TEXT,
  -- Drafts (e.g. an unreviewed GitHub import) never count toward capability scores.
  status          TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  source          TEXT NOT NULL DEFAULT 'manual',
  created_at      TEXT NOT NULL,
  UNIQUE (owner_id, slug)
);

-- The join that makes a capability real. No score column by design.
CREATE TABLE IF NOT EXISTS project_capability (
  project_id  TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  tag         TEXT NOT NULL,
  PRIMARY KEY (project_id, tag)
);

CREATE TABLE IF NOT EXISTS project_tool (
  project_id  TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  tool        TEXT NOT NULL,
  PRIMARY KEY (project_id, tool)
);

CREATE TABLE IF NOT EXISTS evidence (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  label       TEXT NOT NULL,
  description TEXT,
  url         TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS project_process_step (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- --- Company side ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS company (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  blurb           TEXT NOT NULL DEFAULT '',
  website         TEXT,
  stage           TEXT,
  team_size       TEXT,
  location        TEXT,
  avatar_initials TEXT NOT NULL DEFAULT '',
  accent_index    INTEGER NOT NULL DEFAULT 0,
  published       INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS role (
  id            TEXT PRIMARY KEY,
  company_id    TEXT NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  why_this_role TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed')),
  comp_range    TEXT,
  location      TEXT,
  start_window  TEXT,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS role_arrangement (
  role_id     TEXT NOT NULL REFERENCES role(id) ON DELETE CASCADE,
  arrangement TEXT NOT NULL CHECK (arrangement IN ('remote', 'hybrid', 'onsite')),
  PRIMARY KEY (role_id, arrangement)
);

CREATE TABLE IF NOT EXISTS role_constraint (
  role_id    TEXT NOT NULL REFERENCES role(id) ON DELETE CASCADE,
  constraint_text TEXT NOT NULL,
  PRIMARY KEY (role_id, constraint_text)
);

-- The company-side mirror of `project`: real work, tagged with what it demands.
CREATE TABLE IF NOT EXISTS work_example (
  id          TEXT PRIMARY KEY,
  role_id     TEXT NOT NULL REFERENCES role(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  timeframe   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS work_example_capability (
  work_example_id TEXT NOT NULL REFERENCES work_example(id) ON DELETE CASCADE,
  tag             TEXT NOT NULL,
  PRIMARY KEY (work_example_id, tag)
);

CREATE TABLE IF NOT EXISTS work_example_step (
  id              TEXT PRIMARY KEY,
  work_example_id TEXT NOT NULL REFERENCES work_example(id) ON DELETE CASCADE,
  step            TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS work_example_attachment (
  id              TEXT PRIMARY KEY,
  work_example_id TEXT NOT NULL REFERENCES work_example(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  url             TEXT,
  kind            TEXT NOT NULL CHECK (kind IN ('file', 'link'))
);

-- --- Conversations and pipeline -------------------------------------------

CREATE TABLE IF NOT EXISTS invite (
  id                 TEXT PRIMARY KEY,
  candidate_id       TEXT NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  company_id         TEXT NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  role_id            TEXT REFERENCES role(id) ON DELETE SET NULL,
  role_title         TEXT NOT NULL,
  message            TEXT NOT NULL,
  compensation_range TEXT,
  status             TEXT NOT NULL DEFAULT 'sent'
                     CHECK (status IN ('sent', 'viewed', 'accepted', 'declined')),
  responded_at       TEXT,
  created_at         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invite_message (
  id          TEXT PRIMARY KEY,
  invite_id   TEXT NOT NULL REFERENCES invite(id) ON DELETE CASCADE,
  sender      TEXT NOT NULL CHECK (sender IN ('employer', 'candidate')),
  body        TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

-- A candidate occupies exactly one stage per company, hence the composite primary key.
CREATE TABLE IF NOT EXISTS pipeline_entry (
  company_id   TEXT NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  candidate_id TEXT NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  role_id      TEXT REFERENCES role(id) ON DELETE SET NULL,
  stage        TEXT NOT NULL
               CHECK (stage IN ('reviewing', 'shortlisted', 'reached-out', 'talking')),
  position     INTEGER NOT NULL DEFAULT 0,
  note         TEXT,
  updated_at   TEXT NOT NULL,
  PRIMARY KEY (company_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS saved_candidate (
  company_id   TEXT NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  candidate_id TEXT NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  saved_at     TEXT NOT NULL,
  PRIMARY KEY (company_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS saved_search (
  id          TEXT PRIMARY KEY,
  company_id  TEXT NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  query       TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_owner ON project(owner_id);
CREATE INDEX IF NOT EXISTS idx_invite_candidate ON invite(candidate_id);
CREATE INDEX IF NOT EXISTS idx_invite_company ON invite(company_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_company ON pipeline_entry(company_id);
CREATE INDEX IF NOT EXISTS idx_role_company ON role(company_id);
