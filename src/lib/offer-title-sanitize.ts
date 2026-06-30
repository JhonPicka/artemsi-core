const NAMED_HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#34;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&ndash;": "–",
  "&mdash;": "—",
  "&hellip;": "…",
  "&eacute;": "é",
  "&Eacute;": "É",
  "&egrave;": "è",
  "&Egrave;": "È",
  "&ecirc;": "ê",
  "&Ecirc;": "Ê",
  "&agrave;": "à",
  "&Agrave;": "À",
  "&ccedil;": "ç",
  "&Ccedil;": "Ç",
  "&ocirc;": "ô",
  "&Ocirc;": "Ô",
  "&ucirc;": "û",
  "&Ucirc;": "Û",
  "&iuml;": "ï",
  "&Iuml;": "Ï",
};

function decodeHtmlEntities(value: string): string {
  let text = value;
  for (let pass = 0; pass < 3; pass += 1) {
    const before = text;
    for (const [entity, char] of Object.entries(NAMED_HTML_ENTITIES)) {
      text = text.split(entity).join(char);
    }
    text = text.replace(/&#(\d+);/g, (_, code) => {
      const n = Number(code);
      return Number.isFinite(n) ? String.fromCodePoint(n) : _;
    });
    text = text.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const n = Number.parseInt(hex, 16);
      return Number.isFinite(n) ? String.fromCodePoint(n) : _;
    });
    if (text === before) break;
  }
  return text;
}

function normalizeUnicodeSpaces(value: string): string {
  return value
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isMostlyUppercase(value: string): boolean {
  const letters = value.match(/[A-Za-zÀ-ÿ]/g) ?? [];
  if (letters.length < 8) return false;
  const uppercase = letters.filter((ch) => ch === ch.toLocaleUpperCase("fr-FR")).length;
  return uppercase / letters.length >= 0.85;
}

function toReadableFrenchTitleCase(value: string): string {
  if (!isMostlyUppercase(value)) return value;
  const lower = value.toLocaleLowerCase("fr-FR");
  return lower.replace(/(^|[.!?]\s+)([a-zà-ÿ])/g, (match, prefix, letter) => {
    return `${prefix}${letter.toLocaleUpperCase("fr-FR")}`;
  }).replace(/^([a-zà-ÿ])/, (letter) => letter.toLocaleUpperCase("fr-FR"));
}

/**
 * Nettoie un titre d'offre : entités HTML (&amp;…), espaces, esperluette, casse criarde.
 */
export function sanitizeOfferTitle(title: string | null | undefined): string {
  if (!title?.trim()) return "Alternance";

  let text = title.trim();
  text = text.replace(/<[^>]*>/g, " ");
  text = decodeHtmlEntities(text);
  text = normalizeUnicodeSpaces(text);

  // Esperluette entre mots (« Food & Strategic »), pas dans les sigles (R&D, H/F…)
  text = text.replace(/\s+&\s+/g, " et ");
  text = text.replace(/\s+et\s+et\s+/gi, " et ");

  // Point médian inclusif : Apprenti·e → Apprenti(e)
  text = text.replace(/([A-Za-zÀ-ÿ]+)·([A-Za-zÀ-ÿ]+)/g, "$1($2)");

  text = normalizeUnicodeSpaces(text);
  text = toReadableFrenchTitleCase(text);
  text = normalizeUnicodeSpaces(text);

  if (!text) return "Alternance";
  return text.slice(0, 500);
}
