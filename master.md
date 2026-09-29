# MUSIC ARCHIVE PLATFORM — MASTER DEVELOPMENT PROMPT

## 1. Project Overview

Build a cross-platform digital music archive platform focused on **archiving, documenting, discovering, and listening to finished music works**.

The platform is NOT intended to be a Spotify clone, DAW, collaborative music-production platform, or music marketplace.

Its primary purpose is:

> To provide musicians with a structured digital archive for their finished music works, including audio, artwork, metadata, credits, and project information, while allowing audiences to discover and listen to those works through a mobile application.

The system has 3 user roles:

1. **Super Admin**
2. **Musician**
3. **Audience / Listener**

There are 2 client platforms:

- **Web application** → Super Admin + Musician
- **Mobile application** → Audience

All clients communicate with a centralized backend API.

---

# 2. Core Product Concept

The central entity of the platform is a **Work / Music Work**.

One Work represents **one finished/final song**.

A Work consists of:

- Audio file
- Artwork / cover
- Basic metadata
- Production credits
- Optional lyrics
- Optional project/album association
- Optional version label

The system should treat the Work as the main archival object.

Do NOT treat the audio file itself as the primary entity.

Example:

### Work

Title:
"Pulang"

Artist:
"Suara Senja"

Created:
12 January 2026

Released:
25 January 2026

Genre:
Alternative Rock

Duration:
04:32

Composer:
A

Lyricist:
B

Producer:
C

Recording:
Studio X

Version:
Final 3

Project:
Album Rumah

---

# 3. Important Business Rules

Implement the following rules exactly.

### Work rules

- A Work represents a finished/final song.
- Musicians upload finished works.
- Audiences only see/listen to the final published work.
- All published works are automatically public.
- There is no private work mode in the MVP.
- One Work belongs to exactly one Musician account.
- A Work can optionally belong to a Project.
- A Project can contain multiple Works.
- A Work can exist without a Project.
- Versioning is OPTIONAL.
- Versioning is primarily a metadata field such as "Final", "Final 2", "Final 3".
- Do NOT implement complex multi-file version history in the MVP.
- Do NOT require approval from Super Admin before publication.
- Super Admin can moderate/remove content after publication.

### Credits

The Musician owning the Work is the account responsible for the archived Work.

However, the Work may contain credits for other people.

For example:

Artist:
Suara Senja

Composer:
A

Lyricist:
B

Producer:
C

Recording:
Studio X

These credited people do NOT need to have platform accounts.

Credits can initially be stored as text fields.

---

# 4. User Roles

## 4.1 SUPER ADMIN

Super Admin can only use the WEB application.

Main responsibilities:

- Manage users
- Manage musicians
- Manage works
- Manage genres
- Moderate content
- Handle reports
- View platform statistics
- Manage basic platform settings

Super Admin should NOT create music works on behalf of musicians in the normal workflow.

---

## 4.2 MUSICIAN

Musicians can only use the WEB application.

Main responsibilities:

- Manage profile
- Create works
- Upload audio
- Upload artwork
- Enter metadata
- Enter credits
- Add lyrics
- Associate work with a project
- Edit existing works
- Delete own works
- Manage projects
- View their own archive

Musicians should have a dedicated dashboard.

---

## 4.3 AUDIENCE

Audience users can only use the MOBILE application.

Main responsibilities:

- Discover works
- Search works
- Browse genres
- Browse musicians
- View work details
- Listen to audio
- Favorite works
- View musician profiles

Optional features for later versions:

- Follow musicians
- Playlists
- Listening history
- Comments
- Notifications
- Sharing

Do NOT make these optional features part of the MVP unless necessary.

---

# 5. WEB APPLICATION

The Web application serves both Super Admin and Musician users.

Use role-based access control to show different dashboards.

## Musician Web Navigation

Suggested navigation:

- Dashboard
- My Works
- Add Work
- Projects
- Profile

### Musician Dashboard

Display:

- Total works
- Total projects
- Recently added works
- Recently updated works

Example:

```text
MY ARCHIVE

Total Works: 12
Projects: 4

Recent Works

Pulang
Alternative Rock
2026

Malam
Indie
2026

Jalan
Alternative
2025
```

---

# 6. CREATE WORK FLOW

Create a clean form for adding a new Work.

Fields:

### Required

- Title
- Audio file
- Artist
- Genre
- Created date
- Released date

### Optional

- Artwork
- Composer
- Lyricist
- Producer
- Recording
- Version
- Project
- Lyrics

Suggested form:

