import { configure } from "@deepracticex/bdd";

await configure({
  features: ["bdd/journeys/**/*.feature", "bdd/features/**/*.feature"],
  steps: ["bdd/support/**/*.ts", "bdd/steps/**/*.ts"],
  timeout: 60_000,
});
