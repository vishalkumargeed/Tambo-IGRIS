# GitHub MCP Server Setup Guide

This guide explains how to configure the GitHub MCP server for enhanced AI capabilities in Sentinel AI.

## What is GitHub MCP Server?

The GitHub MCP (Model Context Protocol) Server provides a comprehensive set of tools for interacting with GitHub repositories, issues, pull requests, contributors, and more. When configured, the AI assistant can use these tools to perform GitHub operations directly.

## Prerequisites

- A running GitHub MCP server instance (deployed or local)
- The server URL must be accessible from your browser (CORS-enabled)
- GitHub authentication token (if required by your MCP server)

## Configuration Steps

### Option 1: Via UI (Recommended)

1. **Open the Application**
   - Navigate to the dashboard
   - Look for MCP configuration settings (usually in settings menu or via keyboard shortcut)

2. **Add GitHub MCP Server**
   - Click "Add Server" or similar button
   - Enter the following details:
     - **Server URL**: Your GitHub MCP server endpoint (e.g., `https://your-mcp-server.com/github`)
     - **Server Name**: `GitHub MCP Server` (optional but recommended)
     - **Transport Type**: `HTTP` (default) or `SSE` if your server supports it

3. **Save Configuration**
   - Click "Add Server" to save
   - The server should appear in the "Connected Servers" list
   - A green indicator shows the server is connected

### Option 2: Manual Configuration (Advanced)

You can manually configure MCP servers by editing browser localStorage:

1. Open browser developer tools (F12)
2. Go to Console tab
3. Run the following:

```javascript
const githubMcpConfig = {
  url: "https://your-github-mcp-server.com",
  transport: "HTTP",
  name: "GitHub MCP Server"
};

const existingServers = JSON.parse(localStorage.getItem("mcp-servers") || "[]");
existingServers.push(githubMcpConfig);
localStorage.setItem("mcp-servers", JSON.stringify(existingServers));

// Reload the page to apply changes
location.reload();
```

## GitHub MCP Server Capabilities

Once configured, the AI assistant can use GitHub MCP tools for:

### Repository Operations
- `create_repository` - Create new repositories
- `fork_repository` - Fork existing repositories
- `search_repositories` - Search for repositories
- `get_file_contents` - Read repository files
- `create_or_update_file` - Create or update files
- `delete_file` - Delete files

### Issue Management
- `list_issues` - List repository issues
- `search_issues` - Search issues with filters
- `issue_read` - Get issue details and comments
- `issue_write` - Create or update issues
- `add_issue_comment` - Add comments to issues
- `assign_copilot_to_issue` - Assign GitHub Copilot to issues

### Pull Request Operations
- `list_pull_requests` - List PRs in a repository
- `search_pull_requests` - Search PRs with filters
- `pull_request_read` - Get PR details, diff, files, reviews
- `create_pull_request` - Create new PRs
- `update_pull_request` - Update PR details
- `merge_pull_request` - Merge PRs
- `pull_request_review_write` - Create and submit PR reviews
- `request_copilot_review` - Request Copilot code review

### Contributor & User Operations
- `get_me` - Get authenticated user details
- `search_users` - Search for GitHub users
- `get_team_members` - Get team members
- `get_teams` - Get user's teams
- `list_commits` - List commits (useful for contributor analysis)

### Code Operations
- `search_code` - Search code across GitHub
- `get_file_contents` - Read file contents
- `create_branch` - Create new branches
- `list_branches` - List repository branches
- `list_tags` - List repository tags

### Releases & Tags
- `list_releases` - List repository releases
- `get_latest_release` - Get latest release
- `get_release_by_tag` - Get release by tag
- `get_tag` - Get tag details

## Example Use Cases

### For Contributors Section

The GitHub MCP server is particularly useful for contributor-related features:

1. **Getting Contributor List**:
   ```
   AI: "List all contributors for this repository"
   → Uses: list_commits with author filter, or search_users
   ```

2. **Contributor Statistics**:
   ```
   AI: "Show me contributor statistics"
   → Uses: list_commits, get_commit to analyze contributions
   ```

3. **Team Information**:
   ```
   AI: "Show team members for this organization"
   → Uses: get_team_members, get_teams
   ```

### Common Workflows

**Creating a Pull Request**:
1. AI uses `search_pull_requests` to check for existing PRs
2. Uses `get_file_contents` to read PR template if exists
3. Uses `create_pull_request` to create the PR
4. Uses `pull_request_review_write` for reviews if needed

**Managing Issues**:
1. AI uses `search_issues` to find related issues
2. Uses `issue_read` to get issue details
3. Uses `issue_write` to create or update issues
4. Uses `add_issue_comment` to add comments

## Troubleshooting

### Server Not Connecting

**Issue**: Server doesn't appear in connected servers list

**Solutions**:
- Verify the server URL is correct and accessible
- Check browser console for CORS errors
- Ensure the server supports HTTP transport (or use SSE if available)
- Try accessing the server URL directly in browser

### CORS Errors

**Issue**: Browser console shows CORS errors

**Solutions**:
- Ensure your MCP server has CORS headers configured
- For development, you may need to configure CORS on the server:
  ```javascript
  // Example Express.js CORS configuration
  app.use(cors({
    origin: ['http://localhost:3000', 'https://your-domain.com'],
    credentials: true
  }));
  ```

### Authentication Issues

**Issue**: GitHub operations fail with authentication errors

**Solutions**:
- Ensure your GitHub MCP server is configured with proper GitHub tokens
- Check if the server requires authentication tokens in headers
- Verify GitHub token permissions (repo, issues, pull requests, etc.)

### Tools Not Available

**Issue**: AI assistant doesn't use GitHub MCP tools

**Solutions**:
- Verify the server is connected (check "Connected Servers" list)
- Ensure the server exposes the required tools
- Check server logs for tool registration
- Try reloading the page to refresh MCP connections

## Server Requirements

### For Browser-Based Connections

- **CORS**: Must support Cross-Origin Resource Sharing
- **Transport**: HTTP (REST) or SSE (Server-Sent Events)
- **Authentication**: Should handle GitHub token authentication
- **Tool Exposure**: Must expose tools via MCP protocol

### Recommended Server Setup

If you're running your own GitHub MCP server:

1. **Deploy the Server**:
   - Use a platform like Vercel, Railway, or your own server
   - Ensure HTTPS is enabled
   - Configure CORS for your domain

2. **GitHub Token**:
   - Create a GitHub Personal Access Token
   - Grant necessary permissions (repo, issues, pull requests)
   - Configure the token in your MCP server

3. **Test Connection**:
   - Use the MCP configuration UI to test
   - Check server logs for connection attempts
   - Verify tools are exposed correctly

## Additional Resources

- [Tambo AI MCP Documentation](https://docs.tambo.co/concepts/model-context-protocol)
- [Client-Side MCP Connection Guide](https://docs.tambo.co/concepts/model-context-protocol/clientside-mcp-connection)
- [GitHub MCP Server Tools Reference](./githubMCP.txt) (in project root)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs
3. Check browser console for errors
4. Open an issue on the repository with details