```text
CREATE NEW WORK

Title
[________________________]

Audio
[ Upload Audio ]

Artwork
[ Upload Artwork ]

Artist
[________________________]

Genre
[ Select Genre ]

Created Date
[ DD/MM/YYYY ]

Released Date
[ DD/MM/YYYY ]

Composer
[________________________]

Lyricist
[________________________]

Producer
[________________________]

Recording
[________________________]

Version
[________________________]

Project
[ Select Project ]

Lyrics
[________________________]

[ SAVE & PUBLISH ]
```

After successful submission:

1. Validate data.
2. Upload audio to object/file storage.
3. Upload artwork if provided.
4. Save metadata to PostgreSQL.
5. Generate the public Work record.
6. Make the Work immediately available to the Audience mobile application.

---

# 7. WORK DETAIL PAGE — WEB

Musicians should be able to view their archived Work.

Display:

- Artwork
- Title
- Artist
- Audio player
- Genre
- Created date
- Released date
- Duration
- Composer
- Lyricist
- Producer
- Recording
- Version
- Project
- Lyrics

Provide:

- Edit
- Delete

---

# 8. PROJECT / ALBUM

A Project is a collection of Works.

Example:

```text
PROJECT
Album Rumah

1. Pulang
2. Rumah
3. Malam
4. Jalan
```

Project fields:

- Title
- Description
- Artwork
- Created date
- Release date

A Work may belong to zero or one Project.

A Project may contain many Works.

---

# 9. SUPER ADMIN WEB

Create a separate Admin Dashboard.

Navigation:

- Dashboard
- Users
- Musicians
- Works
- Genres
- Reports
- Settings

Dashboard statistics:

```text
TOTAL USERS
TOTAL MUSICIANS
TOTAL AUDIENCES
TOTAL WORKS
TOTAL PROJECTS
TOTAL REPORTS
```

Admin can:

### Users

- View users
- Search users
- Filter by role
- Suspend users
- Delete users

### Works

- View all works
- Search works
- Filter by genre
- View work details
- Remove inappropriate works

### Genres

- Create genre
- Edit genre
- Delete genre

### Reports

- View reported content
- Review report
- Take moderation action

---

# 10. MOBILE APPLICATION

The Mobile application is exclusively for Audience users.

Design the mobile application around:

> DISCOVER → LISTEN → EXPLORE

Suggested bottom navigation:

```text
Home
Search
Library
Profile
```

---

# 11. MOBILE HOME

Home should contain:

- Featured/latest works
- Recently released works
- Popular works
- Genre categories
- Recommended discovery sections

Keep recommendation logic simple in MVP.

Do NOT implement complex AI recommendation algorithms.

---

# 12. SEARCH

Users should be able to search:

- Work title
- Artist / Musician
- Genre
- Project

Example:

```text
Search

[ Pulang________________ ]

Results

Pulang
Suara Senja
Alternative Rock
```

Search should be fast and support partial matching.

---

# 13. WORK DETAIL — MOBILE

Example:

```text
[ COVER ART ]

PULANG
Suara Senja

▶ ━━━━━━━━━━━━━━━

Alternative Rock

Created
12 January 2026

Released
25 January 2026

Project
Album Rumah

Credits

Composer
A

Lyricist
B

Producer
C

Recording
Studio X

Lyrics
...
```

Actions:

- Play
- Pause
- Favorite

---

# 14. MUSICIAN PROFILE — MOBILE

Display:

- Profile image
- Musician name
- Bio
- Genre
- Published works
- Projects

Example:

```text
SUARA SENJA

Alternative Rock

About
...

Works

Pulang
Malam
Rumah
Jalan
```

---

# 15. DATA MODEL

Use PostgreSQL as the primary relational database.

Suggested entities:

```text
User
MusicianProfile
AudienceProfile
Work
Project
Genre
Favorite
Report
```

Potential relationships:

```text
User
 │
 ├── MusicianProfile
 │       │
 │       ├── Work
 │       │    │
 │       │    └── Project
 │       │
 │       └── Project
 │
 └── AudienceProfile
        │
        └── Favorite

Genre
 │
 └── Work

Work
 │
 └── Report
```

---

# 16. IMPORTANT DATABASE PRINCIPLE

Do NOT store large audio files directly inside PostgreSQL.

PostgreSQL should store:

- Metadata
- User information
- Relationships
- File URLs / storage keys

Audio and artwork should be stored in object/file storage.

Example:

```text
PostgreSQL

works
--------------------------------
id
musician_id
project_id
genre_id
title
artist
created_at
released_at
duration
composer
lyricist
producer
recording
version
audio_url
artwork_url
lyrics
created_timestamp
updated_timestamp
```

Object storage:

```text
/music/
    /musician_id/
        /work_id/
            audio.ext
            artwork.ext
```

