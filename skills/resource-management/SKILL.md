---
name: resource-management
description: Manage ResourceX resources, register prototypes, and load skills. Use when you need to add, search, distribute, or inspect resources in RoleX, or when you need to register a prototype or load a skill on demand.
---

Feature: ResourceX Concepts
  ResourceX is the resource system that powers RoleX's content management.
  Resources are typed content bundles identified by tag and digest,
  stored locally in a CAS (Content-Addressable Storage) or in a remote registry.

  Scenario: What is a resource
    Given a resource is a directory containing content and metadata
    Then it has a resource.json manifest defining name, type, tag, and author
    And it contains content files specific to its type (e.g. .feature files, SKILL.md)
    And it is identified by a locator string

  Scenario: Tag + digest model
    Given ResourceX uses a tag + digest model similar to Docker
    Then tag is a human-readable label — like "stable" or "0.1.0"
    And tag is mutable — the same tag can point to different content over time
    And digest is a sha256 content fingerprint — deterministic and immutable
    And digest is computed from the archive's file-level hashes
    And the format is sha256:<64-char-hex>
    And content uniqueness is guaranteed by digest, not by tag

  Scenario: Locator formats
    Given a locator is how you reference a resource
    Then it can be just a name — nuwa (tag defaults to latest)
    And it can be a name with digest — name@sha256:abc123...
    And it can include a path — path/name:tag (e.g. prompts/hello:stable)
    And it can include a registry — registry.example.com/name:tag
    And it can be a local directory path — ./path/to/resource or /absolute/path
    And when tag is omitted, it defaults to latest

  Scenario: Resource types in RoleX
    Given RoleX registers resource types with ResourceX
    Then "role" type — individual manifests with .feature files (alias: "individual")
    And "organization" type — organization manifests with .feature files (alias: "org")
    And "skill" type — SKILL.md files loaded via the skill process

  Scenario: resource.json structure
    Given every resource directory must contain a resource.json
    Then the structure is:
      """
      {
        "name": "my-resource",
        "type": "role",
        "tag": "0.1.0",
        "author": "deepractice",
        "description": "What this resource is"
      }
      """
    And name is the resource identifier
    And type determines how the resource is resolved (role, organization, skill)
    And tag is a human-readable label, not a semantic version — omit for latest

  Scenario: Storage location
    Given resources are stored locally at ~/.deepractice/resourcex by default
    And the location is configurable via LocalPlatform resourceDir option
    And prototype registrations are stored at ~/.deepractice/rolex/prototype.json

Feature: Resource Operations
  Manage resources through the use tool with !resource namespace.
  Operations cover the full lifecycle: add, push, pull, search, remove.

  Scenario: add — import a resource from a local directory
    Given you have a resource directory with resource.json
    When you call use("!resource.add", { path: "/absolute/path/to/resource" })
    Then the resource is archived and stored in local CAS
    And it gets a digest computed from its content
    And it can then be pushed to a remote registry

  Scenario: push — publish a resource to a remote registry
    Given a resource has been added to local CAS
    When you call use("!resource.push", { locator: "name:tag" })
    Then the resource archive is uploaded to the configured registry
    And the registry stores it by name, tag, and digest
    And optionally specify a registry: { locator: "name:tag", registry: "https://..." }

  Scenario: pull — download a resource from a remote registry
    Given a resource exists in a remote registry
    When you call use("!resource.pull", { locator: "name:tag" })
    Then the resource is downloaded and cached in local CAS
    And subsequent resolves use the local cache

  Scenario: search — find resources in local CAS
    Given you want to find resources stored locally
    When you call use("!resource.search", { query: "keyword" })
    Then matching resources are returned as locator strings

  Scenario: has — check if a resource exists locally
    Given you want to verify a resource is in local CAS
    When you call use("!resource.has", { locator: "name:tag" })
    Then returns whether the resource exists

  Scenario: remove — delete a resource from local CAS
    Given you want to remove a resource from local storage
    When you call use("!resource.remove", { locator: "name:tag" })
    Then the resource manifest is removed from local CAS

  Scenario: Typical workflow — add then push
    Given you want to publish a resource to a registry
    Then the sequence is:
      """
      1. use("!resource.add", { path: "./my-resource" })
      2. use("!resource.push", { locator: "my-resource" })
      """
    And add imports to local CAS, push uploads to registry
    And tag defaults to latest when omitted

