export const JSON_FORM_PRESETS = [
  {
    id: "profile",
    title: "Profile",
    description:
      "Combine required text and integer fields with defaults and a choice.",
    detail:
      "Name must contain at least two characters and age must be between 0 and 130. Role and active status start with defaults. Submit to see strings, an integer, and a boolean in the JSON output.",
    schema: {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      title: "Profile",
      additionalProperties: false,
      properties: {
        name: { type: "string", title: "Name", minLength: 2 },
        age: { type: "integer", title: "Age", minimum: 0, maximum: 130 },
        role: {
          type: "string",
          title: "Role",
          enum: ["viewer", "editor", "admin"],
          default: "viewer",
        },
        active: { type: "boolean", title: "Active", default: true },
      },
      required: ["name", "age"],
    },
  },
  {
    id: "string",
    title: "String",
    description: "Validate text length, pattern, and format.",
    detail:
      "Enter a display name and an email address. Both are text inputs; format: email checks the value on submit and does not change the control into an email input.",
    schema: {
      type: "object",
      title: "Text fields",
      additionalProperties: false,
      properties: {
        displayName: {
          type: "string",
          title: "Display name",
          minLength: 2,
          maxLength: 30,
        },
        email: { type: "string", title: "Email", format: "email" },
        code: {
          type: "string",
          title: "Code",
          pattern: "^[A-Z]{2}$",
          description: "Two uppercase letters.",
        },
      },
      required: ["displayName", "email"],
    },
  },
  {
    id: "number",
    title: "Number",
    description: "Accept a decimal number and validate its bounds.",
    detail:
      "The amount control accepts decimals. Minimum, maximum, and multipleOf are checked on submit; its JSON value is a number, not text.",
    schema: {
      type: "object",
      title: "Decimal amount",
      additionalProperties: false,
      properties: {
        amount: {
          type: "number",
          title: "Amount",
          minimum: 0,
          maximum: 100,
          multipleOf: 0.5,
        },
      },
      required: ["amount"],
    },
  },
  {
    id: "integer",
    title: "Integer",
    description: "Require a whole number within a range.",
    detail:
      "Quantity uses a number input with step 1. The schema still validates that the submitted JSON value is an integer between 1 and 20.",
    schema: {
      type: "object",
      title: "Quantity",
      additionalProperties: false,
      properties: {
        quantity: {
          type: "integer",
          title: "Quantity",
          minimum: 1,
          maximum: 20,
        },
      },
      required: ["quantity"],
    },
  },
  {
    id: "boolean",
    title: "Boolean",
    description: "Use a checkbox and a false default.",
    detail:
      "The checkbox starts unchecked. Toggle it and submit to see a JSON boolean; reset returns it to false.",
    schema: {
      type: "object",
      title: "Preferences",
      additionalProperties: false,
      properties: {
        notifications: {
          type: "boolean",
          title: "Notifications",
          default: false,
        },
      },
    },
  },
  {
    id: "enum",
    title: "Enum",
    description: "Select typed string, number, integer, and boolean values.",
    detail:
      "Each enum renders as a select. Option text is for display; submitting preserves the schema's string, number, integer, or boolean type.",
    schema: {
      type: "object",
      title: "Typed choices",
      additionalProperties: false,
      properties: {
        color: { type: "string", title: "Color", enum: ["red", "blue"] },
        ratio: { type: "number", title: "Ratio", enum: [0.5, 1.5] },
        priority: { type: "integer", title: "Priority", enum: [1, 2] },
        enabled: { type: "boolean", title: "Enabled", enum: [true, false] },
      },
      required: ["color", "ratio", "priority", "enabled"],
    },
  },
  {
    id: "object",
    title: "Nested object",
    description: "Group related fields under a nested object.",
    detail:
      "Contact is a nested object. Its email field is required inside that object. Submit to see contact as a JSON object rather than a flat field.",
    schema: {
      type: "object",
      title: "Contact details",
      additionalProperties: false,
      properties: {
        contact: {
          type: "object",
          title: "Contact",
          additionalProperties: false,
          properties: {
            email: { type: "string", title: "Email", format: "email" },
            city: { type: "string", title: "City" },
          },
          required: ["email"],
        },
      },
    },
  },
  {
    id: "array",
    title: "Array",
    description: "Add and remove primitive and object items.",
    detail:
      "Tags are strings and contacts are objects, each in a homogeneous array. Add and remove items, then submit to see JSON arrays. Tags require at least one item and allow at most three.",
    schema: {
      type: "object",
      title: "Lists",
      additionalProperties: false,
      properties: {
        tags: {
          type: "array",
          title: "Tags",
          items: { type: "string", title: "Tag", minLength: 1 },
          minItems: 1,
          maxItems: 3,
        },
        contacts: {
          type: "array",
          title: "Contacts",
          items: {
            type: "object",
            title: "Contact",
            additionalProperties: false,
            properties: {
              name: { type: "string", title: "Name" },
              active: { type: "boolean", title: "Active" },
            },
            required: ["name"],
          },
        },
      },
    },
  },
  {
    id: "switch",
    title: "Switch",
    description: "Toggle a boolean with a switch and restore its default.",
    detail:
      'Add "x-widget": "switch" to a boolean field. Notifications starts on; toggle it and submit to see true or false, then reset to restore true. The annotation changes the control while the schema still validates a boolean.',
    schema: {
      type: "object",
      title: "Notification settings",
      additionalProperties: false,
      properties: {
        notifications: {
          type: "boolean",
          title: "Notifications",
          description: "Receive updates about your account.",
          "x-widget": "switch",
          default: true,
        },
      },
      required: ["notifications"],
    },
  },
  {
    id: "radio-group",
    title: "Radio group",
    description: "Choose one typed enum value from a radio group.",
    detail:
      'Add "x-widget": "radio-group" to a primitive enum field. Select one option in each group; the JSON output preserves strings, numbers, integers, and booleans. Reset restores each default choice. Delivery demonstrates a horizontal layout and Ratio an explicit vertical layout. Set x-widget-options.orientation to horizontal or vertical; omitted orientation defaults to vertical. Horizontal options wrap on narrow screens.',
    schema: {
      type: "object",
      title: "Single choices",
      additionalProperties: false,
      properties: {
        delivery: {
          type: "string",
          title: "Delivery",
          description:
            "Choose one delivery schedule. Horizontal layout; options wrap on narrow screens.",
          "x-widget": "radio-group",
          "x-widget-options": { orientation: "horizontal" },
          enum: ["daily", "weekly", "monthly"],
          default: "weekly",
        },
        ratio: {
          type: "number",
          title: "Ratio",
          description: "Vertical layout; options are stacked.",
          "x-widget": "radio-group",
          "x-widget-options": { orientation: "vertical" },
          enum: [0.5, 1.5],
          default: 0.5,
        },
        priority: {
          type: "integer",
          title: "Priority",
          "x-widget": "radio-group",
          enum: [1, 2, 3],
          default: 1,
        },
        enabled: {
          type: "boolean",
          title: "Enabled",
          "x-widget": "radio-group",
          enum: [true, false],
          default: false,
        },
      },
      required: ["delivery", "ratio", "priority", "enabled"],
    },
  },
  {
    id: "checkbox-group",
    title: "Checkbox group",
    description: "Select multiple typed enum values into a unique array.",
    detail:
      'Add "x-widget": "checkbox-group" to an array with uniqueItems: true and a primitive enum item schema. Choose one or two options in each group. Submit to see string, number, and boolean arrays; selection limits are validated on submit. Reset restores the default selections. Topics demonstrates a horizontal layout and Ratios an explicit vertical layout. Set x-widget-options.orientation to horizontal or vertical; omitted orientation defaults to vertical. Horizontal options wrap on narrow screens.',
    schema: {
      type: "object",
      title: "Multiple choices",
      additionalProperties: false,
      properties: {
        topics: {
          type: "array",
          title: "Topics",
          description:
            "Choose one or two topics. Horizontal layout; options wrap on narrow screens.",
          "x-widget": "checkbox-group",
          "x-widget-options": { orientation: "horizontal" },
          items: { type: "string", enum: ["updates", "events", "releases"] },
          uniqueItems: true,
          minItems: 1,
          maxItems: 2,
          default: ["updates"],
        },
        ratios: {
          type: "array",
          title: "Ratios",
          description: "Vertical layout; options are stacked.",
          "x-widget": "checkbox-group",
          "x-widget-options": { orientation: "vertical" },
          items: { type: "number", enum: [0.5, 1.5, 2.5] },
          uniqueItems: true,
          minItems: 1,
          maxItems: 2,
          default: [0.5],
        },
        flags: {
          type: "array",
          title: "Flags",
          "x-widget": "checkbox-group",
          items: { type: "boolean", enum: [true, false] },
          uniqueItems: true,
          minItems: 1,
          maxItems: 2,
          default: [true],
        },
      },
      required: ["topics", "ratios", "flags"],
    },
  },
  {
    id: "cascader",
    title: "Cascader",
    description: "Select a complete path through a hierarchy.",
    detail:
      'Choose a region and country. Cascader submits a JSON path array, such as ["americas", "canada"], with the original item type. The item enum includes every node and x-options defines parent-child relationships. Incomplete, disabled, or unrelated paths fail validation. Reset restores the default path.',
    schema: {
      type: "object",
      title: "Cascader example",
      additionalProperties: false,
      properties: {
        destination: {
          type: "array",
          title: "Destination",
          "x-widget": "cascader",
          default: ["americas", "canada"],
          items: {
            type: "string",
            enum: ["americas", "canada", "us", "europe", "france", "germany"],
          },
          minItems: 2,
          "x-options": [
            {
              value: "americas",
              label: "Americas",
              children: [
                {
                  value: "canada",
                  label: "Canada",
                },
                {
                  value: "us",
                  label: "United States",
                },
              ],
            },
            {
              value: "europe",
              label: "Europe",
              children: [
                {
                  value: "france",
                  label: "France",
                },
                {
                  value: "germany",
                  label: "Germany",
                },
              ],
            },
          ],
        },
      },
      required: ["destination"],
    },
  },
  {
    id: "checkbox",
    title: "Checkbox",
    description: "Edit a single boolean using a checkbox.",
    detail:
      "Add x-widget: checkbox to a boolean field. The checked state submits true or false; required requires the property to exist and does not require true. An enum such as [true] can require acceptance. Reset restores the false default.",
    schema: {
      type: "object",
      title: "Checkbox example",
      additionalProperties: false,
      properties: {
        updates: {
          type: "boolean",
          title: "Receive updates",
          "x-widget": "checkbox",
          default: false,
        },
      },
      required: ["updates"],
    },
  },
  {
    id: "color-picker",
    title: "ColorPicker",
    description: "Choose and submit a six-digit hex color.",
    detail:
      "Open the color picker and change the color. The JSON value is a string such as #2563eb, validated as exactly six hex digits. Reset restores the default color. Invalid defaults remain submitted candidates until corrected; generated controls do not replace stored values with their display normalization.",
    schema: {
      type: "object",
      title: "ColorPicker example",
      additionalProperties: false,
      properties: {
        brandColor: {
          type: "string",
          title: "Brand color",
          "x-widget": "color-picker",
          default: "#2563eb",
        },
      },
      required: ["brandColor"],
    },
  },
  {
    id: "date-picker",
    title: "DatePicker",
    description: "Choose a calendar date as a JSON string.",
    detail:
      "Pick a date and submit a real calendar date in YYYY-MM-DD format, without a timezone conversion. The date widget validates its date contract as well as any schema constraints. Clearing omits the property; because this example requires it, select another date before submitting. Reset restores the default.",
    schema: {
      type: "object",
      title: "DatePicker example",
      additionalProperties: false,
      properties: {
        dueDate: {
          type: "string",
          title: "Due date",
          "x-widget": "date-picker",
          default: "2026-10-12",
          format: "date",
        },
      },
      required: ["dueDate"],
    },
  },
  {
    id: "dm-date-picker",
    title: "DmDatePicker",
    description: "Use the date picker with the Dm presentation.",
    detail:
      "DmDatePicker submits the same real YYYY-MM-DD string contract as DatePicker and uses the Dm component presentation. Clearing a required date produces a validation error. Change the date and reset to restore 2026-10-20.",
    schema: {
      type: "object",
      title: "DmDatePicker example",
      additionalProperties: false,
      properties: {
        startDate: {
          type: "string",
          title: "Start date",
          "x-widget": "dm-date-picker",
          default: "2026-10-20",
          format: "date",
        },
      },
      required: ["startDate"],
    },
  },
  {
    id: "mentions",
    title: "Mentions",
    description: "Suggest names while editing a complete text string.",
    detail:
      "Mentions submits the full text, including inserted @mentions, as one JSON string. Optional flat string x-options supplies suggestion values and labels; this field has no enum. Type @ and choose a suggestion. Reset restores the complete default message.",
    schema: {
      type: "object",
      title: "Mentions example",
      additionalProperties: false,
      properties: {
        message: {
          type: "string",
          title: "Message",
          "x-widget": "mentions",
          default: "Hello @ada ",
          minLength: 1,
          "x-options": [
            {
              value: "ada",
              label: "Ada",
            },
            {
              value: "lin",
              label: "Lin",
            },
            {
              value: "sam",
              label: "Sam",
            },
          ],
        },
      },
      required: ["message"],
    },
  },
  {
    id: "otp-input",
    title: "OtpInput",
    description: "Keep one-time codes as strings with leading zeroes.",
    detail:
      "OtpInput uses a string schema and x-widget-options.length from 1 to 8, defaulting to 6. The widget validates exactly that many digits in addition to schema constraints. This code starts at 001234; its leading zeroes survive submission. Reset restores the string.",
    schema: {
      type: "object",
      title: "OtpInput example",
      additionalProperties: false,
      properties: {
        code: {
          type: "string",
          title: "Verification code",
          "x-widget": "otp-input",
          default: "001234",
          "x-widget-options": {
            length: 6,
          },
        },
      },
      required: ["code"],
    },
  },
  {
    id: "radio",
    title: "Radio",
    description: "Choose one typed value with Radio controls.",
    detail:
      "Add x-widget: radio to a primitive enum, optionally with x-options labels. This example submits an integer priority and a boolean decision. Required radio groups and enum membership validate on submit. Reset restores priority 1 and false.",
    schema: {
      type: "object",
      title: "Radio example",
      additionalProperties: false,
      properties: {
        priority: {
          type: "integer",
          title: "Priority",
          "x-widget": "radio",
          default: 1,
          enum: [1, 2, 3],
          "x-options": [
            {
              value: 1,
              label: "Normal",
            },
            {
              value: 2,
              label: "High",
            },
            {
              value: 3,
              label: "Urgent",
            },
          ],
        },
        enabled: {
          type: "boolean",
          title: "Enabled",
          "x-widget": "radio",
          default: false,
          enum: [false, true],
          "x-options": [
            {
              value: false,
              label: "Off",
            },
            {
              value: true,
              label: "On",
            },
          ],
        },
      },
      required: ["priority", "enabled"],
    },
  },
  {
    id: "rate",
    title: "Rate",
    description: "Choose whole-star and half-star numeric ratings.",
    detail:
      "Rate requires a number or integer without enum. x-widget-options.count is an integer from 1 to 20, defaulting to 5; allowHalf defaults to false and cannot be true for an integer schema. Ratings submit as numbers. Reset restores the whole and half-star defaults.",
    schema: {
      type: "object",
      title: "Rate example",
      additionalProperties: false,
      properties: {
        quality: {
          type: "integer",
          title: "Quality",
          "x-widget": "rate",
          default: 4,
          minimum: 0,
          maximum: 5,
          "x-widget-options": {
            count: 5,
          },
        },
        experience: {
          type: "number",
          title: "Experience",
          "x-widget": "rate",
          default: 3.5,
          minimum: 0,
          maximum: 5,
          multipleOf: 0.5,
          "x-widget-options": {
            count: 5,
            allowHalf: true,
          },
        },
      },
      required: ["quality", "experience"],
    },
  },
  {
    id: "segmented",
    title: "Segmented",
    description: "Choose a typed enum using segmented buttons.",
    detail:
      "Segmented requires a primitive enum and at least one enabled option. Optional x-options supplies labels and disabled states with exact enum coverage. The selected value preserves its original type. Without a default the first enabled choice initializes; this example explicitly defaults to the numeric value 1. Reset restores it.",
    schema: {
      type: "object",
      title: "Segmented example",
      additionalProperties: false,
      properties: {
        view: {
          type: "integer",
          title: "View",
          "x-widget": "segmented",
          default: 1,
          enum: [0, 1, 2],
          "x-options": [
            {
              value: 0,
              label: "List",
            },
            {
              value: 1,
              label: "Grid",
            },
            {
              value: 2,
              label: "Board",
            },
          ],
        },
      },
      required: ["view"],
    },
  },
  {
    id: "select",
    title: "Select",
    description: "Select typed scalar values and unique arrays.",
    detail:
      "Select accepts a primitive enum or an array with uniqueItems: true and primitive enum items. Optional flat x-options provides display labels while index decoding preserves numbers and booleans. Change the single choice or multiple choices and submit; reset restores every default. Clearing required scalar choices omits them.",
    schema: {
      type: "object",
      title: "Select example",
      additionalProperties: false,
      properties: {
        role: {
          type: "string",
          title: "Role",
          "x-widget": "select",
          default: "viewer",
          enum: ["viewer", "editor", "admin"],
          "x-options": [
            {
              value: "viewer",
              label: "Viewer",
            },
            {
              value: "editor",
              label: "Editor",
            },
            {
              value: "admin",
              label: "Administrator",
            },
          ],
        },
        ratio: {
          type: "number",
          title: "Ratio",
          "x-widget": "select",
          default: 0.5,
          enum: [0.5, 1.5],
        },
        enabled: {
          type: "boolean",
          title: "Enabled",
          "x-widget": "select",
          default: false,
          enum: [false, true],
        },
        flags: {
          type: "array",
          title: "Flags",
          "x-widget": "select",
          default: [false],
          uniqueItems: true,
          items: {
            type: "boolean",
            enum: [false, true],
          },
        },
      },
      required: ["role", "ratio", "enabled", "flags"],
    },
  },
  {
    id: "slider",
    title: "Slider",
    description: "Adjust a bounded numeric value with a slider.",
    detail:
      "Slider requires a number or integer without enum. x-widget-options accepts finite min, max, and positive step with min < max; integer sliders require integer bounds and step. Defaults come from minimum (or 0), maximum (or 100), and multipleOf (or 1). This example explicitly uses 0 to 1 in steps of 0.1 and submits a number. Reset restores 0.5.",
    schema: {
      type: "object",
      title: "Slider example",
      additionalProperties: false,
      properties: {
        opacity: {
          type: "number",
          title: "Opacity",
          "x-widget": "slider",
          default: 0.5,
          minimum: 0,
          maximum: 1,
          multipleOf: 0.1,
          "x-widget-options": {
            min: 0,
            max: 1,
            step: 0.1,
          },
        },
      },
      required: ["opacity"],
    },
  },
  {
    id: "time-picker",
    title: "TimePicker",
    description: "Enter a local 24-hour clock time without a timezone.",
    detail:
      "TimePicker requires a string in HH:mm:ss, using a real 24-hour time. Submit keeps the local clock string, such as 09:30:00, without converting it to a Date or inventing a timezone. Partial input remains editable and fails validation until complete. Clearing omits the property; reset restores the default.",
    schema: {
      type: "object",
      title: "TimePicker example",
      additionalProperties: false,
      properties: {
        meetingTime: {
          type: "string",
          title: "Meeting time",
          "x-widget": "time-picker",
          default: "09:30:00",
        },
      },
      required: ["meetingTime"],
    },
  },
  {
    id: "transfer",
    title: "Transfer",
    description: "Move string choices into a unique selected array.",
    detail:
      'Transfer requires a unique array of strings whose item enum defines the available keys. Optional flat x-options supplies labels with exact enum coverage. Move choices between lists and submit the selected string keys; reset restores ["design"]. Array limits and enum membership still validate.',
    schema: {
      type: "object",
      title: "Transfer example",
      additionalProperties: false,
      properties: {
        teams: {
          type: "array",
          title: "Teams",
          "x-widget": "transfer",
          default: ["design"],
          uniqueItems: true,
          items: {
            type: "string",
            enum: ["design", "engineering", "support"],
          },
          "x-options": [
            {
              value: "design",
              label: "Design",
            },
            {
              value: "engineering",
              label: "Engineering",
            },
            {
              value: "support",
              label: "Support",
            },
          ],
        },
      },
      required: ["teams"],
    },
  },
  {
    id: "tree-select",
    title: "TreeSelect",
    description: "Select hierarchical values as a scalar or a unique array.",
    detail:
      "TreeSelect requires x-options hierarchy whose globally unique values cover the string or numeric enum exactly. A scalar field submits one node value; a unique enum array submits independently selected node values, without cascading parent selections to children. Reset restores both defaults.",
    schema: {
      type: "object",
      title: "TreeSelect example",
      additionalProperties: false,
      properties: {
        department: {
          type: "integer",
          title: "Department",
          "x-widget": "tree-select",
          default: 2,
          enum: [1, 2, 3],
          "x-options": [
            {
              value: 1,
              label: "Company",
              children: [
                {
                  value: 2,
                  label: "Design",
                },
                {
                  value: 3,
                  label: "Engineering",
                },
              ],
            },
          ],
        },
        teams: {
          type: "array",
          title: "Teams",
          "x-widget": "tree-select",
          default: ["design"],
          uniqueItems: true,
          items: {
            type: "string",
            enum: ["company", "design", "engineering"],
          },
          "x-options": [
            {
              value: "company",
              label: "Company",
              children: [
                {
                  value: "design",
                  label: "Design",
                },
                {
                  value: "engineering",
                  label: "Engineering",
                },
              ],
            },
          ],
        },
      },
      required: ["department", "teams"],
    },
  },
  {
    id: "upload",
    title: "Upload",
    description: "Choose local files and submit their metadata.",
    detail:
      "Upload is a local file chooser. Submitted JSON contains only name, size, type, and lastModified metadata; it contains no file contents and sends no network upload. The field is a unique array of objects with exactly those four required string/integer property schemas. Choose or remove files to edit the array. Reset restores the empty default list.",
    schema: {
      type: "object",
      title: "Upload example",
      additionalProperties: false,
      properties: {
        files: {
          type: "array",
          title: "Files",
          "x-widget": "upload",
          default: [],
          uniqueItems: true,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: {
                type: "string",
              },
              size: {
                type: "integer",
                minimum: 0,
              },
              type: {
                type: "string",
              },
              lastModified: {
                type: "integer",
                minimum: 0,
              },
            },
            required: ["name", "size", "type", "lastModified"],
          },
        },
      },
      required: ["files"],
    },
  },
] as const;

export type JsonFormPresetId = (typeof JSON_FORM_PRESETS)[number]["id"];
