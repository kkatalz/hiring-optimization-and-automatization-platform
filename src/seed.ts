import { AppDataSource } from './ormconfig';

/**
 * Seeds the database with realistic mock data for development/demo.
 * Excludes interviews (as requested).
 *
 * Run: npm run db:seed
 */

// ── UUIDs (all valid v4 format) ─────────────────────────────────
// Tenants
const T1 = '3a1b2c3d-e5f6-4a1b-8c2d-1a0000000001';
const T2 = '3a1b2c3d-e5f6-4a1b-8c2d-1a0000000002';

// Users — staff
const U_ADMIN_ACME = '4b2c3d4e-f6a7-4b2c-9d3e-2b0000000001';
const U_REC1_ACME = '4b2c3d4e-f6a7-4b2c-9d3e-2b0000000002';
const U_REC2_ACME = '4b2c3d4e-f6a7-4b2c-9d3e-2b0000000003';
const U_ADMIN_BRIGHT = '4b2c3d4e-f6a7-4b2c-9d3e-2b0000000004';
const U_SUPER = '4b2c3d4e-f6a7-4b2c-9d3e-2b0000000005';

// Users — candidates
const U_ALICE = '5c3d4e5f-a7b8-4c3d-ae4f-3c0000000001';
const U_BOB = '5c3d4e5f-a7b8-4c3d-ae4f-3c0000000002';
const U_CAROL = '5c3d4e5f-a7b8-4c3d-ae4f-3c0000000003';
const U_DAN = '5c3d4e5f-a7b8-4c3d-ae4f-3c0000000004';
const U_EMMA = '5c3d4e5f-a7b8-4c3d-ae4f-3c0000000005';

// Candidate profiles
const CP_ALICE = '6d4e5f6a-b8c9-4d4e-bf5a-4d0000000001';
const CP_BOB = '6d4e5f6a-b8c9-4d4e-bf5a-4d0000000002';
const CP_CAROL = '6d4e5f6a-b8c9-4d4e-bf5a-4d0000000003';
const CP_DAN = '6d4e5f6a-b8c9-4d4e-bf5a-4d0000000004';
const CP_EMMA = '6d4e5f6a-b8c9-4d4e-bf5a-4d0000000005';

// Vacancies
const V_FRONTEND = '7e5f6a7b-c9d0-4e5f-a06b-5e0000000001';
const V_BACKEND = '7e5f6a7b-c9d0-4e5f-a06b-5e0000000002';
const V_UX = '7e5f6a7b-c9d0-4e5f-a06b-5e0000000003';

// Questions
const Q_REACT_EXP = '8f6a7b8c-d0e1-4f6a-b17c-6f0000000001';
const Q_EDUCATION = '8f6a7b8c-d0e1-4f6a-b17c-6f0000000002';
const Q_PROJECT = '8f6a7b8c-d0e1-4f6a-b17c-6f0000000003';
const Q_RELOCATE = '8f6a7b8c-d0e1-4f6a-b17c-6f0000000004';
const Q_TECH = '8f6a7b8c-d0e1-4f6a-b17c-6f0000000005';
const Q_POSTGRES = '8f6a7b8c-d0e1-4f6a-b17c-6f0000000006';

// Submissions
const S_ALICE_FE = '9a7b8c9d-e1f2-4a7b-82cd-7a0000000001';
const S_BOB_FE = '9a7b8c9d-e1f2-4a7b-82cd-7a0000000002';
const S_DAN_FE = '9a7b8c9d-e1f2-4a7b-82cd-7a0000000003';
const S_CAROL_BE = '9a7b8c9d-e1f2-4a7b-82cd-7a0000000004';
const S_EMMA_BE = '9a7b8c9d-e1f2-4a7b-82cd-7a0000000005';
const S_ALICE_UX = '9a7b8c9d-e1f2-4a7b-82cd-7a0000000006';
const S_BOB_UX = '9a7b8c9d-e1f2-4a7b-82cd-7a0000000007';

