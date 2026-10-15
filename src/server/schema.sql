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

-- Funnel measurement, kept first-party on purpose.
--
-- A product whose promise is "hidden until you say otherwise" cannot ship third-party tracking
-- scripts: the same page that says nobody sees you would be telling an ad network you were here.
-- So events live in this database and go nowhere else.
--
-- `visitor` is a random id in a first-party cookie. It exists to stitch one person's steps into a
-- funnel and nothing more — there is deliberately no IP address, no user agent and no fingerprint
-- column, so a row can identify a session but never a human.
CREATE TABLE IF NOT EXISTS event (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  visitor    TEXT NOT NULL,
  path       TEXT,
  -- JSON, for the handful of dimensions worth slicing by (which step, which side of the market).
  props      TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_event_name ON event(name);
CREATE INDEX IF NOT EXISTS idx_event_visitor ON event(visitor);
CREATE INDEX IF NOT EXISTS idx_event_created ON event(created_at);

-- The visitor who understood the pitch but isn't ready to spend ten minutes today.
-- Without this they leave no trace and there is no way to ever reach them again.
CREATE TABLE IF NOT EXISTS interest (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  -- 'talent' or 'employer' — which door they were standing at when they asked.
  side       TEXT NOT NULL DEFAULT 'talent' CHECK (side IN ('talent', 'employer')),
  note       TEXT,
  created_at TEXT NOT NULL
);

-- Rate limiting.
--
-- One row per attempt, pruned as it goes. The identifier is either an email address already being
-- submitted, or a salted hash of the caller's IP — never the address itself, which the rest of
-- this application deliberately does not store.
CREATE TABLE IF NOT EXISTS rate_attempt (
  id         TEXT PRIMARY KEY,
  bucket     TEXT NOT NULL,
  subject    TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_lookup ON rate_attempt(bucket, subject, created_at);
