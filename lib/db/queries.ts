import { db, schema } from "./index"
import { eq, desc } from "drizzle-orm"
import type { Context, Asset, StyleGuide, Page, Component } from "@/lib/store/use-workspace-store"

// ============================================================================
// WORKSPACE QUERIES
// ============================================================================

export async function getWorkspaceById(workspaceId: string) {
  const [workspace] = await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, workspaceId)).limit(1)

  return workspace
}

export async function getUserWorkspaces(userId: string) {
  const workspaces = await db
    .select({
      id: schema.workspaces.id,
      name: schema.workspaces.name,
      description: schema.workspaces.description,
      role: schema.workspaceMembers.role,
      createdAt: schema.workspaces.createdAt,
      updatedAt: schema.workspaces.updatedAt,
    })
    .from(schema.workspaces)
    .innerJoin(schema.workspaceMembers, eq(schema.workspaces.id, schema.workspaceMembers.workspaceId))
    .where(eq(schema.workspaceMembers.userId, userId))
    .orderBy(desc(schema.workspaces.updatedAt))

  return workspaces
}

export async function createWorkspace(data: {
  id: string
  name: string
  description?: string
  ownerId: string
}) {
  await db.transaction(async (tx) => {
    // Create workspace
    await tx.insert(schema.workspaces).values(data)

    // Add owner as member
    await tx.insert(schema.workspaceMembers).values({
      id: `member-${data.id}`,
      workspaceId: data.id,
      userId: data.ownerId,
      role: "owner",
    })

    // Create default settings
    await tx.insert(schema.workspaceSettings).values({
      id: `settings-${data.id}`,
      workspaceId: data.id,
    })
  })
}

// ============================================================================
// CONTEXT QUERIES
// ============================================================================

export async function getWorkspaceContexts(workspaceId: string) {
  const contexts = await db
    .select()
    .from(schema.contexts)
    .where(eq(schema.contexts.workspaceId, workspaceId))
    .orderBy(desc(schema.contexts.createdAt))

  return contexts.map(transformContextFromDb)
}

export async function createContext(
  workspaceId: string,
  context: Omit<Context, "createdAt" | "updatedAt" | "previousStates" | "currentStateIndex">,
) {
  const [result] = await db.insert(schema.contexts).values({
    id: context.id,
    workspaceId,
    name: context.name,
    type: context.type,
    content: context.content,
    link: context.link,
    mainPrompt: context.mainPrompt,
    referenceIds: context.referenceIds as any,
    analysisJson: context.analysis as any,
  })

  return result
}

export async function updateContext(contextId: string, updates: Partial<Context>) {
  await db
    .update(schema.contexts)
    .set({
      name: updates.name,
      content: updates.content,
      link: updates.link,
      mainPrompt: updates.mainPrompt,
      referenceIds: updates.referenceIds as any,
      analysisJson: updates.analysis as any,
    })
    .where(eq(schema.contexts.id, contextId))
}

export async function deleteContext(contextId: string) {
  await db.delete(schema.contexts).where(eq(schema.contexts.id, contextId))
}

// ============================================================================
// ASSET QUERIES
// ============================================================================

export async function getWorkspaceAssets(workspaceId: string) {
  const assets = await db
    .select()
    .from(schema.assets)
    .where(eq(schema.assets.workspaceId, workspaceId))
    .orderBy(desc(schema.assets.createdAt))

  return assets.map(transformAssetFromDb)
}

export async function createAsset(
  workspaceId: string,
  asset: Omit<Asset, "createdAt" | "updatedAt" | "previousStates" | "currentStateIndex">,
) {
  const [result] = await db.insert(schema.assets).values({
    id: asset.id,
    workspaceId,
    name: asset.name,
    type: asset.type,
    link: asset.link,
    analysisJson: asset.analysis as any,
  })

  // Create insights if provided
  if (asset.insights && asset.insights.length > 0) {
    await db.insert(schema.assetInsights).values(
      asset.insights.map((insight) => ({
        id: insight.id,
        assetId: asset.id,
        text: insight.text,
        category: insight.category,
      })),
    )
  }

  return result
}

export async function updateAsset(assetId: string, updates: Partial<Asset>) {
  await db
    .update(schema.assets)
    .set({
      name: updates.name,
      link: updates.link,
      analysisJson: updates.analysis as any,
    })
    .where(eq(schema.assets.id, assetId))
}

