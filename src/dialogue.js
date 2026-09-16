// Narration and speech appear as separate pages, like a visual novel.
export function paginateDialogue(text, limit = 240) {
  const pages = [];
  for (const block of text.split(/(\*[^*]+\*)/g)) {
    const narration =
      block.startsWith("*") && block.endsWith("*") && block.length > 1;
    let remaining = (narration ? block.slice(1, -1) : block).trim();
    while (remaining) {
      let end = remaining.length;
      if (end > limit) {
        end = remaining.lastIndexOf(" ", limit);
        if (end < limit / 2) end = limit;
      }
      pages.push({ text: remaining.slice(0, end).trim(), narration });
      remaining = remaining.slice(end).trim();
    }
  }
  return pages.length ? pages : [{ text: "…", narration: false }];
}
