import { describe, expect, test } from "vitest";
import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  test("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Volcán de Chocolate")).toBe("volcan-de-chocolate");
  });

  test("strips accents/diacritics", () => {
    expect(slugify("Camarón al ajíllo")).toBe("camaron-al-ajillo");
  });

  test("collapses consecutive non-alphanumeric characters into a single hyphen", () => {
    expect(slugify("Entradas & Bebidas!!")).toBe("entradas-bebidas");
  });

  test("trims leading and trailing hyphens", () => {
    expect(slugify("  ¡Festival del Chicharrón!  ")).toBe("festival-del-chicharron");
  });

  test("leaves numbers intact", () => {
    expect(slugify("Combo 2x1")).toBe("combo-2x1");
  });

  test("returns an empty string for input with no alphanumeric characters", () => {
    expect(slugify("¡¡¡!!!")).toBe("");
  });
});
