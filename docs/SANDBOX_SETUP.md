# Vercel Sandbox Setup

This project uses Vercel Sandbox to provide live preview functionality for generated applications.

## Environment Variables

Add these environment variables to your `.env.local` file or Vercel project settings:

### Option 1: OIDC Token (Recommended)

\`\`\`bash
VERCEL_OIDC_TOKEN=your_oidc_token_here
\`\`\`

The OIDC token is automatically provided when running on Vercel's platform. For local development, you can obtain it from your Vercel project settings.

### Option 2: Personal Access Token

\`\`\`bash
VERCEL_TOKEN=your_personal_access_token
VERCEL_TEAM_ID=your_team_id
VERCEL_PROJECT_ID=your_project_id
\`\`\`

## How It Works

1. When you click "Preview" in the header, the app switches to preview mode
2. The `FullAppPreview` component calls `/api/sandbox/create` to create a Vercel Sandbox
3. The sandbox sets up a Vite + React + Tailwind CSS environment
4. The live preview is displayed in an iframe that takes up the full canvas area
5. The sandbox is reused across requests to save resources

## Sandbox Features

- **Runtime**: Node.js 22
- **Dev Server**: Vite on port 3000
- **Timeout**: 5 minutes
- **Hot Module Replacement**: Enabled
- **Frameworks**: React 18 + Tailwind CSS

## API Endpoints

### POST `/api/sandbox/create`

Creates or returns an existing Vercel Sandbox instance.

**Response:**
\`\`\`json
{
  "success": true,
  "sandboxId": "sandbox_abc123",
  "url": "https://sandbox-abc123.vercel.run",
  "message": "Vercel sandbox created and Vite React app initialized"
}
\`\`\`

## Troubleshooting

### Sandbox creation fails

- Verify your OIDC token or personal access token is valid
- Check that you have the correct team and project IDs
- Ensure the `@vercel/sandbox` package is installed

### Preview shows loading indefinitely

- Check the browser console for errors
- Verify the sandbox URL is accessible
- Try refreshing the page to recreate the sandbox

### Changes not reflecting in preview

- The current implementation shows a template app
- Future updates will sync your workspace specifications to the sandbox
