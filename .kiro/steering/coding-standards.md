---
inclusion: auto
---

# Coding Standards and Best Practices

## Documentation Generation Rules

### Markdown Documentation

**IMPORTANT:** Do NOT automatically generate markdown documentation files unless explicitly requested by the user.

#### When NOT to create documentation:
- ❌ After completing a task or feature
- ❌ As a "summary" of work done
- ❌ To document changes made
- ❌ As a default behavior after any code changes

#### When TO create documentation:
- ✅ User explicitly requests documentation in the spec or task
- ✅ User asks for a README or guide
- ✅ Documentation is a specific requirement in the specification
- ✅ User says "create documentation" or "document this"

#### Rationale:
- Reduces noise in the repository
- Prevents unnecessary file clutter
- Documentation should be intentional, not automatic
- Users can request documentation when they need it

### Code Comments

Code comments are always appropriate and should be:
- Clear and concise
- Explain "why" not "what"
- Updated when code changes
- Written for future maintainers

### Example Scenarios

**Scenario 1: Performance Optimization**
```
User: "Fix the slow product loading"
✅ DO: Fix the code, add code comments
❌ DON'T: Create PERFORMANCE_FIX.md, CHANGES.md, SUMMARY.md
```

**Scenario 2: Explicit Documentation Request**
```
User: "Fix the slow product loading and document the changes"
✅ DO: Fix the code AND create documentation
```

**Scenario 3: Spec with Documentation Requirement**
```
Spec includes: "Create a guide for developers on how to use this API"
✅ DO: Create the requested guide
```

## Code Quality Standards

### Minimal Code Principle
- Write only the code needed to solve the problem
- Avoid over-engineering
- Keep implementations simple and maintainable
- Remove unused code and imports

### Testing
- Write tests only when explicitly requested
- Don't auto-generate test files
- Focus on critical paths when testing is required

### File Organization
- Keep related code together
- Use clear, descriptive file names
- Follow existing project structure
- Don't create unnecessary subdirectories

## Summary Responses

When completing work:
- ✅ Brief 2-3 sentence summary of what was done
- ❌ Long bullet-point lists of changes
- ❌ Verbose recaps of the entire process
- ❌ Markdown files documenting the work

Keep responses concise and actionable.
