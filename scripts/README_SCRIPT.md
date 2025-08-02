# GitHub Project Items Creator

This script parses a structured markdown file (`tasks.md`) and creates GitHub project items using the GitHub CLI (`gh`).

## Features

- **Automatic Parsing**: Extracts tasks from markdown with hierarchical structure
- **Rich Metadata**: Captures phases, epics, task types, user stories, and definition of done
- **GitHub Integration**: Creates project items directly using GitHub CLI
- **Error Handling**: Robust error handling with continuation options
- **Preview Mode**: Shows what will be created before execution

## Prerequisites

1. **GitHub CLI**: Install from [cli.github.com](https://cli.github.com/)
2. **Authentication**: Run `gh auth login` to authenticate
3. **Project Access**: Ensure you have access to the GitHub project
4. **Python 3.7+**: Required for running the script

## File Structure Expected

The script expects a `tasks.md` file with the following structure:

```markdown
## Phase 1: Foundation & Setup (Week 1)

### Epic 1.1: Project Infrastructure

#### Task 1.1.1: Initialize FastAPI Project Structure
**Type:** Task  
**Definition of Done:**
- [ ] Project directory created with standard Python project structure
- [ ] Virtual environment created and activated
- [ ] Git repository initialized with initial commit

#### Task 1.1.2: User Story - Create a New Trip
**Type:** User Story  
**User Story:** As a user, I want to create a new trip so that I can start planning my packing.  
**Definition of Done:**
- [ ] POST /trips endpoint implemented
- [ ] Request body validated with Pydantic schema
- [ ] 201 Created status returned with trip data
```

## Usage

### Basic Usage

```bash
# Run the script (will prompt for confirmation)
python3 create_tasks.py
```

### Script Options

The script will automatically:
1. Parse `tasks.md` in the current directory
2. Show a preview of tasks to be created
3. Ask for confirmation before creating project items
4. Create items in project #1 for the authenticated user (`@me`)

### Customization

To customize the project number or owner, modify the script:

```python
# In the main() function, change:
creator = GitHubProjectCreator(project_number="1", owner="@me")

# To your desired values:
creator = GitHubProjectCreator(project_number="2", owner="myorg")
```

## Output Format

Each GitHub project item will include:

- **Title**: The task title
- **Body**: Formatted with:
  - Phase information
  - Epic information  
  - Task type
  - User story (if applicable)
  - Definition of Done as checkboxes

### Example Output

```
**Phase:** Phase 1: Foundation & Setup (Week 1)
**Epic:** Epic 1.1: Project Infrastructure
**Type:** Task
**Definition of Done:**
- [ ] Project directory created with standard Python project structure
- [ ] Virtual environment created and activated
- [ ] Git repository initialized with initial commit
```

## Error Handling

The script includes robust error handling:

- **File Not Found**: Graceful error if `tasks.md` doesn't exist
- **GitHub CLI Issues**: Checks if `gh` is installed and authenticated
- **API Failures**: Continues after failures with option to stop
- **Parsing Errors**: Detailed error messages for malformed markdown

## Testing

Test the parser without creating GitHub items:

```bash
python3 test_parser.py
```

This will show:
- Number of tasks found
- First 3 tasks with metadata
- Sample formatted body

## Example Run

```bash
$ python3 create_tasks.py

Parsing tasks from tasks.md...
Found 34 tasks

Sample tasks to be created:
  1. Task 1.1.1: Initialize FastAPI Project Structure (Task)
  2. Task 1.1.2: Install and Configure Core Dependencies (Task)
  3. Task 1.1.3: Configure Docker Development Environment (Task)
  4. Task 1.1.4: Set Up Database Connection and Configuration (Task)
  5. Task 1.2.1: Create Trip Model (Task)
    ... and 29 more tasks

Do you want to create 34 project items? (y/N): y

==================================================
Creating GitHub project items...
==================================================

[1/34] Creating task: Task 1.1.1: Initialize FastAPI Project Structure
✅ Created: Task 1.1.1: Initialize FastAPI Project Structure (ID: PVTI_xxx)

[2/34] Creating task: Task 1.1.2: Install and Configure Core Dependencies
✅ Created: Task 1.1.2: Install and Configure Core Dependencies (ID: PVTI_xxx)

...

==================================================
📊 Summary: 34/34 tasks created successfully
```

## Troubleshooting

### Common Issues

1. **GitHub CLI not found**
   ```bash
   # Install GitHub CLI
   brew install gh  # macOS
   # or visit https://cli.github.com/
   ```

2. **Authentication required**
   ```bash
   gh auth login
   ```

3. **Project not found**
   - Verify project exists and you have access
   - Check project number is correct
   - Ensure proper permissions

4. **Parsing issues**
   - Verify `tasks.md` follows the expected format
   - Check for consistent heading levels (##, ###, ####)
   - Ensure proper markdown formatting

### Debug Mode

For debugging parsing issues, modify the script to add debug output:

```python
# In parse_file method, add:
print(f"DEBUG: Found phase: {self.current_phase}")
print(f"DEBUG: Found epic: {self.current_epic}")
print(f"DEBUG: Found task: {task_title}")
```

## Files

- `create_tasks.py` - Main script
- `test_parser.py` - Test script for parser validation
- `tasks.md` - Input file with task definitions
- `README.md` - This documentation

## Contributing

1. Test changes with `test_parser.py` first
2. Ensure error handling is maintained
3. Update documentation for new features
4. Test with various markdown structures

## License

This script is provided as-is for project management automation.