// src/utils/MergeRelatedFeeds.js

/**
 * Merges content-based recommendations with contextual search results.
 *
 * Interleave ratio: 3 content-based → 1 search-context → 3 content-based → ...
 * Deduplicates by `id`. Excludes the current video id.
 *
 * @param {Array} contentBased   - Videos from fetchRelatedVideos(videoId)
 * @param {Array} searchContext  - Videos from the user's last search results
 * @param {string} currentId     - Current video id (excluded from results)
 * @param {number} maxTotal      - Max total videos to return
 * @returns {Array}              - Merged feed (each item tagged with `source`)
 */
export function mergeRelatedFeeds(
  contentBased = [],
  searchContext = [],
  currentId,
  maxTotal = 20
) {
  const seen = new Set();
  const out = [];

  if (currentId) seen.add(currentId);

  const content = Array.isArray(contentBased) ? contentBased : [];
  const context = Array.isArray(searchContext) ? searchContext : [];

  let ci = 0;
  let si = 0;
  let takeContent = 3;

  while (
    out.length < maxTotal &&
    (ci < content.length || si < context.length)
  ) {
    if (takeContent > 0 && ci < content.length) {
      const v = content[ci++];
      if (v && v.id && !seen.has(v.id)) {
        seen.add(v.id);
        out.push({ ...v, source: "related" });
      }
      takeContent--;
    } else if (si < context.length) {
      const v = context[si++];
      if (v && v.id && !seen.has(v.id)) {
        seen.add(v.id);
        out.push({ ...v, source: "search" });
      }
      takeContent = 3; // reset ratio
    } else {
      // Only content-based left, or context empty → drain content
      if (ci >= content.length) break;
      takeContent = 3;
    }
  }

  // If we still have room, drain the rest of content
  while (out.length < maxTotal && ci < content.length) {
    const v = content[ci++];
    if (v && v.id && !seen.has(v.id)) {
      seen.add(v.id);
      out.push({ ...v, source: "related" });
    }
  }

    if (import.meta.env?.DEV) {
    const counts = out.reduce((acc, v) => {
      acc[v.source] = (acc[v.source] || 0) + 1;
      return acc;
    }, {});
    console.log("[mergeRelatedFeeds] sources:", counts, "total:", out.length);
  }

  return out.slice(0, maxTotal);
}
