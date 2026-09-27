// Server identity
export const SERVER_NAME = "minimal-mcp-deep-research";
export const SERVER_VERSION = "1.0.0";

// HTTP
export const USER_AGENT = "MinimalMCP/1.0";
export const FETCH_TIMEOUT_MS = 10_000;
export const MAX_REDIRECTS = 5;

// Search
export const DUCKDUCKGO_SEARCH_URL = "https://html.duckduckgo.com/html/";
export const DUCKDUCKGO_INSTANT_URL = "https://api.duckduckgo.com/";
export const WIKIPEDIA_SEARCH_URL = "https://en.wikipedia.org/w/api.php";
export const WIKIPEDIA_SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";
export const SEARCH_RESULTS_LIMIT = 10;

// Research
export const RESEARCH_FETCH_COUNT = 3;
export const RESEARCH_FETCH_COUNT_MAX = 10;
/** Search results listed per query in a research report (after de-duplication). */
export const RESEARCH_SNIPPETS_PER_QUERY = 6;
/** Pages with less readable text than this are skipped in favour of the next result. */
export const MIN_PAGE_TEXT = 200;

// Content
export const MAX_CONTENT_LENGTH = 10_000;
export const MAX_RESEARCH_LENGTH = 50_000;

// Every tool only reads; all but current_datetime reach out to the web.
const READS_WEB = { readOnlyHint: true, openWorldHint: true } as const;

// Tool definitions
export const TOOLS = [
  {
    name: "current_datetime",
    annotations: { title: "Current date and time", readOnlyHint: true, openWorldHint: false },
    description:
      "Returns the current date and time. Call this proactively whenever the user asks about today's date, " +
      "the current time, or anything time-sensitive (recent events, 'latest', 'current', 'this year', etc.). " +
      "No parameters needed.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "research",
    annotations: { title: "Deep research", ...READS_WEB },
    description:
      "Deep research on any topic. The most thorough tool available — use it as your default for complex or multi-faceted questions. " +
      "Automatically searches the web, fetches an instant answer from knowledge bases, and reads the top pages. " +
      "Provide multiple queries approaching the topic from different angles: pages are read from each query's results in turn. " +
      "Returns an instant answer (when available), search result snippets grouped by query, and the most relevant passages of each page read, organized by source.",
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
          description: `Number of pages to read (1–${RESEARCH_FETCH_COUNT_MAX}, default ${RESEARCH_FETCH_COUNT}). Pages are read in parallel; more pages means broader coverage but shorter excerpts from each.`,
        },
      },
    },
  },
  {
    name: "web_search",
    annotations: { title: "Web search", ...READS_WEB },
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
    annotations: { title: "Instant answer", ...READS_WEB },
    description:
      "Best for static encyclopedic facts: definitions, people, places, historical events, concepts, 'what is X'. " +
      "Returns a single direct answer sourced from Wikipedia and other knowledge bases. Fast — no page fetching. " +
      "Not suitable for real-time or dynamic queries (current date, live prices, recent news) — use web_search or research for those. " +
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
    annotations: { title: "Wikipedia search", ...READS_WEB },
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
        queries: {
          type: "array",
          items: { type: "string" },
          description: "Alternative to query — if provided, the first query is used.",
        },
      },
    },
  },
  {
    name: "fetch_page",
    annotations: { title: "Fetch page", ...READS_WEB },
    description:
      "Fetch the full text content of a public web page. Returns plain text with HTML stripped. " +
      "Use this to read the full content of a specific URL. Local and private network addresses are refused.",
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
