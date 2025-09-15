import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { TabelogClient } from '../client.js';
import { TabelogTopArgs, TabelogSnapshotArgs } from '../types.js';

/**
 * Tool definition for tabelog_top
 */
export const tabelogTopToolDefinition: Tool = {
    name: "tabelog_top",
    description: "Get top-rated restaurants from Tabelog for a specific region",
    inputSchema: {
        type: "object",
        properties: {
            region: {
                type: "string",
                description: "Region slug (e.g., 'kyoto', 'tokyo', 'osaka')",
                default: "kyoto"
            },
            limit: {
                type: "integer",
                description: "Number of restaurants to return (max 50)",
                default: 10,
                minimum: 1,
                maximum: 50
            }
        },
        required: []
    },
};

/**
 * Tool definition for tabelog_snapshot
 */
export const tabelogSnapshotToolDefinition: Tool = {
    name: "tabelog_snapshot",
    description: "Take a snapshot of the Tabelog page for a specific region",
    inputSchema: {
        type: "object",
        properties: {
            region: {
                type: "string",
                description: "Region slug (e.g., 'kyoto', 'tokyo', 'osaka')",
                default: "kyoto"
            }
        },
        required: []
    },
};

/**
 * Type guard for tabelog_top arguments
 */
function isTabelogTopArgs(args: unknown): args is TabelogTopArgs {
    return (
        typeof args === "object" &&
        args !== null &&
        (args as any).region === undefined || typeof (args as any).region === "string" &&
        (args as any).limit === undefined || typeof (args as any).limit === "number"
    );
}

/**
 * Type guard for tabelog_snapshot arguments
 */
function isTabelogSnapshotArgs(args: unknown): args is TabelogSnapshotArgs {
    return (
        typeof args === "object" &&
        args !== null &&
        (args as any).region === undefined || typeof (args as any).region === "string"
    );
}

/**
 * Handles tabelog_top tool calls
 */
export async function handleTabelogTopTool(
    client: TabelogClient, 
    args: unknown
): Promise<CallToolResult> {
    try {
        if (!args) {
            throw new Error("No arguments provided");
        }

        if (!isTabelogTopArgs(args)) {
            throw new Error("Invalid arguments for tabelog_top");
        }

        const region = args.region || "kyoto";
        const limit = Math.min(args.limit || 10, 50); // Cap at 50

        const result = await client.scrapeRestaurants(region, limit);
        
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            isError: false,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}

/**
 * Handles tabelog_snapshot tool calls
 */
export async function handleTabelogSnapshotTool(
    client: TabelogClient, 
    args: unknown
): Promise<CallToolResult> {
    try {
        if (!args) {
            throw new Error("No arguments provided");
        }

        if (!isTabelogSnapshotArgs(args)) {
            throw new Error("Invalid arguments for tabelog_snapshot");
        }

        const region = args.region || "kyoto";
        const result = await client.takeSnapshot(region);
        
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            isError: false,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}
