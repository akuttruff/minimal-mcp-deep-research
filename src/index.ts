import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { deepResearch, fetchPage, instantAnswer, webSearch, wikipediaSearch, wrapAsData } from "./utils.js";
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
      const rawFetchCount = (args as Record<string, unknown>)?.fetch_count;
      const fetchCount = typeof rawFetchCount === "number" ? rawFetchCount : undefined;
      const result = await deepResearch(queries, fetchCount);
      return {
        content: [{ type: "text" as const, text: wrapAsData("research", result) }],
      };
    }

    case "instant_answer": {
      const rawQ = (args as Record<string, unknown>)?.query;
      const rawQs = (args as Record<string, unknown>)?.queries;
      const query = typeof rawQ === "string" && rawQ.trim() !== ""
        ? rawQ
        : Array.isArray(rawQs) && typeof rawQs[0] === "string" && rawQs[0].trim() !== ""
          ? rawQs[0]
          : "";
      if (!query) {
        return {
          content: [{ type: "text" as const, text: "Missing or empty 'query' parameter." }],
          isError: true,
        };
      }
      const result = await instantAnswer(query);
      return {
        content: [{ type: "text" as const, text: wrapAsData("instant_answer", result || "No instant answer available for this query.") }],
      };
    }

    case "wikipedia_search": {
      const rawQ = (args as Record<string, unknown>)?.query;
      const rawQs = (args as Record<string, unknown>)?.queries;
      const query = typeof rawQ === "string" && rawQ.trim() !== ""
        ? rawQ
        : Array.isArray(rawQs) && typeof rawQs[0] === "string" && rawQs[0].trim() !== ""
          ? rawQs[0]
          : "";
      if (!query) {
        return {
          content: [{ type: "text" as const, text: "Missing or empty 'query' parameter." }],
          isError: true,
        };
      }
      const result = await wikipediaSearch(query);
      return {
        content: [{ type: "text" as const, text: wrapAsData("wikipedia_search", result) }],
      };
    }

    case "web_search": {
      const rawQuery = (args as Record<string, unknown>)?.query;
      const rawQueries = (args as Record<string, unknown>)?.queries;
      const query = typeof rawQuery === "string" && rawQuery.trim() !== ""
        ? rawQuery
        : Array.isArray(rawQueries) && typeof rawQueries[0] === "string" && rawQueries[0].trim() !== ""
          ? rawQueries[0]
          : "";
      if (!query) {
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
