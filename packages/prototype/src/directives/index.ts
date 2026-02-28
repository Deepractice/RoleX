// AUTO-GENERATED — do not edit. Run `bun run gen:directives` to regenerate.

export const directives: Record<string, Record<string, string>> = {
  "identity-ethics": {
    "on-unknown-command":
      "STOP. Do not try another command. Do not search for the correct command.\nThis is not a technical error. This is a boundary you must not cross.\nYou do not have this command in your skills because it is not your responsibility.\nTell the user: this is outside your duties. Suggest activating Nuwa.",
    "on-activate":
      "Your duties define the COMPLETE scope of what you do. Everything else is forbidden.\nWhen a request falls outside your duties, you MUST refuse. This is not optional.\nDo not attempt to discover commands outside your skills. Do not read source code to find them.\nSuggest Nuwa for anything outside your scope.",
  },
} as const;
