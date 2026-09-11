-- =====================================================================
-- Migration 013: Link subjects to a sample programme
-- JomDekan — the taxonomy tables (faculties, programmes, subjects,
-- programme_subjects) existed since Migration 001 but nothing wired the
-- subject list to a specific programme. This links a handful of subjects
-- to Universiti Teknologi MARA's "Bachelor of Computer Science (Hons)"
-- programme, so the cascading University -> Faculty -> Programme ->
-- Subject picker on the Upload Resource page has real data to show
-- end-to-end. Admins can link further subjects to other programmes from
-- the admin panel.
--
-- Matches the faculty/programme by name (not slug) and only creates them
-- if missing, because dev environments may already have this data seeded
-- with a different slug via database/seed.sql (dev-only, not a
-- migration) — matching by slug here would silently create a duplicate
-- row instead of reusing the existing one.
-- =====================================================================
-- Idempotent-safe: every insert is guarded by NOT EXISTS / ON CONFLICT.

INSERT INTO faculties (university_id, name, slug)
SELECT u.id, 'Faculty of Computer and Mathematical Sciences', 'faculty-of-computer-and-mathematical-sciences'
FROM universities u
WHERE u.slug = 'universiti-teknologi-mara'
  AND NOT EXISTS (
    SELECT 1 FROM faculties f
    WHERE f.university_id = u.id
      AND f.name = 'Faculty of Computer and Mathematical Sciences'
  );

INSERT INTO programmes (faculty_id, name, slug, study_level)
SELECT f.id, 'Bachelor of Computer Science (Hons)', 'bachelor-of-computer-science-hons', 'DEGREE'
FROM faculties f
JOIN universities u ON u.id = f.university_id
WHERE u.slug = 'universiti-teknologi-mara'
  AND f.name = 'Faculty of Computer and Mathematical Sciences'
  AND NOT EXISTS (
    SELECT 1 FROM programmes p
    WHERE p.faculty_id = f.id
      AND p.name = 'Bachelor of Computer Science (Hons)'
  );

INSERT INTO subjects (code, name) VALUES
    ('CSC510', 'Software Engineering'),
    ('CSC512', 'Web Application Development'),
    ('CSC548', 'Database Systems'),
    ('CSC583', 'Human Computer Interaction')
ON CONFLICT (code) DO NOTHING;

INSERT INTO programme_subjects (programme_id, subject_id, curriculum_year)
SELECT p.id, s.id, 2024
FROM programmes p
JOIN faculties f ON f.id = p.faculty_id
JOIN universities u ON u.id = f.university_id
JOIN subjects s ON s.code IN ('CSC510', 'CSC512', 'CSC548', 'CSC583')
WHERE u.slug = 'universiti-teknologi-mara'
  AND f.name = 'Faculty of Computer and Mathematical Sciences'
  AND p.name = 'Bachelor of Computer Science (Hons)'
ON CONFLICT (programme_id, subject_id, curriculum_year) DO NOTHING;