export async function deleteAsset(assetId: string) {
  await db.transaction(async (tx) => {
    // Delete insights first
    await tx.delete(schema.assetInsights).where(eq(schema.assetInsights.assetId, assetId))
    // Delete asset
    await tx.delete(schema.assets).where(eq(schema.assets.id, assetId))
  })
}

// ============================================================================
// STYLE GUIDE QUERIES
// ============================================================================

export async function getWorkspaceStyleGuides(workspaceId: string) {
  const styleGuides = await db
    .select()
    .from(schema.styleGuides)
    .where(eq(schema.styleGuides.workspaceId, workspaceId))
    .orderBy(desc(schema.styleGuides.createdAt))

  return styleGuides.map(transformStyleGuideFromDb)
}

export async function createStyleGuide(
  workspaceId: string,
  styleGuide: Omit<StyleGuide, "createdAt" | "updatedAt" | "previousStates" | "currentStateIndex">,
) {
  const [result] = await db.insert(schema.styleGuides).values({
    id: styleGuide.id,
    workspaceId,
    name: styleGuide.name,
    themeMode: styleGuide.themeMode,
    colorsJson: styleGuide.colors as any,
    typographyJson: styleGuide.typography as any,
    spacing: styleGuide.spacing,
    borderRadius: styleGuide.borderRadius,
    animationsJson: styleGuide.animations as any,
  })

  return result
}

export async function updateStyleGuide(styleGuideId: string, updates: Partial<StyleGuide>) {
  await db
    .update(schema.styleGuides)
    .set({
      name: updates.name,
      themeMode: updates.themeMode,
      colorsJson: updates.colors as any,
      typographyJson: updates.typography as any,
      spacing: updates.spacing,
      borderRadius: updates.borderRadius,
      animationsJson: updates.animations as any,
    })
    .where(eq(schema.styleGuides.id, styleGuideId))
}

// ============================================================================
// PAGE QUERIES
// ============================================================================

export async function getWorkspacePages(workspaceId: string) {
  const pages = await db
    .select()
    .from(schema.pages)
    .where(eq(schema.pages.workspaceId, workspaceId))
    .orderBy(desc(schema.pages.createdAt))

  return pages.map(transformPageFromDb)
}

export async function createPage(
  workspaceId: string,
  page: Omit<Page, "createdAt" | "updatedAt" | "previousStates" | "currentStateIndex">,
) {
  const [result] = await db.insert(schema.pages).values({
    id: page.id,
    workspaceId,
    name: page.name,
    type: page.type,
    icon: page.icon,
    mainPrompt: page.mainPrompt,
    referenceIds: page.referenceIds as any,
    code: page.code,
    propsJson: page.props as any,
    category: page.category,
    componentSource: page.componentSource,
    builtInComponentId: page.builtInComponentId,
    stylingJson: page.styling as any,
  })

  return result
}

export async function updatePage(pageId: string, updates: Partial<Page>) {
  await db
    .update(schema.pages)
    .set({
      name: updates.name,
      mainPrompt: updates.mainPrompt,
      referenceIds: updates.referenceIds as any,
      code: updates.code,
      propsJson: updates.props as any,
      category: updates.category,
      stylingJson: updates.styling as any,
    })
    .where(eq(schema.pages.id, pageId))
}

export async function deletePage(pageId: string) {
  await db.delete(schema.pages).where(eq(schema.pages.id, pageId))
}

// ============================================================================
// COMPONENT QUERIES
// ============================================================================

export async function getWorkspaceComponents(workspaceId: string) {
  const components = await db
    .select()
    .from(schema.components)
    .where(eq(schema.components.workspaceId, workspaceId))
    .orderBy(desc(schema.components.createdAt))

  return components.map(transformComponentFromDb)
}

export async function createComponent(
  workspaceId: string,
  component: Omit<Component, "createdAt" | "updatedAt" | "previousStates" | "currentStateIndex">,
) {
  const [result] = await db.insert(schema.components).values({
    id: component.id,
    workspaceId,
    name: component.name,
    mainPrompt: component.mainPrompt,
    referenceIds: component.referenceIds as any,
    code: component.code,
    propsJson: component.props as any,
    stylePropsMapJson: component.stylePropsMap as any,
    category: component.category,
    componentSource: component.componentSource,
    builtInComponentId: component.builtInComponentId,
  })

  return result
}

export async function updateComponent(componentId: string, updates: Partial<Component>) {
  await db
    .update(schema.components)
    .set({
      name: updates.name,
      mainPrompt: updates.mainPrompt,
      referenceIds: updates.referenceIds as any,
      code: updates.code,
      propsJson: updates.props as any,
      stylePropsMapJson: updates.stylePropsMap as any,
      category: updates.category,
    })
    .where(eq(schema.components.id, componentId))
}

