// Narration and speech appear as separate pages, like a visual novel.
export function paginateDialogue(text, limit = 240) {
  const sentences = new Intl.Segmenter("id", { granularity: "sentence" });
  const pages = [];
  for (const block of text.split(/(\*[^*]+\*)/g)) {
    const narration =
      block.startsWith("*") && block.endsWith("*") && block.length > 1;
    const remaining = (narration ? block.slice(1, -1) : block).trim();
    let page = "";
    // Limit is a target; an unfinished sentence stays on the same page.
    for (const { segment } of sentences.segment(remaining)) {
      if (page && (page + segment).trim().length > limit) {
        pages.push({ text: page.trim(), narration });
        page = "";
      }
      page += segment;
    }
    if (page.trim()) pages.push({ text: page.trim(), narration });
  }
  return pages.length ? pages : [{ text: "…", narration: false }];
}