async function seed() {
  const ds = await AppDataSource.initialize();
  const qr = ds.createQueryRunner();

  // Password hash for "Password1!" (bcrypt 10 rounds)
  const pw = '$2a$10$cFDS5bbWujwcuF2w4jm9IuIyuw9PpKF29mvrpT.xpfWF0hfC8j5Ly';

  try {
    await qr.startTransaction();

    // ── 1. Tenants ──────────────────────────────────────────────
    await qr.query(`
      INSERT INTO tenants (id, email, slug, deleted) VALUES
        ('${T1}', 'acme-hiring@example.com', 'acme-hiring', false),
        ('${T2}', 'bright-hr@example.com',   'bright-hr',   false)
    `);

    // ── 2. Users ────────────────────────────────────────────────
    await qr.query(`
      INSERT INTO users (id, email, password, first_name, last_name, deleted, role, tenant_id) VALUES
        ('${U_ADMIN_ACME}',  'admin@acme.com',      '${pw}', 'Olivia',   'Chen',      false, 'admin',     '${T1}'),
        ('${U_REC1_ACME}',   'recruiter1@acme.com', '${pw}', 'Marcus',   'Johnson',   false, 'recruiter', '${T1}'),
        ('${U_REC2_ACME}',   'recruiter2@acme.com', '${pw}', 'Sofia',    'Rodriguez', false, 'recruiter', '${T1}'),
        ('${U_ADMIN_BRIGHT}','admin@bright.com',    '${pw}', 'James',    'Williams',  false, 'admin',     '${T2}'),
        ('${U_SUPER}',       'super@platform.com',  '${pw}', 'Platform', 'Admin',     false, 'superAdmin', NULL),
        ('${U_ALICE}',       'alice@gmail.com',     '${pw}', 'Alice',    'Baker',     false, 'candidate', NULL),
        ('${U_BOB}',         'bob@gmail.com',       '${pw}', 'Bob',      'Taylor',    false, 'candidate', NULL),
        ('${U_CAROL}',       'carol@gmail.com',     '${pw}', 'Carol',    'Martinez',  false, 'candidate', NULL),
        ('${U_DAN}',         'dan@gmail.com',       '${pw}', 'Dan',      'Lee',       false, 'candidate', NULL),
        ('${U_EMMA}',        'emma@gmail.com',      '${pw}', 'Emma',     'Davis',     false, 'candidate', NULL)
    `);

    // ── 3. Candidate profiles ───────────────────────────────────
    await qr.query(`
      INSERT INTO candidate_profiles (id, years_of_experience, country, city, languages, user_id) VALUES
        ('${CP_ALICE}', 3, 'USA',     'New York', '[{"code":"en","level":"NATIVE"},{"code":"es","level":"B2"}]',                           '${U_ALICE}'),
        ('${CP_BOB}',   5, 'UK',      'London',   '[{"code":"en","level":"NATIVE"},{"code":"fr","level":"A2"}]',                           '${U_BOB}'),
        ('${CP_CAROL}', 1, 'Ukraine', 'Kyiv',     '[{"code":"uk","level":"NATIVE"},{"code":"en","level":"C1"},{"code":"de","level":"B1"}]', '${U_CAROL}'),
        ('${CP_DAN}',   8, 'Germany', 'Berlin',   '[{"code":"de","level":"NATIVE"},{"code":"en","level":"C2"}]',                           '${U_DAN}'),
        ('${CP_EMMA}',  2, 'Canada',  'Toronto',  '[{"code":"en","level":"NATIVE"},{"code":"fr","level":"B1"}]',                           '${U_EMMA}')
    `);

    // ── 4. Vacancies ────────────────────────────────────────────
    await qr.query(`
      INSERT INTO vacancies (id, name, description, min_salary, max_salary, tenant_id, created_by_id, time_commitment, language_requirements, required_years_of_experience, tags, needs_reclustering) VALUES
        ('${V_FRONTEND}', 'Senior Frontend Developer',
         'We are looking for a Senior Frontend Developer with React experience to join our product team.',
         4000, 6000, '${T1}', '${U_REC1_ACME}', 'FULL_TIME',
         '[{"code":"en","level":"B2"}]', 3, '["React","TypeScript","Frontend"]', false),

        ('${V_BACKEND}', 'Junior Backend Developer',
         'Entry-level backend position. Node.js and PostgreSQL knowledge preferred.',
         1500, 2500, '${T1}', '${U_REC1_ACME}', 'FULL_TIME',
         '[{"code":"en","level":"B1"}]', 1, '["Node.js","PostgreSQL","Backend"]', false),

        ('${V_UX}', 'Part-time UX Designer',
         'Looking for a creative UX designer for part-time engagement on multiple projects.',
         2000, 3000, '${T1}', '${U_REC2_ACME}', 'PART_TIME',
         '[{"code":"en","level":"B2"},{"code":"de","level":"A2"}]', 2, '["UX","Figma","Design"]', false)
    `);

    // ── 5. Questions ────────────────────────────────────────────
    await qr.query(`
      INSERT INTO questions (id, tenant_id, label, type, "answerOptions") VALUES
        ('${Q_REACT_EXP}', '${T1}', 'Do you have commercial experience with React?', 'boolean',  NULL),
        ('${Q_EDUCATION}', '${T1}', 'What is your education level?',                  'dropdown', '["High School","Bachelor","Master","PhD"]'),
        ('${Q_PROJECT}',   '${T1}', 'Describe your most challenging project',          'text',     NULL),
        ('${Q_RELOCATE}',  '${T1}', 'Are you willing to relocate?',                   'boolean',  NULL),
        ('${Q_TECH}',      '${T1}', 'Which technologies do you use daily?',           'dropdown', '["React","Angular","Vue","Node.js","Python","Java"]'),
        ('${Q_POSTGRES}',  '${T1}', 'Do you have experience with PostgreSQL?',        'boolean',  NULL)
    `);

    // ── 6. Vacancy–Question links (expectedValue as JSON strings) ──
    await qr.query(`
      INSERT INTO vacancy_questions (vacancy_id, question_id, is_required, priority, expected_value) VALUES
        -- Senior Frontend Developer
        ('${V_FRONTEND}', '${Q_REACT_EXP}', true,  1, '"true"'),
        ('${V_FRONTEND}', '${Q_EDUCATION}', true,  2, '["Bachelor","Master","PhD"]'),
        ('${V_FRONTEND}', '${Q_PROJECT}',   false, 3, NULL),
        ('${V_FRONTEND}', '${Q_TECH}',      true,  1, '["React","TypeScript"]'),
        -- Junior Backend Developer
        ('${V_BACKEND}', '${Q_POSTGRES}',  true,  1, '"true"'),
        ('${V_BACKEND}', '${Q_EDUCATION}', false, 2, '["Bachelor"]'),
        ('${V_BACKEND}', '${Q_PROJECT}',   true,  3, NULL),
        ('${V_BACKEND}', '${Q_RELOCATE}',  false, 2, '"true"'),
        -- Part-time UX Designer
        ('${V_UX}', '${Q_RELOCATE}',  true,  1, '"true"'),
        ('${V_UX}', '${Q_EDUCATION}', true,  2, '["Bachelor","Master"]'),
        ('${V_UX}', '${Q_PROJECT}',   false, 3, NULL)
    `);

    // ── 7. Vacancy submissions ──────────────────────────────────
    await qr.query(`
      INSERT INTO vacancy_submissions (id, comment, vacancy_id, tenant_id, candidate_id, status, tags, match_score, expected_salary) VALUES
        -- Senior Frontend (3 submissions)
        ('${S_ALICE_FE}', 'Experienced React developer with 3 years of commercial work. Built several SPAs and dashboards.',
         '${V_FRONTEND}', '${T1}', '${CP_ALICE}', 'pending', '["React","TypeScript","Frontend"]', 0, 5000),
        ('${S_BOB_FE}', 'Full-stack developer transitioning to frontend. Strong TypeScript skills.',
         '${V_FRONTEND}', '${T1}', '${CP_BOB}', 'pending', '["React","Frontend"]', 0, 5500),
        ('${S_DAN_FE}', 'Senior developer with 8 years of experience across multiple frameworks.',
         '${V_FRONTEND}', '${T1}', '${CP_DAN}', 'pending', '["React","TypeScript","Frontend","Angular"]', 0, 6000),
        -- Junior Backend (2 submissions)
        ('${S_CAROL_BE}', 'Recent graduate eager to learn backend development. Built a small REST API with Node.js.',
         '${V_BACKEND}', '${T1}', '${CP_CAROL}', 'pending', '["Node.js","Backend"]', 0, 1800),
        ('${S_EMMA_BE}', 'Self-taught developer with personal projects using Node.js and PostgreSQL.',
         '${V_BACKEND}', '${T1}', '${CP_EMMA}', 'pending', '["Node.js","PostgreSQL","Backend"]', 0, 2000),
        -- UX Designer (2 submissions)
        ('${S_ALICE_UX}', 'UX designer with a passion for clean interfaces and user research.',
         '${V_UX}', '${T1}', '${CP_ALICE}', 'pending', '["UX","Figma","Design"]', 0, 2500),
        ('${S_BOB_UX}', 'Creative designer with Figma expertise and B2 German.',
         '${V_UX}', '${T1}', '${CP_BOB}', 'pending', '["UX","Design"]', 0, 2800)
    `);

    // ── 8. Submission answers ───────────────────────────────────
    // Using uuid_generate_v4() for answer IDs (no need to reference them)
    await qr.query(`
      INSERT INTO submission_answers (id, submission_id, question_id, value) VALUES
        -- Alice → Senior Frontend
        (uuid_generate_v4(), '${S_ALICE_FE}', '${Q_REACT_EXP}', '"true"'),
        (uuid_generate_v4(), '${S_ALICE_FE}', '${Q_EDUCATION}', '["Bachelor"]'),
        (uuid_generate_v4(), '${S_ALICE_FE}', '${Q_PROJECT}',   '"Built a real-time dashboard for IoT monitoring with React and WebSockets."'),
        (uuid_generate_v4(), '${S_ALICE_FE}', '${Q_TECH}',      '["React","Node.js"]'),
        -- Bob → Senior Frontend
        (uuid_generate_v4(), '${S_BOB_FE}', '${Q_REACT_EXP}', '"true"'),
        (uuid_generate_v4(), '${S_BOB_FE}', '${Q_EDUCATION}', '["Master"]'),
        (uuid_generate_v4(), '${S_BOB_FE}', '${Q_PROJECT}',   '"Migrated a legacy jQuery app to React with zero downtime."'),
        (uuid_generate_v4(), '${S_BOB_FE}', '${Q_TECH}',      '["React","Angular","Vue"]'),
        -- Dan → Senior Frontend
        (uuid_generate_v4(), '${S_DAN_FE}', '${Q_REACT_EXP}', '"true"'),
        (uuid_generate_v4(), '${S_DAN_FE}', '${Q_EDUCATION}', '["PhD"]'),
        (uuid_generate_v4(), '${S_DAN_FE}', '${Q_PROJECT}',   '"Led a team of 5 building a design system used across 12 products."'),
        (uuid_generate_v4(), '${S_DAN_FE}', '${Q_TECH}',      '["React","Angular","Python","Java"]'),
        -- Carol → Junior Backend
        (uuid_generate_v4(), '${S_CAROL_BE}', '${Q_POSTGRES}',  '"true"'),
        (uuid_generate_v4(), '${S_CAROL_BE}', '${Q_EDUCATION}', '["Bachelor"]'),
        (uuid_generate_v4(), '${S_CAROL_BE}', '${Q_PROJECT}',   '"Created a REST API for a university project with Express and PostgreSQL."'),
        (uuid_generate_v4(), '${S_CAROL_BE}', '${Q_RELOCATE}',  '"true"'),
        -- Emma → Junior Backend
        (uuid_generate_v4(), '${S_EMMA_BE}', '${Q_POSTGRES}',  '"false"'),
        (uuid_generate_v4(), '${S_EMMA_BE}', '${Q_EDUCATION}', '["High School"]'),
        (uuid_generate_v4(), '${S_EMMA_BE}', '${Q_PROJECT}',   '"Built a personal budget tracker API with Node.js and MongoDB."'),
        (uuid_generate_v4(), '${S_EMMA_BE}', '${Q_RELOCATE}',  '"false"'),
        -- Alice → UX Designer
        (uuid_generate_v4(), '${S_ALICE_UX}', '${Q_RELOCATE}',  '"true"'),
        (uuid_generate_v4(), '${S_ALICE_UX}', '${Q_EDUCATION}', '["Bachelor"]'),
        (uuid_generate_v4(), '${S_ALICE_UX}', '${Q_PROJECT}',   '"Redesigned the onboarding flow for a fintech app, increasing completion by 40%."'),
        -- Bob → UX Designer
        (uuid_generate_v4(), '${S_BOB_UX}', '${Q_RELOCATE}',  '"true"'),
        (uuid_generate_v4(), '${S_BOB_UX}', '${Q_EDUCATION}', '["Master"]'),
        (uuid_generate_v4(), '${S_BOB_UX}', '${Q_PROJECT}',   '"Conducted user research and A/B testing for an e-commerce platform."')
    `);

    await qr.commitTransaction();
    console.log('Seed completed successfully!');
  } catch (error) {
    await qr.rollbackTransaction();
    console.error('Seed failed:', error);
  } finally {
    await qr.release();
    await ds.destroy();
  }
}

seed();
