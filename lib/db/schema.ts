import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  json,
  int,
  bigint,
  boolean,
  mysqlEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core"
import { relations } from "drizzle-orm"

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
  }),
)

// ============================================================================
// WORKSPACES
// ============================================================================

export const workspaces = mysqlTable(
  "workspaces",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    ownerId: varchar("owner_id", { length: 191 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ownerIdx: index("idx_workspaces_owner").on(table.ownerId),
  }),
)

export const workspaceMembers = mysqlTable(
  "workspace_members",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    workspaceId: varchar("workspace_id", { length: 191 }).notNull(),
    userId: varchar("user_id", { length: 191 }).notNull(),
    role: mysqlEnum("role", ["owner", "admin", "member", "viewer"]).notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("idx_workspace_members_workspace").on(table.workspaceId),
    userIdx: index("idx_workspace_members_user").on(table.userId),
    uniqueMembership: uniqueIndex("unique_workspace_user").on(table.workspaceId, table.userId),
  }),
)

export const workspaceSettings = mysqlTable(
  "workspace_settings",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    workspaceId: varchar("workspace_id", { length: 191 }).notNull().unique(),
    themeMode: mysqlEnum("theme_mode", ["light", "dark"]).default("light").notNull(),
    defaultViewMode: mysqlEnum("default_view_mode", ["design", "code", "both", "preview"]).default("design").notNull(),
    sidebarOpen: boolean("sidebar_open").default(true).notNull(),
    settingsJson: json("settings_json"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("idx_workspace_settings_workspace").on(table.workspaceId),
  }),
)

// ============================================================================
// CHATS & AI CONVERSATIONS
// ============================================================================

export const chats = mysqlTable(
  "chats",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    workspaceId: varchar("workspace_id", { length: 191 }).notNull(),
    userId: varchar("user_id", { length: 191 }).notNull(),
    title: varchar("title", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("idx_chats_workspace").on(table.workspaceId),
    userIdx: index("idx_chats_user").on(table.userId),
    updatedIdx: index("idx_chats_updated").on(table.updatedAt),
  }),
)

export const messages = mysqlTable(
  "messages",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    chatId: varchar("chat_id", { length: 191 }).notNull(),
    role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
    content: text("content").notNull(),
    metadataJson: json("metadata_json"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    chatIdx: index("idx_messages_chat").on(table.chatId),
    createdIdx: index("idx_messages_created").on(table.createdAt),
  }),
)

// ============================================================================
// WORKSPACE CONTENT
// ============================================================================

export const contexts = mysqlTable(
  "contexts",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    workspaceId: varchar("workspace_id", { length: 191 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: mysqlEnum("type", ["text", "image"]).notNull(),
    content: text("content").notNull(),
    link: text("link"),
    mainPrompt: text("main_prompt"),
    referenceIds: json("reference_ids"),
    analysisJson: json("analysis_json"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("idx_contexts_workspace").on(table.workspaceId),
    typeIdx: index("idx_contexts_type").on(table.type),
  }),
)

export const assets = mysqlTable(
  "assets",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    workspaceId: varchar("workspace_id", { length: 191 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: mysqlEnum("type", ["image", "video", "audio", "file"]).notNull(),
    link: text("link").notNull(),
    fileSize: bigint("file_size", { mode: "number" }),
    mimeType: varchar("mime_type", { length: 100 }),
    analysisJson: json("analysis_json"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("idx_assets_workspace").on(table.workspaceId),
    typeIdx: index("idx_assets_type").on(table.type),
  }),
)

export const assetInsights = mysqlTable(
  "asset_insights",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    assetId: varchar("asset_id", { length: 191 }).notNull(),
    text: text("text").notNull(),
    category: mysqlEnum("category", ["quality", "usage", "accessibility", "optimization", "general"]).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    assetIdx: index("idx_asset_insights_asset").on(table.assetId),
    categoryIdx: index("idx_asset_insights_category").on(table.category),
  }),
)

