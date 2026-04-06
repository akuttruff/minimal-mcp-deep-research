import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { deepResearch, fetchPage, webSearch, wrapAsData } from "./utils.js";

// --- Tool definitions ---

const TOOLS = [
  {
    name: "research",
    description:
      "Research a topic by searching the web and automatically reading the most relevant pages. " +
      "Returns search result snippets plus the full text of the top 3 pages. " +
      "For thorough research, call this tool multiple times with different queries — " +
      "vary the phrasing, approach the topic from different angles, and synthesize across all results before responding. " +
      "Do not answer from a single call alone.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search query",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "web_search",
    description:
      "Search the web using DuckDuckGo. Returns up to 10 result titles, URLs, and snippets — but does not fetch page contents. " +
      "Use this when you want to survey results before deciding which pages to read with fetch_page.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search query",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "fetch_page",
    description:
      "Fetch the full text content of a web page. Returns plain text with HTML stripped. " +
      "Use this to read the full content of a specific URL.",
    inputSchema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: "URL to fetch",
        },
      },
      required: ["url"],
    },
  },
];

// --- Server setup ---

const server = new Server(
  { name: "minimal-mcp-deep-research", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "research": {
      const query = (args as Record<string, unknown>)?.query;
      if (typeof query !== "string" || query.trim() === "") {
        return {
          content: [{ type: "text" as const, text: "Missing or empty 'query' parameter." }],
          isError: true,
        };
      }
      const result = await deepResearch(query);
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
