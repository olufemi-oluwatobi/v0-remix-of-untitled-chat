# Database Schema Specification

This document outlines the complete database schema for the Research Workspace application using Drizzle ORM with PlanetScale (MySQL).

## Overview

The application uses a **local-first architecture** where data is stored in Zustand stores and synced to the database. This ensures fast UI interactions while maintaining data persistence.

## Core Entities

### 1. Users & Authentication

#### `users`
Primary user accounts and authentication data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(191) | PRIMARY KEY | Unique user identifier (UUID) |
| email | varchar(255) | UNIQUE, NOT NULL | User email address |
| name | varchar(255) | NULL | User display name |
| avatar_url | text | NULL | Profile picture URL |
| created_at | timestamp | DEFAULT NOW() | Account creation timestamp |
| updated_at | timestamp | DEFAULT NOW() ON UPDATE | Last update timestamp |

**Indexes:**
- `idx_users_email` on `email`

---

### 2. Workspaces

#### `workspaces`
Individual workspace containers for organizing projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(191) | PRIMARY KEY | Unique workspace identifier (UUID) |
| name | varchar(255) | NOT NULL | Workspace name |
| description | text | NULL | Workspace description |
| owner_id | varchar(191) | NOT NULL, FK → users.id | Workspace owner |
| created_at | timestamp | DEFAULT NOW() | Creation timestamp |
| updated_at | timestamp | DEFAULT NOW() ON UPDATE | Last update timestamp |

**Indexes:**
- `idx_workspaces_owner` on `owner_id`

---

#### `workspace_members`
Multi-workspace support with role-based access.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(191) | PRIMARY KEY | Unique membership identifier |
| workspace_id | varchar(191) | NOT NULL, FK → workspaces.id | Associated workspace |
| user_id | varchar(191) | NOT NULL, FK → users.id | Member user |
| role | enum('owner', 'admin', 'member', 'viewer') | NOT NULL | Access level |
| joined_at | timestamp | DEFAULT NOW() | When user joined workspace |

**Indexes:**
- `idx_workspace_members_workspace` on `workspace_id`
- `idx_workspace_members_user` on `user_id`
- UNIQUE constraint on `(workspace_id, user_id)`

---

#### `workspace_settings`
Workspace-specific configuration and preferences.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(191) | PRIMARY KEY | Unique settings identifier |
| workspace_id | varchar(191) | UNIQUE, NOT NULL, FK → workspaces.id | Associated workspace |
| theme_mode | enum('light', 'dark') | DEFAULT 'light' | UI theme preference |
| default_view_mode | enum('design', 'code', 'both', 'preview') | DEFAULT 'design' | Default canvas view |
| sidebar_open | boolean | DEFAULT true | Sidebar visibility state |
| settings_json | json | NULL | Additional settings as JSON |
| created_at | timestamp | DEFAULT NOW() | Creation timestamp |
| updated_at | timestamp | DEFAULT NOW() ON UPDATE | Last update timestamp |

**Indexes:**
- `idx_workspace_settings_workspace` on `workspace_id`

---

### 3. Chats & AI Conversations

#### `chats`
AI conversation threads within workspaces.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(191) | PRIMARY KEY | Unique chat identifier (UUID) |
| workspace_id | varchar(191) | NOT NULL, FK → workspaces.id | Associated workspace |
| user_id | varchar(191) | NOT NULL, FK → users.id | Chat creator |
| title | varchar(255) | NULL | Chat title (auto-generated or custom) |
| created_at | timestamp | DEFAULT NOW() | Chat creation timestamp |
| updated_at | timestamp | DEFAULT NOW() ON UPDATE | Last message timestamp |

**Indexes:**
- `idx_chats_workspace` on `workspace_id`
- `idx_chats_user` on `user_id`
- `idx_chats_updated` on `updated_at` (for sorting)

---

#### `messages`
Individual messages within chat conversations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(191) | PRIMARY KEY | Unique message identifier (UUID) |
| chat_id | varchar(191) | NOT NULL, FK → chats.id | Parent chat |
| role | enum('user', 'assistant', 'system') | NOT NULL | Message sender type |
| content | text | NOT NULL | Message content |
| metadata_json | json | NULL | Additional metadata (tokens, model, etc.) |
| created_at | timestamp | DEFAULT NOW() | Message timestamp |

**Indexes:**
- `idx_messages_chat` on `chat_id`
- `idx_messages_created` on `created_at` (for ordering)

---

### 4. Workspace Content

#### `contexts`
Context items (text, images) for AI reference.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(191) | PRIMARY KEY | Unique context identifier (UUID) |
| workspace_id | varchar(191) | NOT NULL, FK → workspaces.id | Associated workspace |
| name | varchar(255) | NOT NULL | Context name |
| type | enum('text', 'image') | NOT NULL | Content type |
| content | text | NOT NULL | Text content or image URL |
| link | text | NULL | Optional external link |
| main_prompt | text | NULL | Associated prompt |
| reference_ids | json | NULL | Array of referenced spec IDs |
| analysis_json | json | NULL | AI analysis data |
| created_at | timestamp | DEFAULT NOW() | Creation timestamp |
| updated_at | timestamp | DEFAULT NOW() ON UPDATE | Last update timestamp |

