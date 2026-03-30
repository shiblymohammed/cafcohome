# Steering Documentation

This directory contains steering files that guide Kiro's behavior for this project.

## Active Steering Files

### coding-standards.md
- Documentation generation rules
- Code quality standards
- Best practices for this project

## How Steering Works

Steering files with `inclusion: auto` in the frontmatter are automatically included in all Kiro interactions. This ensures consistent behavior across all tasks.

## Adding New Steering Rules

1. Create a new `.md` file in this directory
2. Add frontmatter with `inclusion: auto` for automatic inclusion
3. Write clear, actionable guidelines
4. Keep rules concise and specific

## Current Rules Summary

- **No Auto-Documentation**: Don't create markdown docs unless explicitly requested
- **Minimal Code**: Write only what's needed
- **Concise Responses**: Brief summaries, not verbose recaps
