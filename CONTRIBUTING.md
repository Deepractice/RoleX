# Contributing to RoleX

Thank you for your interest in contributing to RoleX!

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.0
- Node.js >= 22.0.0 (for some tooling)

### Installation

```bash
# Clone the repository
git clone https://github.com/Deepractice/RoleX.git
cd RoleX

# Install dependencies
bun install

# Build all packages
bun run build
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write tests first (TDD approach)
- Follow the existing code style
- Use CommonX utilities (see CLAUDE.md)
- Update documentation as needed

### 3. Run Quality Checks

```bash
# Format code
bun run format

# Lint code
bun run lint

# Type check
bun run typecheck

# Run tests
bun run test
bun run test:bdd
```

### 4. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add new feature"
```

Commit types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Create a Changeset

Before submitting a PR, create a changeset:

```bash
bunx changeset
```

Select the packages that changed and the version bump type (patch/minor/major).

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style

- Use TypeScript strict mode
- Use ESM modules
- Use `commonxjs` utilities
- Follow existing patterns
- Add tests for new features
- Keep commits atomic and well-described

## Testing

### Unit Tests

```bash
# Run all unit tests
bun run test

# Run specific test
bun test packages/core/tests/unit/role.test.ts
```

### BDD Tests

```bash
# Run all BDD tests
bun run test:bdd

# Run with specific tag
cd bdd && bun run test:tags "@role"
```

## Questions?

Feel free to open an issue or discussion on GitHub!