**Indexes:**
- `idx_contexts_workspace` on `workspace_id`
- `idx_contexts_type` on `type`

---

#### `assets`
Media assets (images, videos, files).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(191) | PRIMARY KEY | Unique asset identifier (UUID) |
| workspace_id | varchar(191) | NOT NULL, FK → workspaces.id | Associated workspace |
| name | varchar(255) | NOT NULL | Asset name |
| type | enum('image', 'video', 'audio', 'file') | NOT NULL | Asset type |
| link | text | NOT NULL | Asset URL/path |
| file_size | bigint | NULL | File size in bytes |
| mime_type | varchar(100) | NULL | MIME type |
| analysis_json | json | NULL | AI analysis data |
| created_at | timestamp | DEFAULT NOW() | Upload timestamp |
| updated_at | timestamp | DEFAULT NOW() ON UPDATE | Last update timestamp |

**Indexes:**
- `idx_assets_workspace` on `workspace_id`
- `idx_assets_type` on `type`

---

#### `asset_insights`
AI-generated insights for assets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(191) | PRIMARY KEY | Unique insight identifier (UUID) |
| asset_id | varchar(191) | NOT NULL, FK → assets.id | Associated asset |
| text | text | NOT NULL | Insight content |
| category | enum('quality', 'usage', 'accessibility', 'optimization', 'general') | NOT NULL | Insight category |
| created_at | timestamp | DEFAULT NOW() | Generation timestamp |

**Indexes:**
- `idx_asset_insights_asset` on `asset_id`
- `idx_asset_insights_category` on `category`

---

#### `style_guides`
Design system and style specifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(191) | PRIMARY KEY | Unique style guide identifier (UUID) |
| workspace_id | varchar(191) | NOT NULL, FK → workspaces.id | Associated workspace |
| name | varchar(255) | NOT NULL | Style guide name |
| theme_mode | enum('light', 'dark') | DEFAULT 'light' | Active theme mode |
| colors_json | json | NOT NULL | Color palette (light/dark/custom) |
| typography_json | json | NOT NULL | Font families |
| spacing | int | DEFAULT 4 | Base spacing unit |
| border_radius | int | DEFAULT 8 | Base border radius |
| animations_json | json | NULL | Animation configurations |
| created_at | timestamp | DEFAULT NOW() | Creation timestamp |
| updated_at | timestamp | DEFAULT NOW() ON UPDATE | Last update timestamp |

**Indexes:**
- `idx_style_guides_workspace` on `workspace_id`

---

#### `pages`
Page and component specifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(191) | PRIMARY KEY | Unique page identifier (UUID) |
| workspace_id | varchar(191) | NOT NULL, FK → workspaces.id | Associated workspace |
| name | varchar(255) | NOT NULL | Page/component name |
| type | enum('page', 'component', 'folder', 'data-model', 'asset', 'style', 'ai-generation') | NOT NULL | Item type |
| icon | varchar(50) | NULL | Icon identifier |
| main_prompt | text | NOT NULL | Generation prompt |
| reference_ids | json | NULL | Referenced spec IDs |
| code | text | NULL | Generated code |
| props_json | json | NULL | Component props |
| category | enum('ui', 'form', 'layout', 'data', 'navigation') | NULL | Component category |
| component_source | enum('built-in', 'custom') | NULL | Component source |
| built_in_component_id | varchar(191) | NULL | Built-in component reference |
| styling_json | json | NULL | Style overrides |
| created_at | timestamp | DEFAULT NOW() | Creation timestamp |
| updated_at | timestamp | DEFAULT NOW() ON UPDATE | Last update timestamp |

**Indexes:**
- `idx_pages_workspace` on `workspace_id`
- `idx_pages_type` on `type`
- `idx_pages_category` on `category`

---

#### `components`
Reusable component specifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(191) | PRIMARY KEY | Unique component identifier (UUID) |
| workspace_id | varchar(191) | NOT NULL, FK → workspaces.id | Associated workspace |
| name | varchar(255) | NOT NULL | Component name |
| main_prompt | text | NOT NULL | Generation prompt |
| reference_ids | json | NULL | Referenced spec IDs |
| code | text | NULL | Component code |
| props_json | json | NULL | Component props |
| style_props_map_json | json | NULL | Style property mappings |
| category | enum('ui', 'form', 'layout', 'data', 'navigation') | NULL | Component category |
| component_source | enum('built-in', 'custom') | NULL | Component source |
| built_in_component_id | varchar(191) | NULL | Built-in component reference |
| created_at | timestamp | DEFAULT NOW() | Creation timestamp |
| updated_at | timestamp | DEFAULT NOW() ON UPDATE | Last update timestamp |