Use secure file URLs or signed URLs where appropriate.

---

# 17. API ARCHITECTURE

Both clients must communicate with the backend through an API.

Architecture:

```text
WEB
 │
 ├── Super Admin
 └── Musician
       │
       ▼
     REST API
       │
       ▼
    BACKEND
       │
       ├── PostgreSQL
       │
       └── Object Storage


MOBILE
 │
 └── Audience
       │
       ▼
     REST API
       │
       ▼
    BACKEND
```

Do not allow clients to directly manipulate the PostgreSQL database.

Implement authentication and authorization at the backend.

---

# 18. AUTHENTICATION

Implement:

- Registration
- Login
- Logout
- Password hashing
- Password reset
- Session/token authentication

Roles:

```text
SUPER_ADMIN
MUSICIAN
AUDIENCE
```

Implement role-based authorization.

Rules:

```text
SUPER_ADMIN → WEB
MUSICIAN    → WEB
AUDIENCE    → MOBILE
```

The backend must enforce permissions even if a client attempts unauthorized API requests.

---

# 19. AUDIO HANDLING

The platform is an archive/listening platform.

Support common audio formats such as:

- MP3
- WAV
- FLAC
- M4A

If necessary, normalize or transcode audio for mobile playback.

Store audio metadata:

- Duration
- File size
- Format
- Bitrate if available

The audio player should support:

- Play
- Pause
- Seek
- Progress
- Duration
- Volume

On mobile, provide a persistent mini-player where practical.

---

# 20. DESIGN DIRECTION

The visual identity should feel like a combination of:

- Digital music archive
- Modern media library
- Editorial archive
- Contemporary music platform

Avoid making it look like a generic Spotify clone.

The design should emphasize:

- Artwork
- Typography
- Metadata
- Musician identity
- Archive structure

Use a clean modern interface with strong visual hierarchy.

### Web

Prioritize:

- Efficient dashboards
- Tables
- Forms
- Metadata
- File management
- Desktop workflows

### Mobile

Prioritize:

- Artwork
- Music discovery
- Large touch targets
- Simple navigation
- Audio playback
- Smooth scrolling

Responsive behavior should be implemented appropriately for each platform.

---

# 21. MVP SCOPE

The MVP MUST focus on these features.

### Super Admin Web

- Login
- Dashboard
- User management
- Musician management
- Work management
- Genre management
- Content moderation
- Reports

### Musician Web

- Register/login
- Profile
- Dashboard
- Create Work
- Upload audio
- Upload artwork
- Metadata
- Credits
- Project
- Edit Work
- Delete Work
- View own archive

### Audience Mobile

- Register/login
- Home
- Search
- Genre browsing
- Musician browsing
- Work detail
- Audio player
- Musician profile
- Favorite

---

# 22. FEATURES NOT REQUIRED FOR MVP

Do NOT implement these unless specifically requested:

- Music production tools
- DAW
- Collaborative editing
- Real-time collaboration
- Complex version control
- Music licensing
- Monetization
- Royalty system
- Subscription
- Marketplace
- AI recommendation
- AI music generation
- Live streaming
- Chat
- Messaging
- Advanced social network
- Complex comments
- Copyright management system
- Multi-musician ownership of a Work

Keep the MVP focused.

---

# 23. DEVELOPMENT PRINCIPLES

Build the system incrementally.

Do not generate an unnecessarily complex architecture.

Prioritize:

1. Correct data model
2. Authentication
3. Role-based authorization
4. Work creation
5. File upload
6. Work discovery
7. Audio playback
8. Search
9. Moderation

Use clean separation between:

```text
Frontend
Backend
Database
File Storage
Authentication
```

Use reusable components and services.

Validate all input on both frontend and backend.

Handle:

- Loading states
- Empty states
- Upload progress
- Upload errors
- API errors
- Authentication errors
- Invalid files
- Missing metadata

Provide useful error messages.

---

# 24. EXPECTED OUTPUT

Before writing the full implementation, produce:

1. System architecture
2. Feature/module breakdown
3. User flow for each role
4. Database ERD
5. Database schema
6. API endpoint specification
7. Authentication/authorization design
8. File storage architecture
9. Web information architecture
10. Mobile information architecture
11. MVP implementation plan

Then implement the system incrementally.

Do not skip architecture and immediately generate random UI/code.

The final system should be maintainable, scalable, and suitable as an academic software engineering project while keeping the MVP scope controlled.

---

# 25. Core Product Statement

The entire implementation should remain aligned with this principle:

> **This platform is a digital archive for finished music works. Musicians use the web application to document and publish their works, Super Admin manages the platform through the web application, and audiences use the mobile application to discover and listen to those works.**
