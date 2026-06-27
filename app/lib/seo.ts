const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
  "from","as","is","was","are","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","can","shall",
  "it","its","this","that","these","those","i","me","my","we","our","you","your",
  "he","him","his","she","her","they","them","their","what","which","who","when",
  "where","why","how","all","any","both","each","few","more","most","other","some",
  "such","no","nor","not","only","own","same","so","than","too","very","just","about",
  "through","during","before","after","above","below","up","down","out","off","over",
  "under","again","further","then","once","here","there","when","where","why","how",
  "all","any","both","each","few","more","most","other","some","such","no","nor",
  "not","only","own","same","so","than","too","very","also","get","like","one","two",
  "new","way","use","make","well","work","life","even","right","old","see","him",
  "time","much","know","take","people","year","good","give","day","us","came","come",
  "back","long","last","find","man","great","say","every","said","does","set","three",
  "want","air","still","hand","high","sure"," upon","head","help","home","side","move",
  "both","five","once","same","must","name","left","each","done","open","case","show",
  "live","play","went","told","seen","heard","talk","soon","read","stop","face","fact",
  "land","line","kind","next","word","came","went","told","seen","heard","soon","read",
  "stop","face","fact","land","line","kind","next","word","came","went","told","seen",
  "heard","soon","read","stop","face","fact","land","line","kind","next","word",
]);

export function extractKeywords(text: string, existingKeywords: string = ""): string {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1);
  }

  const sorted = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .slice(0, 10);

  const existing = existingKeywords
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);

  const merged = new Set([...existing, ...sorted]);
  return Array.from(merged).slice(0, 15).join(", ");
}
