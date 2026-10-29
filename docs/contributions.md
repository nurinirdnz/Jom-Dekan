# Detailed contributions: Nurin Irdina

A full breakdown of my work on JomDekan. For the summary, see the [README](../README.md#my-contributions).

## Project foundation and integration

- Established and maintained JomDekan’s project foundation, development environment, database workflow, Docker configuration, technical documentation, and CI pipeline.
- Wrote the initial database schema (users, sessions, and academic taxonomy) together with the migration and seed runners; each team member then added migrations for their own features.
- Integrated and stabilized teammates’ work across forums, favourites, tutoring, freelance listings, notifications, moderation, analytics, user management, and audit logs by resolving merge conflicts and fixing cross-feature issues.
- Fixed TypeScript configuration, merge conflicts, broken CI checks, UI regressions, modal positioning, and cross-feature integration issues.
- Set up branch protection on `main`, requiring frontend and backend CI checks to pass before any pull request can be merged.
- Wrote the recruiter-facing documentation, including the screenshot-based feature tour and the summary of features without screenshots in the README.

## Authentication, data model, and academic taxonomy

- Built the first version of authentication: registration, login, JWT access tokens, and rotating, hashed refresh sessions with reuse detection. Teammates later extended it with password-strength checks, email delivery, and login lockout.
- Built the first version of the academic taxonomy (universities, faculties, programmes, subjects) and later improved authorization, validation, session behaviour, university-scoped subjects, self-service taxonomy requests, and admin workflows alongside teammates’ additions.

## Academic resources and AI

- Rebuilt resource browsing and filtering, and enhanced the upload and resource-detail pages (originally built by Nurul Syafiqah) with categories, file previews, favourites, reporting, and responsive layouts.
- Created the Admin Resources page, including resource inspection, searching, management actions, archive controls, and loading states.
- Added live resource-card previews: rendered first pages for PDFs and first-row table previews for Excel spreadsheets, with fallback states when a preview fails or times out.
- Built AI-powered resource summaries, multi-file source selection, document processing, generated study materials, and the “Ask This Resource” assistant.
- Added safe markdown rendering for AI assistant answers (formatted lists and emphasis, with raw HTML disabled).
- Added orphaned-resource-file detection and improved storage consistency and cleanup.

## Reporting, moderation, and notifications

- Developed the reporting system across resources, discussions, comments, users, tutoring listings, and freelance opportunities, including screenshot evidence and report-status handling.
- Substantially enhanced the team-built moderation system with complete reported-content previews, direct content access, decision workflows, response templates, notifications, and clearer administrator review experiences.
- Created the Admin Notifications page and improved the broader team-built notification experience with popovers, unread states, filtering, presentation rules, moderation updates, and administrative announcements.

## Tutoring and freelance marketplace

- Enhanced team-built tutoring with self-service applications, résumé uploads, subject selection, cross-university availability, session modes, contact details, bookings, and improved administrator review.
- Created the initial admin interface for freelance-opportunity management and later improved its workflows, usability, loading states, and dark-mode support.

## Administration

- Enhanced existing admin analytics, user-management, tutor-application, listing, and audit-log interfaces without claiming ownership of their original implementations.
- Improved audit-log usefulness by reconstructing clearer action details for administrators.

## Design system, dark mode, and accessibility

- Redesigned major parts of the student portal, including the dashboard, navigation, profile, marketplace, loading states, empty states, responsiveness, and reusable UI components.
- Built and documented reusable design-system components for cards, forms, controls, status displays, dialogs, navigation, and overlays.
- Implemented and refined platform-wide dark mode and accessibility, correcting contrast, hover, focus, selected, disabled, error, warning, and success states across student and administrator interfaces.

## Security

- Strengthened security with Redis-backed rate limiting, configurable ClamAV scanning, infected-file rejection, secure uploads, and nested storage handling, and extended file-signature validation to every upload path.
- Enabled Row-Level Security on all public database tables.
- Upgraded the spreadsheet parser (SheetJS) to a patched release to avoid known vulnerabilities when parsing user-uploaded files.

## Testing

- Added extensive frontend, backend, AI, notification, moderation, integration, upload-security, and regression tests.
