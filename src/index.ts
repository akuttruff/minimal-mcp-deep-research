import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { deepResearch, fetchPage, webSearch, wrapAsData } from "./utils.js";
import { SERVER_NAME, SERVER_VERSION, TOOLS } from "./constants.js";

// --- Server setup ---

const server = new Server(
  { name: SERVER_NAME, version: SERVER_VERSION },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "research": {
      const rawQueries = (args as Record<string, unknown>)?.queries;
      const rawQuery = (args as Record<string, unknown>)?.query;
      const queries: string[] = Array.isArray(rawQueries)
        ? rawQueries.filter((q): q is string => typeof q === "string" && q.trim() !== "")
        : typeof rawQuery === "string" && rawQuery.trim() !== ""
          ? [rawQuery]
          : [];
      if (queries.length === 0) {
        return {
          content: [{ type: "text" as const, text: "Provide at least one search query via 'query' (string) or 'queries' (array of strings)." }],
          isError: true,
        };
      }
      const result = await deepResearch(queries);
      return {
        content: [{ type: "text" as const, text: wrapAsData("research", result) }],
      };
    }

    case "web_search": {
      const query = (args as Record<string, unknown>)?.query;
      if (typeof query !== "string" || query.trim() === "") {
        return {
          content: [{ type: "text" as const, text: "Missing or empty 'query' parameter." }],
          isError: true,
        };
      }
      const { text } = await webSearch(query);
      return {
        content: [{ type: "text" as const, text: wrapAsData("web_search", text) }],
      };
    }

    case "fetch_page": {
      const url = (args as Record<string, unknown>)?.url;
      if (typeof url !== "string" || url.trim() === "") {
        return {
          content: [{ type: "text" as const, text: "Missing or empty 'url' parameter." }],
          isError: true,
        };
      }
      const result = await fetchPage(url);
      return {
        content: [{ type: "text" as const, text: wrapAsData("fetch_page", result) }],
      };
    }

    default:
      return {
        content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

// --- Start ---

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("MCP server running on stdio");
