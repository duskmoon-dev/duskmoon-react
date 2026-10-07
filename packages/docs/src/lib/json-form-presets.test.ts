import { describe, expect, test } from "bun:test";
import { compileForm } from "./json-schema-form";
import { JSON_FORM_PRESETS } from "./json-form-presets";

describe("JSON Form presets", () => {
  test("has unique routes and compilable object schemas", () => {
    expect(JSON_FORM_PRESETS.map(({ id }) => id)).toEqual([
      "profile",
      "string",
      "number",
      "integer",
      "boolean",
      "enum",
      "object",
      "array",
      "switch",
      "radio-group",
      "checkbox-group",
      "cascader",
      "checkbox",
      "color-picker",
      "date-picker",
      "dm-date-picker",
      "mentions",
      "otp-input",
      "radio",
      "rate",
      "segmented",
      "select",
      "slider",
      "time-picker",
      "transfer",
      "tree-select",
      "upload",
    ]);
    for (const preset of JSON_FORM_PRESETS) {
      expect(preset.title.length).toBeGreaterThan(0);
      expect(preset.description.length).toBeGreaterThan(0);
      expect(preset.detail.length).toBeGreaterThan(0);
      expect(compileForm(preset.schema).schema.type).toBe("object");
    }
  });

  test("typed enum choices remain valid JSON values", () => {
    const form = compileForm(
      JSON_FORM_PRESETS.find(({ id }) => id === "enum")!.schema,
    );
    expect(
      form.validate({ color: "red", ratio: 0.5, priority: 1, enabled: true })
        .valid,
    ).toBe(true);
    expect(
      form.validate({ color: "red", ratio: "0.5", priority: 1, enabled: true })
        .valid,
    ).toBe(false);
  });

  test("widget presets preserve typed defaults and validation", () => {
    const switchForm = compileForm(
      JSON_FORM_PRESETS.find(({ id }) => id === "switch")!.schema,
    );
    expect(switchForm.initialValue()).toEqual({ notifications: true });
    expect(switchForm.validate({ notifications: false }).valid).toBe(true);
    expect(switchForm.validate({ notifications: "false" }).valid).toBe(false);

    const radioForm = compileForm(
      JSON_FORM_PRESETS.find(({ id }) => id === "radio-group")!.schema,
    );
    expect(radioForm.schema.properties!.delivery["x-widget-options"]).toEqual({
      orientation: "horizontal",
    });
    expect(radioForm.schema.properties!.ratio["x-widget-options"]).toEqual({
      orientation: "vertical",
    });
    expect(
      radioForm.schema.properties!.priority["x-widget-options"],
    ).toBeUndefined();
    expect(
      radioForm.schema.properties!.enabled["x-widget-options"],
    ).toBeUndefined();
    const radioDefaults = radioForm.initialValue();
    expect(radioDefaults).toEqual({
      delivery: "weekly",
      ratio: 0.5,
      priority: 1,
      enabled: false,
    });
    expect(radioForm.validate(radioDefaults).valid).toBe(true);
    expect(radioForm.validate({ ...radioDefaults, ratio: "0.5" }).valid).toBe(
      false,
    );
    expect(radioForm.validate({ ...radioDefaults, priority: 4 }).valid).toBe(
      false,
    );

    const checkboxForm = compileForm(
      JSON_FORM_PRESETS.find(({ id }) => id === "checkbox-group")!.schema,
    );
    expect(checkboxForm.schema.properties!.topics["x-widget-options"]).toEqual({
      orientation: "horizontal",
    });
    expect(checkboxForm.schema.properties!.ratios["x-widget-options"]).toEqual({
      orientation: "vertical",
    });
    expect(
      checkboxForm.schema.properties!.flags["x-widget-options"],
    ).toBeUndefined();
    const checkboxDefaults = checkboxForm.initialValue();
    expect(checkboxDefaults).toEqual({
      topics: ["updates"],
      ratios: [0.5],
      flags: [true],
    });
    expect(checkboxForm.validate(checkboxDefaults).valid).toBe(true);
    expect(
      checkboxForm.validate({
        topics: ["events", "releases"],
        ratios: [1.5, 2.5],
        flags: [false, true],
      }).valid,
    ).toBe(true);
    for (const invalid of [
      { topics: [] },
      { topics: ["updates", "events", "releases"] },
      { ratios: [0.5, 0.5] },
      { ratios: ["0.5"] },
      { flags: ["true"] },
    ]) {
      expect(
        checkboxForm.validate({ ...checkboxDefaults, ...invalid }).valid,
      ).toBe(false);
    }
    checkboxDefaults.topics = ["events"];
    expect(checkboxForm.initialValue().topics).toEqual(["updates"]);
  });

  test("all added control presets start with explicit valid defaults", () => {
    const added = JSON_FORM_PRESETS.slice(11);
    expect(added).toHaveLength(16);
    expect(new Set(JSON_FORM_PRESETS.map(({ id }) => id)).size).toBe(27);
    for (const preset of added) {
      const form = compileForm(preset.schema);
      for (const field of Object.values(preset.schema.properties)) {
        expect(Object.hasOwn(field, "default")).toBe(true);
      }
      const defaults = form.initialValue();
      const result = form.validate(defaults);
      expect({ id: preset.id, errors: result.errors }).toEqual({
        id: preset.id,
        errors: {},
      });
      expect(result.valid).toBe(true);
      expect(JSON.parse(JSON.stringify(defaults))).toEqual(defaults);
    }
  });

  test("control presets retain number, boolean, path, code, and metadata value shapes", () => {
    const initial = (id: string) =>
      compileForm(
        JSON_FORM_PRESETS.find((preset) => preset.id === id)!.schema,
      ).initialValue();
    expect(initial("select")).toEqual({
      role: "viewer",
      ratio: 0.5,
      enabled: false,
      flags: [false],
    });
    expect(initial("cascader")).toEqual({
      destination: ["americas", "canada"],
    });
    expect(initial("tree-select")).toEqual({
      department: 2,
      teams: ["design"],
    });
    expect(initial("otp-input")).toEqual({ code: "001234" });
    expect(initial("rate")).toEqual({ quality: 4, experience: 3.5 });
    expect(initial("upload")).toEqual({ files: [] });
    const upload = compileForm(
      JSON_FORM_PRESETS.find(({ id }) => id === "upload")!.schema,
    );
    expect(
      upload.validate({
        files: [
          {
            name: "report.txt",
            size: 6,
            type: "text/plain",
            lastModified: 1700000000000,
          },
        ],
      }).valid,
    ).toBe(true);
    expect(
      upload.validate({
        files: [
          {
            name: "report.txt",
            size: "6",
            type: "text/plain",
            lastModified: 1700000000000,
          },
        ],
      }).valid,
    ).toBe(false);
    expect(
      upload.validate({
        files: [
          {
            name: "report.txt",
            size: 6,
            type: "text/plain",
            lastModified: 1700000000000,
            content: "secret",
          },
        ],
      }).valid,
    ).toBe(false);
  });

  test("provides field control demos without containers or duplicate input presets", () => {
    const ids: string[] = JSON_FORM_PRESETS.map(({ id }) => id);
    for (const id of [
      "form",
      "dm-search",
      "dm-query",
      "input",
      "input-number",
    ]) {
      expect(ids).not.toContain(id);
    }
    for (const id of [
      "cascader",
      "checkbox",
      "color-picker",
      "date-picker",
      "dm-date-picker",
      "mentions",
      "otp-input",
      "radio",
      "rate",
      "segmented",
      "select",
      "slider",
      "switch",
      "time-picker",
      "transfer",
      "tree-select",
      "upload",
    ]) {
      expect(ids).toContain(id);
    }
    for (const preset of JSON_FORM_PRESETS) {
      expect(Object.hasOwn(preset.schema, "x-layout")).toBe(false);
    }
  });
});
