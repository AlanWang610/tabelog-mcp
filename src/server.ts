import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    InitializedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TabelogClient } from './client.js';
import {
    tabelogTopToolDefinition,
    tabelogSnapshotToolDefinition,
    handleTabelogTopTool,
    handleTabelogSnapshotTool,
} from './tools/index.js';

export function createStandaloneServer(): Server {
    const serverInstance = new Server(
        {
            name: "tabelog-mcp",
            version: "0.2.0",
        },
        {
            capabilities: {
                tools: {},
            },
        }
    );

    const tabelogClient = new TabelogClient();

    serverInstance.setNotificationHandler(InitializedNotificationSchema, async () => {
        console.log('Tabelog MCP client initialized');
        // Initialize the Playwright browser when client connects
        await tabelogClient.initialize();
    });

    serverInstance.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [tabelogTopToolDefinition, tabelogSnapshotToolDefinition],
    }));

    serverInstance.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        
        switch (name) {
            case "tabelog_top":
                return await handleTabelogTopTool(tabelogClient, args);
            case "tabelog_snapshot":
                return await handleTabelogSnapshotTool(tabelogClient, args);
            default:
                return {
                    content: [{ type: "text", text: `Unknown tool: ${name}` }],
                    isError: true,
                };
        }
    });

    // Clean up browser when server shuts down
    process.on('SIGINT', async () => {
        await tabelogClient.close();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        await tabelogClient.close();
        process.exit(0);
    });

    return serverInstance;
}

export class TabelogServer {
    getServer(): Server {
        return createStandaloneServer();
    }
}
