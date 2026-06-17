export type CsvOfferRow = {
  line: number;
  title: string;
  url: string;
  description: string;
  company: string | null;
  location: string | null;
  isPublic: boolean;
};

export type CsvRowIssue = {
  line: number;
  message: string;
};

const MAX_ROWS = 250;

const HEADER_ALIASES: Record<string, keyof Omit<CsvOfferRow, "line" | "isPublic"> | "isPublic"> = {
  title: "title",
  titre: "title",
  poste: "title",
  url: "url",
  lien: "url",
  link: "url",
  description: "description",
  desc: "description",
  descriptif: "description",
  company: "company",
  entreprise: "company",
  societe: "company",
  location: "location",
  lieu: "location",
  ville: "location",
  region: "location",
  is_public: "isPublic",
  ispublic: "isPublic",
  public: "isPublic",
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "_");
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined || value.trim() === "") return fallback;
  const v = value.trim().toLowerCase();
  if (["true", "1", "oui", "yes", "o"].includes(v)) return true;
  if (["false", "0", "non", "no", "n"].includes(v)) return false;
  return fallback;
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Minimal RFC-style CSV row parser (commas, quoted fields). */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n" || (char === "\r" && next === "\n")) {
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      if (char === "\r") i += 1;
      continue;
    }

    if (char === "\r") {
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

export function parseOffersCsv(text: string): {
  rows: CsvOfferRow[];
  issues: CsvRowIssue[];
} {
  const issues: CsvRowIssue[] = [];
  const parsed = parseCsvRows(text.trim());

  if (parsed.length === 0) {
    return { rows: [], issues: [{ line: 1, message: "Fichier CSV vide." }] };
  }

  const [headerRow, ...dataRows] = parsed;
  const columnIndex = new Map<keyof CsvOfferRow | "isPublic", number>();

  headerRow.forEach((raw, index) => {
    const key = HEADER_ALIASES[normalizeHeader(raw)];
    if (key) columnIndex.set(key, index);
  });

  for (const required of ["title", "url", "description"] as const) {
    if (!columnIndex.has(required)) {
      issues.push({
        line: 1,
        message: `Colonne obligatoire manquante : ${required} (ou alias : titre, lien, descriptif…).`,
      });
    }
  }

  if (issues.some((issue) => issue.line === 1 && issue.message.includes("manquante"))) {
    return { rows: [], issues };
  }

  const rows: CsvOfferRow[] = [];
  const seenUrls = new Set<string>();

  const limit = Math.min(dataRows.length, MAX_ROWS);
  if (dataRows.length > MAX_ROWS) {
    issues.push({
      line: MAX_ROWS + 2,
      message: `Seules les ${MAX_ROWS} premieres lignes sont importees.`,
    });
  }

  for (let i = 0; i < limit; i += 1) {
    const line = i + 2;
    const cells = dataRows[i];

    const title = cells[columnIndex.get("title")!]?.trim() ?? "";
    const urlRaw = cells[columnIndex.get("url")!]?.trim() ?? "";
    const description = cells[columnIndex.get("description")!]?.trim() ?? "";
    const company = cells[columnIndex.get("company")!]?.trim() ?? "";
    const location = cells[columnIndex.get("location")!]?.trim() ?? "";
    const isPublicIdx = columnIndex.get("isPublic");
    const isPublic = parseBoolean(
      isPublicIdx === undefined ? undefined : cells[isPublicIdx],
      true,
    );

    if (!title || title.length < 2) {
      issues.push({ line, message: "Titre manquant ou trop court (2 caracteres min.)." });
      continue;
    }
    if (!isValidUrl(urlRaw)) {
      issues.push({ line, message: "URL invalide." });
      continue;
    }
    if (description.length < 20) {
      issues.push({ line, message: "Description trop courte (20 caracteres min.)." });
      continue;
    }

    const url = urlRaw.toLowerCase();
    if (seenUrls.has(url)) {
      issues.push({ line, message: "URL en double dans le fichier — ligne ignoree." });
      continue;
    }
    seenUrls.add(url);

    rows.push({
      line,
      title: title.slice(0, 200),
      url: urlRaw,
      description: description.slice(0, 8000),
      company: company ? company.slice(0, 200) : null,
      location: location ? location.slice(0, 200) : null,
      isPublic,
    });
  }

  return { rows, issues };
}
