---
name: resource-management
description: Manage ResourceX resources, register prototypes, and load skills. Use when you need to add, search, distribute, or inspect resources in RoleX, or when you need to register a prototype or load a skill on demand.
---

Feature: ResourceX Concepts
  ResourceX is the resource system that powers RoleX's content management.
  Resources are versioned, typed content bundles stored locally or in a registry.

  Scenario: What is a resource
    Given a resource is a directory containing content and metadata
    Then it has a resource.json manifest defining name, type, tag, and author
    And it contains content files specific to its type (e.g. .feature files, SKILL.md)
    And it is identified by a locator string

  Scenario: Locator formats
    Given a locator is how you reference a resource
    Then it can be a registry identifier — name:tag or author/name:tag
    And it can be a local directory path — ./path/to/resource or /absolute/path
    And it can be a URL — https://github.com/org/repo/tree/main/path
    And when tag is omitted, it defaults to latest

  Scenario: Resource types in RoleX
    Given RoleX registers two resource types with ResourceX
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
    And tag is the version string

  Scenario: Storage location
    Given resources are stored locally at ~/.deepractice/resourcex by default
    And the location is configurable via LocalPlatform resourceDir option
    And prototype registrations are stored at ~/.deepractice/rolex/prototype.json

Feature: Resource Lifecycle
  Add, inspect, and remove resources from the local store.

  Scenario: search — find available resources
    Given you want to discover what resources are available
    When you call search with an optional query
    Then it returns a list of matching locator strings
    And parameters are:
      """
      rolex resource search [QUERY]

      ARGUMENTS:
        QUERY    Search query (optional — omit to list all)
      """
    And example:
      """
      rolex resource search nuwa
      rolex resource search            # list all resources
      """

  Scenario: has — check if a resource exists
    Given you want to verify a resource is available before using it
    When you call has with a locator
    Then it returns "yes" or "no"
    And exit code is 0 for yes, 1 for no
    And parameters are:
      """
      rolex resource has <LOCATOR>

      ARGUMENTS:
        LOCATOR    Resource locator (required)
      """

  Scenario: info — inspect resource metadata
    Given you want to see a resource's full metadata
    When you call info with a locator
    Then it returns a JSON object with name, type, tag, author, description, path, files, etc.
    And parameters are:
      """
      rolex resource info <LOCATOR>

      ARGUMENTS:
        LOCATOR    Resource locator (required)
      """
    And example:
      """
      rolex resource info nuwa:0.1.0
      """

  Scenario: add — import a resource from a local directory
    Given you have a resource directory with resource.json
    When you call add with the directory path
    Then the resource is copied into the local store
    And it becomes available via its locator (name:tag)
    And parameters are:
      """
      rolex resource add <PATH>

      ARGUMENTS:
        PATH    Path to resource directory (required)
      """
    And example:
      """
      rolex resource add ./prototypes/roles/nuwa
      """

  Scenario: remove — delete a resource from the local store
    Given you want to remove a resource that is no longer needed
    When you call remove with its locator
    Then the resource is deleted from the local store
    And parameters are:
      """
      rolex resource remove <LOCATOR>

      ARGUMENTS:
        LOCATOR    Resource locator (required)
      """
    And example:
      """
      rolex resource remove nuwa:0.1.0
      """

Feature: Registry Configuration
  Manage which remote registries are available for push and pull.
  Configuration is shared with ResourceX at ~/.deepractice/resourcex/config.json.

  Scenario: registry list — show configured registries
    Given you want to see which registries are available
    When you call registry list
    Then it shows all configured registries with their names and URLs
    And the default registry is marked
    And parameters are:
      """
      rolex resource registry list
      """

  Scenario: registry add — add a new registry
    Given you want to connect to a remote registry
    When you call registry add with a name and URL
    Then the registry is saved to configuration
    And the first added registry automatically becomes the default
    And parameters are:
      """
      rolex resource registry add <NAME> <URL> [--default]

      ARGUMENTS:
        NAME       Registry name (required)
        URL        Registry URL (required)
      OPTIONS:
        --default  Set as default registry
      """
    And example:
      """
      rolex resource registry add deepractice https://registry.deepractice.dev
      """

  Scenario: registry remove — remove a registry
    Given you no longer need a registry
    When you call registry remove with its name
    Then the registry is removed from configuration
    And parameters are:
      """
      rolex resource registry remove <NAME>
      """

  Scenario: registry set-default — change the default registry
    Given you have multiple registries and want to switch the default
    When you call registry set-default with a name
    Then that registry becomes the default for push and pull
    And parameters are:
      """
      rolex resource registry set-default <NAME>
      """

