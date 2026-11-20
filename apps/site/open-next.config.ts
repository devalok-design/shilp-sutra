import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// Defaults are deliberate. The site has no database, no ISR and no server
// cache to wire up — `/mcp` proxies to the MCP service at request time and
// everything else renders from the build. Add an incremental cache here only
// when something actually needs to persist between requests.
export default defineCloudflareConfig()