export const styleGuides = mysqlTable(
  "style_guides",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    workspaceId: varchar("workspace_id", { length: 191 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    themeMode: mysqlEnum("theme_mode", ["light", "dark"]).default("light").notNull(),
    colorsJson: json("colors_json").notNull(),
    typographyJson: json("typography_json").notNull(),
    spacing: int("spacing").default(4).notNull(),
    borderRadius: int("border_radius").default(8).notNull(),
    animationsJson: json("animations_json"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("idx_style_guides_workspace").on(table.workspaceId),
  }),
)

export const pages = mysqlTable(
  "pages",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    workspaceId: varchar("workspace_id", { length: 191 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: mysqlEnum("type", ["page", "component", "folder", "data-model", "asset", "style", "ai-generation"]).notNull(),
    icon: varchar("icon", { length: 50 }),
    mainPrompt: text("main_prompt").notNull(),
    referenceIds: json("reference_ids"),
    code: text("code"),
    propsJson: json("props_json"),
    category: mysqlEnum("category", ["ui", "form", "layout", "data", "navigation"]),
    componentSource: mysqlEnum("component_source", ["built-in", "custom"]),
    builtInComponentId: varchar("built_in_component_id", { length: 191 }),
    stylingJson: json("styling_json"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("idx_pages_workspace").on(table.workspaceId),
    typeIdx: index("idx_pages_type").on(table.type),
    categoryIdx: index("idx_pages_category").on(table.category),
  }),
)

export const components = mysqlTable(
  "components",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    workspaceId: varchar("workspace_id", { length: 191 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    mainPrompt: text("main_prompt").notNull(),
    referenceIds: json("reference_ids"),
    code: text("code"),
    propsJson: json("props_json"),
    stylePropsMapJson: json("style_props_map_json"),
    category: mysqlEnum("category", ["ui", "form", "layout", "data", "navigation"]),
    componentSource: mysqlEnum("component_source", ["built-in", "custom"]),
    builtInComponentId: varchar("built_in_component_id", { length: 191 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("idx_components_workspace").on(table.workspaceId),
    categoryIdx: index("idx_components_category").on(table.category),
  }),
)

export const templates = mysqlTable(
  "templates",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    workspaceId: varchar("workspace_id", { length: 191 }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: mysqlEnum("category", ["page", "component", "layout", "feature"]).notNull(),
    mainPrompt: text("main_prompt").notNull(),
    referenceIds: json("reference_ids"),
    previewImage: text("preview_image"),
    tagsJson: json("tags_json"),
    isPublic: boolean("is_public").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("idx_templates_workspace").on(table.workspaceId),
    categoryIdx: index("idx_templates_category").on(table.category),
    publicIdx: index("idx_templates_public").on(table.isPublic),
  }),
)

// ============================================================================
// VERSION CONTROL
// ============================================================================

export const specVersions = mysqlTable(
  "spec_versions",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    specType: mysqlEnum("spec_type", ["context", "asset", "style_guide", "page", "component", "template"]).notNull(),
    specId: varchar("spec_id", { length: 191 }).notNull(),
    workspaceId: varchar("workspace_id", { length: 191 }).notNull(),
    versionNumber: int("version_number").notNull(),
    stateJson: json("state_json").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    specIdx: index("idx_spec_versions_spec").on(table.specType, table.specId),
    workspaceIdx: index("idx_spec_versions_workspace").on(table.workspaceId),
    uniqueVersion: uniqueIndex("unique_spec_version").on(table.specType, table.specId, table.versionNumber),
  }),
)

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  ownedWorkspaces: many(workspaces),
  workspaceMemberships: many(workspaceMembers),
  chats: many(chats),
}))

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  members: many(workspaceMembers),
  settings: one(workspaceSettings),
  chats: many(chats),
  contexts: many(contexts),
  assets: many(assets),
  styleGuides: many(styleGuides),
  pages: many(pages),
  components: many(components),
  templates: many(templates),
  specVersions: many(specVersions),
}))

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id],
  }),
}))

export const workspaceSettingsRelations = relations(workspaceSettings, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceSettings.workspaceId],
    references: [workspaces.id],
  }),
}))

export const chatsRelations = relations(chats, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [chats.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
  messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}))

export const contextsRelations = relations(contexts, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [contexts.workspaceId],
    references: [workspaces.id],
  }),
}))

export const assetsRelations = relations(assets, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [assets.workspaceId],
    references: [workspaces.id],
  }),
  insights: many(assetInsights),
}))

export const assetInsightsRelations = relations(assetInsights, ({ one }) => ({
  asset: one(assets, {
    fields: [assetInsights.assetId],
    references: [assets.id],
  }),
}))

export const styleGuidesRelations = relations(styleGuides, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [styleGuides.workspaceId],
    references: [workspaces.id],
  }),
}))

export const pagesRelations = relations(pages, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [pages.workspaceId],
    references: [workspaces.id],
  }),
}))

export const componentsRelations = relations(components, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [components.workspaceId],
    references: [workspaces.id],
  }),
}))

export const templatesRelations = relations(templates, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [templates.workspaceId],
    references: [workspaces.id],
  }),
}))

export const specVersionsRelations = relations(specVersions, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [specVersions.workspaceId],
    references: [workspaces.id],
  }),
}))
