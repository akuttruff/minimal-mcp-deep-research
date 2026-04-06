import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { fetchPage, stripHtml, wrapAsData } from "./utils.js";

// --- Tool definitions (raw JSON Schema, no zod) ---

const TOOLS = [
  {
    name: "web_search",
    description:
      "Search the web using DuckDuckGo. Returns a list of result titles, URLs, and snippets. Use this when you need current information.",
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
      "Fetch the text content of a web page. Returns plain text with HTML stripped. Use this to read the full content of a URL from search results.",
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

// --- Tool implementations ---

async function webSearch(query: string): Promise<string> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "MinimalMCP/1.0",
    },
  });

  if (!response.ok) {
    return `Search failed with status ${response.status}`;
  }

  const html = await response.text();

  // Parse DuckDuckGo HTML results
  const results: string[] = [];
  const resultPattern =
    /<a[^>]+class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

  let match: RegExpExecArray | null;
  let count = 0;
  while ((match = resultPattern.exec(html)) !== null && count < 5) {
    const resultUrl = decodeURIComponent(
      match[1]?.replace(/.*uddg=([^&]*).*/, "$1") ?? match[1] ?? ""
    );
    const title = stripHtml(match[2] ?? "");
    const snippet = stripHtml(match[3] ?? "");
    results.push(`[${count + 1}] ${title}\n    URL: ${resultUrl}\n    ${snippet}`);
    count++;
  }

  if (results.length === 0) {
    return "No results found.";
  }

  return results.join("\n\n");
}

// --- Server setup ---

const server = new Server(
  { name: "minimal-mcp-web-search", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "web_search": {
      const query = (args as Record<string, unknown>)?.query;
      if (typeof query !== "string" || query.trim() === "") {
        return {
          content: [{ type: "text" as const, text: "Missing or empty 'query' parameter." }],
          isError: true,
        };
      }
      const result = await webSearch(query);
      return {
        content: [{ type: "text" as const, text: wrapAsData("web_search", result) }],
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