Feature: Resource Distribution
  Push and pull resources to/from a remote registry.
  Uses the default registry unless overridden with --registry.

  Scenario: push — publish a resource to the remote registry
    Given you want to share a resource with others
    When you call push with a locator of a locally stored resource
    Then the resource is uploaded to the configured remote registry
    And parameters are:
      """
      rolex resource push <LOCATOR> [--registry <URL>]

      ARGUMENTS:
        LOCATOR              Resource locator (required, must exist locally)
      OPTIONS:
        --registry <URL>     Override default registry for this operation
      """
    And example:
      """
      rolex resource push nuwa:0.1.0
      rolex resource push my-skill:0.1.0 --registry https://registry.deepractice.dev
      """

  Scenario: pull — download a resource from the remote registry
    Given you want to obtain a resource from the registry
    When you call pull with a locator
    Then the resource is downloaded to the local store
    And it becomes available for local use
    And parameters are:
      """
      rolex resource pull <LOCATOR> [--registry <URL>]

      ARGUMENTS:
        LOCATOR              Resource locator (required)
      OPTIONS:
        --registry <URL>     Override default registry for this operation
      """
    And example:
      """
      rolex resource pull deepractice/nuwa:0.1.0
      """

Feature: Prototype Registration
  Register a ResourceX source as a role or organization prototype.
  Prototypes provide inherited state that merges with an individual's instance state on activation.

  Scenario: What is a prototype
    Given an individual's state has two origins — prototype and instance
    Then prototype state comes from organizational definitions (read-only)
    And instance state is created by the individual through execution (mutable)
    And on activation, both are merged into a virtual combined state

  Scenario: prototype — register a ResourceX source
    Given you have a role or organization resource
    When you call prototype with the source path or locator
    Then the resource is ingested and its id is extracted
    And the id → source mapping is stored in prototype.json
    And on subsequent activations, the prototype state is loaded from this source
    And parameters are:
      """
      rolex prototype <SOURCE>

      ARGUMENTS:
        SOURCE    ResourceX source — local path or locator (required)
      """
    And example:
      """
      rolex prototype ./prototypes/roles/nuwa
      rolex prototype https://github.com/Deepractice/RoleX/tree/main/prototypes/roles/nuwa
      """

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

Feature: Resource Loading
  Load resources on demand for execution or skill injection.

  Scenario: skill — load full skill content by locator
    Given a role has a procedure referencing a skill via locator
    When you need the detailed instructions beyond the procedure summary
    Then call skill with the locator from the procedure's Feature description
    And the full SKILL.md content is returned with metadata header
    And this is progressive disclosure layer 2 — on-demand knowledge injection
    And parameters are:
      """
      rolex role skill <LOCATOR>

      ARGUMENTS:
        LOCATOR    ResourceX locator for the skill (required)
      """
    And example:
      """
      rolex role skill deepractice/skill-creator
      rolex role skill https://github.com/Deepractice/RoleX/tree/main/skills/skill-creator
      """

  Scenario: use — interact with an external resource
    Given you need to execute or interact with a resource beyond just reading it
    When you call use with a locator
    Then the resource is ingested and its resolved content is returned
    And the return type depends on the resource — string, binary, or JSON
    And this is progressive disclosure layer 3 — execution
    And parameters are:
      """
      rolex role use <LOCATOR>

      ARGUMENTS:
        LOCATOR    Resource locator (required)
      """

  Scenario: Progressive disclosure — three layers
    Given RoleX uses progressive disclosure to manage context
    Then layer 1 — procedure: metadata loaded at activate time (role knows what skills exist)
    And layer 2 — skill: full instructions loaded on demand via skill(locator)
    And layer 3 — use: execution of external resources via use(locator)
    And each layer adds detail only when needed, keeping context lean

Feature: Common Workflows
  Typical sequences of operations for resource management.

  Scenario: Publish a local skill to the system
    Given you have a skill directory with SKILL.md and resource.json
    When you want to make it available in RoleX
    Then follow this sequence:
      """
      1. rolex resource add ./skills/my-skill       # import to local store
      2. rolex resource info my-skill:0.1.0          # verify metadata
      3. rolex role skill my-skill:0.1.0             # test loading
      4. rolex resource push my-skill:0.1.0          # publish to registry (optional)
      """

  Scenario: Register a role prototype from GitHub
    Given you have a role prototype hosted on GitHub
    When you want to use it as a prototype in RoleX
    Then follow this sequence:
      """
      1. rolex prototype https://github.com/org/repo/tree/main/prototypes/roles/my-role
      2. rolex role activate my-role                 # verify activation with prototype
      """

  Scenario: Register a local role prototype
    Given you have a role prototype directory locally
    When you want to register it
    Then follow this sequence:
      """
      1. rolex prototype ./prototypes/roles/my-role
      2. rolex role activate my-role                 # verify activation
      """

  Scenario: Update a resource version
    Given you modified a resource and bumped its tag in resource.json
    When you want to update the local store
    Then call add again — it imports as a new version
    And the old version remains available by its old tag
    And example:
      """
      rolex resource add ./skills/my-skill           # now my-skill:0.2.0
      rolex resource info my-skill:0.2.0             # verify new version
      """
