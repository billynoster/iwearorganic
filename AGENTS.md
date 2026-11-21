# AI Agent Guidelines & Safeguards

## Critical Safety Rules
1. **No Bulk Deletions:** Never delete multiple components, entire directories, or core configuration files without obtaining EXPLICIT, unmistakable confirmation from the user beforehand. 
2. **Destructive Actions:** When asked to delete a file, always double-check if the file contains critical logic. If so, inform the user of the potential impact before proceeding.
3. **Preserve Codebase Health:** Do not execute large-scale structural resets unless specifically requested as a "complete reset."

## Design & Architecture
1. **Refer to Design Guidelines:** When making decisions about UI/UX, styling, or system architecture, always consult `design.md` for the overarching project vision.
2. **Document Major Changes:** If a large structural or thematic change is implemented, ensure `design.md` is updated to reflect it.