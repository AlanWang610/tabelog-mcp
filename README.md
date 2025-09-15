# Tabelog MCP Server

A Model Context Protocol (MCP) server that scrapes restaurant data from Tabelog using Playwright and TypeScript.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Scrape top-rated restaurants from Tabelog
- Support for different regions (Kyoto, Tokyo, Osaka, etc.)
- Take snapshots of Tabelog pages
- Extract restaurant names, ratings, URLs, cuisine types, prices, and locations
- Streamable HTTP transport for production deployment
- STDIO transport for local development

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

3. Build the project:
```bash
npm run build
```

## MCP Configuration

### HTTP Transport (Recommended)

Add this to your MCP host configuration:

```json
{
  "mcpServers": {
    "tabelog": {
      "url": "http://localhost:8080/mcp"
    }
  }
}
```

### STDIO Transport (Development)

```json
{
  "mcpServers": {
    "tabelog": {
      "command": "node",
      "args": ["dist/src/index.js", "--stdio"]
    }
  }
}
```

## Available Tools

### `tabelog_top`
Get top-rated restaurants from Tabelog for a specific region.

**Parameters:**
- `region` (string): Region slug (e.g., 'kyoto', 'tokyo', 'osaka'). Default: 'kyoto'
- `limit` (integer): Number of restaurants to return (1-50). Default: 10

**Example:**
```json
{
  "region": "kyoto",
  "limit": 10
}
```

### `tabelog_snapshot`
Take a snapshot of the Tabelog page for a specific region.

**Parameters:**
- `region` (string): Region slug (e.g., 'kyoto', 'tokyo', 'osaka'). Default: 'kyoto'

## Usage Examples

1. Get top 10 restaurants in Kyoto:
   - Tool: `tabelog_top`
   - Parameters: `{"region": "kyoto", "limit": 10}`

2. Get top 5 restaurants in Tokyo:
   - Tool: `tabelog_top`
   - Parameters: `{"region": "tokyo", "limit": 5}`

3. Take a snapshot of Osaka restaurants page:
   - Tool: `tabelog_snapshot`
   - Parameters: `{"region": "osaka"}`

## Response Format

The `tabelog_top` tool returns a JSON object with:
- `region`: The requested region
- `count`: Number of restaurants returned
- `restaurants`: Array of restaurant objects, each containing:
  - `name`: Restaurant name
  - `rating`: Tabelog rating
  - `url`: Restaurant URL on Tabelog
  - `cuisine`: Type of cuisine
  - `location`: Nearest station/area
  - `price`: Price range
  - `rank`: Ranking position

## Development

### Running the Server

```bash
# Development mode (HTTP transport)
npm run dev

# Development mode (STDIO transport)
npm run dev:stdio

# Production mode
npm start
```

### Project Structure

```
src/
├── index.ts            # Main entry point
├── cli.ts              # Command-line argument parsing
├── config.ts           # Configuration management
├── server.ts           # Server instance creation
├── client.ts           # Playwright client for Tabelog scraping
├── types.ts            # TypeScript type definitions
├── tools/
│   ├── index.ts        # Tool exports
│   └── tabelog.ts      # Tool definitions and handlers
└── transport/
    ├── index.ts        # Transport exports
    ├── http.ts         # HTTP transport (primary)
    └── stdio.ts        # STDIO transport (development)
```

## Notes

- The server uses Playwright with Chromium in headless mode
- Restaurant data is sorted by rating (highest first) using Tabelog's `SrtT=rt` parameter
- The scraper uses robust selectors to avoid brittle class names
- Rate limiting and respectful scraping practices are implemented
- Follows MCP server guidelines with streamable HTTP transport
- TypeScript-based implementation for better type safety and maintainability

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
