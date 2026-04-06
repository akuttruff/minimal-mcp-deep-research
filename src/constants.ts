// Server identity
export const SERVER_NAME = "minimal-mcp-deep-research";
export const SERVER_VERSION = "1.0.0";

// HTTP
export const USER_AGENT = "MinimalMCP/1.0";
export const FETCH_TIMEOUT_MS = 10_000;

// Search
export const DUCKDUCKGO_SEARCH_URL = "https://html.duckduckgo.com/html/";
export const SEARCH_RESULTS_LIMIT = 10;

// Research
export const RESEARCH_FETCH_COUNT = 3;

// Content
export const MAX_CONTENT_LENGTH = 10_000;

// Tool definitions
export const TOOLS = [
  {
    name: "research",
    description:
      "Research a topic by searching the web and automatically reading the most relevant pages. " +
      "Provide multiple queries approaching the topic from different angles for thorough research. " +
      "Searches all queries in parallel, deduplicates results, and fetches the top pages. " +
      "Returns search result snippets plus full page contents organized by source.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "A single search query. For broader results, use the queries parameter instead.",
        },
        queries: {
          type: "array",
          items: { type: "string" },
          description: "Multiple search queries approaching the topic from different angles for thorough research.",
        },
      },
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
