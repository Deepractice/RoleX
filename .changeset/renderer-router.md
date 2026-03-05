---
"@rolexjs/prototype": minor
"rolexjs": minor
---

feat: add renderer router — direct() renders Markdown by default

- RendererRouter dispatches rendering by command prefix to business-domain renderers
- 6 renderers: RoleRenderer, IndividualRenderer, OrgRenderer, PositionRenderer, ProjectRenderer, CensusRenderer
- direct() returns rendered Markdown string; pass { raw: true } for structured data
- MCP server requires zero changes — rendering happens in rolexjs layer
- Regenerated descriptions and directives index
