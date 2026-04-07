// Server identity
export const SERVER_NAME = "minimal-mcp-deep-research";
export const SERVER_VERSION = "1.0.0";

// HTTP
export const USER_AGENT = "MinimalMCP/1.0";
export const FETCH_TIMEOUT_MS = 10_000;

// Search
export const DUCKDUCKGO_SEARCH_URL = "https://html.duckduckgo.com/html/";
export const DUCKDUCKGO_INSTANT_URL = "https://api.duckduckgo.com/";
export const WIKIPEDIA_SEARCH_URL = "https://en.wikipedia.org/w/api.php";
export const WIKIPEDIA_SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";
export const SEARCH_RESULTS_LIMIT = 10;

// Research
export const RESEARCH_FETCH_COUNT = 3;
export const RESEARCH_FETCH_COUNT_MAX = 10;

// Content
export const MAX_CONTENT_LENGTH = 10_000;
export const MAX_RESEARCH_LENGTH = 50_000;

// Tool definitions
export const TOOLS = [
  {
    name: "research",
    description:
      "Deep research on any topic. The most thorough tool available — use it as your default for complex or multi-faceted questions. " +
      "Automatically searches the web, fetches an instant answer from knowledge bases, and reads the most relevant pages. " +
      "Provide multiple queries approaching the topic from different angles. " +
      "Returns an instant answer (when available), search result snippets, and full page contents organized by source.",
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
        fetch_count: {
          type: "number",
          description: `Number of pages to fetch and read (1–10, default 3). Higher values give more depth but take longer.`,
        },
      },
    },
  },
  {
    name: "web_search",
    description:
      "Search the web and return result titles, URLs, and snippets — without fetching page contents. " +
      "Use this to survey what's available before deciding which pages to read with fetch_page. " +
      "For most research tasks, prefer research instead — it searches and reads pages in one call.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search query",
        },
        queries: {
          type: "array",
          items: { type: "string" },
          description: "Alternative to query — if provided, the first query is used.",
        },
      },
    },
  },
  {
    name: "instant_answer",
    description:
      "Try this first for any factual lookup: definitions, people, places, concepts, 'what is X'. " +
      "Returns a single direct answer sourced from Wikipedia and other knowledge bases. Fast — no page fetching. " +
      "If it returns nothing (obscure or ambiguous topic), follow up with wikipedia_search or research.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Query to look up",
        },
        queries: {
          type: "array",
          items: { type: "string" },
          description: "Alternative to query — if provided, the first query is used.",
        },
      },
    },
  },
  {
    name: "wikipedia_search",
    description:
      "Search Wikipedia and return summaries for the top matching articles. " +
      "Use this when instant_answer returns nothing, when a topic has multiple related articles worth comparing, " +
      "or when you need a citable Wikipedia source. " +
      "Not useful for current events or anything without a Wikipedia article — use research instead.",
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