Feature: Resource Loading via use
  Load resources on demand through the unified use entry point.
  The use tool dispatches based on locator format.

  Scenario: use — load a ResourceX resource
    Given you need to load or execute a resource
    When you call use with a regular locator (no ! prefix)
    Then the resource is resolved through ResourceX and its content returned
    And parameters are:
      """
      use("hello-prompt")                    // by registry locator (tag defaults to latest)
      use("./path/to/resource")            // by local path
      """

  Scenario: skill — load full skill content by locator
    Given a role has a procedure referencing a skill via locator
    When you need the detailed instructions beyond the procedure summary
    Then call skill with the locator from the procedure's Feature description
    And the full SKILL.md content is returned with metadata header
    And this is progressive disclosure layer 2 — on-demand knowledge injection
    And parameters are:
      """
      skill("skill-creator")                 // tag defaults to latest
      skill("/absolute/path/to/skill-directory")
      """

  Scenario: Progressive disclosure — three layers
    Given RoleX uses progressive disclosure to manage context
    Then layer 1 — procedure: metadata loaded at activate time (role knows what skills exist)
    And layer 2 — skill: full instructions loaded on demand via skill(locator)
    And layer 3 — use: execution of external resources via use(locator)
    And each layer adds detail only when needed, keeping context lean

Feature: Prototype Registration
  Register a ResourceX source as a role or organization prototype.
  Prototypes provide inherited state that merges with an individual's instance state on activation.

  Scenario: What is a prototype
    Given an individual's state has two origins — prototype and instance
    Then prototype state comes from organizational definitions (read-only)
    And instance state is created by the individual through execution (mutable)
    And on activation, both are merged into a virtual combined state

  Scenario: Prototype resource structure for a role
    Given a role prototype is a directory with:
      """
      <role-name>/
      ├── resource.json              (type: "role")
      ├── individual.json            (manifest with id, type, children tree)
      ├── <id>.individual.feature    (persona Gherkin)
      └── <child-id>.<type>.feature  (identity, background, duty, etc.)
      """
    And individual.json defines the tree structure:
      """
      {
        "id": "nuwa",
        "type": "individual",
        "alias": ["nvwa"],
        "children": {
          "identity": {
            "type": "identity",
            "children": {
              "background": { "type": "background" }
            }
          }
        }
      }
      """

  Scenario: Prototype updates
    Given you re-register a prototype with the same id
    Then the source is overwritten — latest registration wins
    And the next activation will load the updated prototype

Feature: Common Workflows
  Typical sequences of operations for resource management.

  Scenario: Publish a prototype to registry
    Given you have a prototype directory ready
    When you want to make it available via registry
    Then the sequence is:
      """
      1. use("!resource.add", { path: "/path/to/roles/nuwa" })
      2. use("!resource.push", { locator: "nuwa" })
      """
    And the prototype is now pullable by anyone with registry access

  Scenario: Update and re-push a prototype
    Given the prototype content has changed
    When you re-add and push with the same tag
    Then the registry updates the tag to point to the new digest
      """
      1. use("!resource.add", { path: "/path/to/roles/nuwa" })
      2. use("!resource.push", { locator: "nuwa" })
      """
    And consumers pulling the same tag get the updated content

  Scenario: Test loading a skill
    Given you want to verify a skill is accessible
    When you call skill with the locator
    Then the full SKILL.md content should be returned
    And example:
      """
      skill("skill-creator")
      """