export async function deleteComponent(componentId: string) {
  await db.delete(schema.components).where(eq(schema.components.id, componentId))
}

// ============================================================================
// CHAT QUERIES
// ============================================================================

export async function getWorkspaceChats(workspaceId: string) {
  const chats = await db
    .select()
    .from(schema.chats)
    .where(eq(schema.chats.workspaceId, workspaceId))
    .orderBy(desc(schema.chats.updatedAt))

  return chats
}

export async function createChat(data: {
  id: string
  workspaceId: string
  userId: string
  title?: string
}) {
  const [result] = await db.insert(schema.chats).values(data)
  return result
}

export async function getChatMessages(chatId: string) {
  const messages = await db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.chatId, chatId))
    .orderBy(schema.messages.createdAt)

  return messages
}

export async function createMessage(data: {
  id: string
  chatId: string
  role: "user" | "assistant" | "system"
  content: string
  metadataJson?: any
}) {
  const [result] = await db.insert(schema.messages).values(data)

  // Update chat's updatedAt timestamp
  await db.update(schema.chats).set({ updatedAt: new Date() }).where(eq(schema.chats.id, data.chatId))

  return result
}

// ============================================================================
// TRANSFORM FUNCTIONS (DB -> Store format)
// ============================================================================

function transformContextFromDb(dbContext: any): Context {
  return {
    id: dbContext.id,
    name: dbContext.name,
    type: dbContext.type,
    content: dbContext.content,
    link: dbContext.link,
    mainPrompt: dbContext.mainPrompt,
    referenceIds: dbContext.referenceIds || [],
    analysis: dbContext.analysisJson,
    createdAt: dbContext.createdAt.toISOString(),
    updatedAt: dbContext.updatedAt.toISOString(),
    previousStates: [],
    currentStateIndex: 0,
  }
}

function transformAssetFromDb(dbAsset: any): Asset {
  return {
    id: dbAsset.id,
    name: dbAsset.name,
    type: dbAsset.type,
    link: dbAsset.link,
    insights: [],
    analysis: dbAsset.analysisJson,
    createdAt: dbAsset.createdAt.toISOString(),
    updatedAt: dbAsset.updatedAt.toISOString(),
    previousStates: [],
    currentStateIndex: 0,
  }
}

function transformStyleGuideFromDb(dbStyleGuide: any): StyleGuide {
  return {
    id: dbStyleGuide.id,
    name: dbStyleGuide.name,
    themeMode: dbStyleGuide.themeMode,
    colors: dbStyleGuide.colorsJson,
    typography: dbStyleGuide.typographyJson,
    spacing: dbStyleGuide.spacing,
    borderRadius: dbStyleGuide.borderRadius,
    animations: dbStyleGuide.animationsJson || [],
    createdAt: dbStyleGuide.createdAt.toISOString(),
    updatedAt: dbStyleGuide.updatedAt.toISOString(),
    previousStates: [],
    currentStateIndex: 0,
  }
}

function transformPageFromDb(dbPage: any): Page {
  return {
    id: dbPage.id,
    name: dbPage.name,
    type: dbPage.type,
    icon: dbPage.icon,
    mainPrompt: dbPage.mainPrompt,
    referenceIds: dbPage.referenceIds || [],
    code: dbPage.code,
    props: dbPage.propsJson,
    category: dbPage.category,
    componentSource: dbPage.componentSource,
    builtInComponentId: dbPage.builtInComponentId,
    styling: dbPage.stylingJson,
    createdAt: dbPage.createdAt.toISOString(),
    updatedAt: dbPage.updatedAt.toISOString(),
    previousStates: [],
    currentStateIndex: 0,
  }
}

function transformComponentFromDb(dbComponent: any): Component {
  return {
    id: dbComponent.id,
    name: dbComponent.name,
    type: "component",
    mainPrompt: dbComponent.mainPrompt,
    referenceIds: dbComponent.referenceIds || [],
    code: dbComponent.code,
    props: dbComponent.propsJson,
    stylePropsMap: dbComponent.stylePropsMapJson,
    category: dbComponent.category,
    componentSource: dbComponent.componentSource,
    builtInComponentId: dbComponent.builtInComponentId,
    createdAt: dbComponent.createdAt.toISOString(),
    updatedAt: dbComponent.updatedAt.toISOString(),
    previousStates: [],
    currentStateIndex: 0,
  }
}