**Indexes:**
- `idx_components_workspace` on `workspace_id`
- `idx_components_category` on `category`

---

#### `templates`
Reusable templates for pages and components.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(191) | PRIMARY KEY | Unique template identifier (UUID) |
| workspace_id | varchar(191) | NULL, FK → workspaces.id | Associated workspace (NULL for global) |
| name | varchar(255) | NOT NULL | Template name |
| description | text | NULL | Template description |
| category | enum('page', 'component', 'layout', 'feature') | NOT NULL | Template category |
| main_prompt | text | NOT NULL | Generation prompt |
| reference_ids | json | NULL | Referenced spec IDs |
| preview_image | text | NULL | Preview image URL |
| tags_json | json | NULL | Template tags |
| is_public | boolean | DEFAULT false | Public template flag |
| created_at | timestamp | DEFAULT NOW() | Creation timestamp |
| updated_at | timestamp | DEFAULT NOW() ON UPDATE | Last update timestamp |

**Indexes:**
- `idx_templates_workspace` on `workspace_id`
- `idx_templates_category` on `category`
- `idx_templates_public` on `is_public`

---

### 5. Version Control

#### `spec_versions`
Version history for all specifications (contexts, assets, pages, components, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(191) | PRIMARY KEY | Unique version identifier (UUID) |
| spec_type | enum('context', 'asset', 'style_guide', 'page', 'component', 'template') | NOT NULL | Type of spec |
| spec_id | varchar(191) | NOT NULL | ID of the spec |
| workspace_id | varchar(191) | NOT NULL, FK → workspaces.id | Associated workspace |
| version_number | int | NOT NULL | Sequential version number |
| state_json | json | NOT NULL | Complete state snapshot |
| created_at | timestamp | DEFAULT NOW() | Version creation timestamp |

**Indexes:**
- `idx_spec_versions_spec` on `(spec_type, spec_id)`
- `idx_spec_versions_workspace` on `workspace_id`
- UNIQUE constraint on `(spec_type, spec_id, version_number)`

---

## Relationships

\`\`\`
users
  ├─→ workspaces (owner_id)
  ├─→ workspace_members (user_id)
  └─→ chats (user_id)

workspaces
  ├─→ workspace_members (workspace_id)
  ├─→ workspace_settings (workspace_id)
  ├─→ chats (workspace_id)
  ├─→ contexts (workspace_id)
  ├─→ assets (workspace_id)
  ├─→ style_guides (workspace_id)
  ├─→ pages (workspace_id)
  ├─→ components (workspace_id)
  ├─→ templates (workspace_id)
  └─→ spec_versions (workspace_id)

chats
  └─→ messages (chat_id)

assets
  └─→ asset_insights (asset_id)
\`\`\`

---

## Data Flow: Local-First Architecture

### Write Operations
1. User action triggers Zustand store update (immediate UI update)
2. Store action dispatches background sync to database
3. Database write happens asynchronously
4. On success, update sync status; on failure, queue for retry

### Read Operations
1. Initial load: Fetch from database → populate Zustand stores
2. Subsequent reads: Always from Zustand (instant)
3. Background sync: Periodic checks for updates from other users/devices

### Sync Strategy
- **Optimistic updates**: UI updates immediately, database syncs in background
- **Conflict resolution**: Last-write-wins with timestamp comparison
- **Offline support**: Queue operations when offline, sync when reconnected
- **Version control**: Use `spec_versions` table for undo/redo and history

---

## Migration Strategy

### Phase 1: Schema Setup
1. Create all tables with proper indexes
2. Set up foreign key constraints
3. Add initial seed data (default workspace, style guide)

### Phase 2: Local Development
1. Use local PlanetScale database or MySQL
2. Test all CRUD operations
3. Implement sync logic

### Phase 3: Production Deployment
1. Run migrations on production PlanetScale
2. Enable connection pooling
3. Monitor query performance

---

## Security Considerations

1. **Row-Level Security**: Implement workspace-level access control in application layer
2. **User Isolation**: All queries filtered by workspace membership
3. **API Keys**: Store sensitive keys in environment variables, never in database
4. **Input Validation**: Sanitize all user inputs before database writes
5. **Rate Limiting**: Implement rate limits on API endpoints

---

## Performance Optimizations

1. **Indexes**: All foreign keys and frequently queried columns indexed
2. **JSON Columns**: Use for flexible schema (colors, props, metadata)
3. **Connection Pooling**: Use Drizzle's connection pooling for PlanetScale
4. **Caching**: Zustand stores act as in-memory cache
5. **Pagination**: Implement cursor-based pagination for large datasets

---

## Future Enhancements

- [ ] Real-time collaboration using WebSockets
- [ ] Full-text search on content fields
- [ ] Audit logs for compliance
- [ ] Data export/import functionality
- [ ] Workspace templates and cloning
