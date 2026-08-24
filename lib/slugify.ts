function stripDiacritics(value: string) {
  return Array.from(value.normalize("NFD"))
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code < 0x0300 || code > 0x036f; // drop combining marks
    })
    .join("");
}

export function slugify(value: string) {
  return stripDiacritics(value.toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
