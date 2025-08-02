#!/usr/bin/env python3
"""
Script to parse tasks.md file and create GitHub project items using gh CLI
Usage: python create_tasks.py
"""

import re
import subprocess
import json
import sys
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class Task:
    title: str
    task_type: str
    user_story: Optional[str]
    definition_of_done: List[str]
    phase: str
    epic: str

class TaskParser:
    def __init__(self, filename: str):
        self.filename = filename
        self.tasks: List[Task] = []
        self.current_phase = ""
        self.current_epic = ""

    def parse_file(self) -> List[Task]:
        """Parse the markdown file and extract tasks"""
        try:
            with open(self.filename, 'r', encoding='utf-8') as file:
                content = file.read()
        except FileNotFoundError:
            print(f"Error: File '{self.filename}' not found.")
            sys.exit(1)
        
        lines = content.split('\n')
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Check for Phase (## Phase X: Title)
            if line.startswith('## Phase'):
                self.current_phase = line[3:].strip()
                i += 1
                continue
            
            # Check for Epic (### Epic X.Y: Title)
            elif line.startswith('### Epic'):
                self.current_epic = line[4:].strip()
                i += 1
                continue
            
            # Check for Task (#### Task X.Y.Z: Title)
            elif line.startswith('#### Task'):
                task_title = line[5:].strip()
                i += 1
                
                # Parse task details
                task_type = ""
                user_story = None
                definition_of_done = []
                
                # Look for Type, User Story, and Definition of Done
                while i < len(lines) and not lines[i].startswith('####') and not lines[i].startswith('###') and not lines[i].startswith('##'):
                    current_line = lines[i].strip()
                    
                    if current_line.startswith('**Type:**'):
                        task_type = current_line.replace('**Type:**', '').strip()
                    
                    elif current_line.startswith('**User Story:**'):
                        user_story = current_line.replace('**User Story:**', '').strip()
                    
                    elif current_line.startswith('**Definition of Done:**'):
                        i += 1
                        # Collect all definition of done items
                        while i < len(lines) and lines[i].strip().startswith('- [ ]'):
                            dod_item = lines[i].strip()[5:].strip()  # Remove '- [ ] '
                            definition_of_done.append(dod_item)
                            i += 1
                        continue
                    
                    i += 1
                
                # Create task object
                task = Task(
                    title=task_title,
                    task_type=task_type,
                    user_story=user_story,
                    definition_of_done=definition_of_done,
                    phase=self.current_phase,
                    epic=self.current_epic
                )
                self.tasks.append(task)
                continue
            
            i += 1
        
        return self.tasks

    @staticmethod
    def format_task_body(task: Task) -> str:
        """Format task body for GitHub project item"""
        body_parts = []
        
        # Add phase and epic context
        if task.phase:
            body_parts.append(f"**Phase:** {task.phase}")
        if task.epic:
            body_parts.append(f"**Epic:** {task.epic}")
        
        # Add task type
        if task.task_type:
            body_parts.append(f"**Type:** {task.task_type}")
        
        # Add user story if present
        if task.user_story:
            body_parts.append(f"**User Story:** {task.user_story}")
        
        # Add definition of done
        if task.definition_of_done:
            body_parts.append("**Definition of Done:**")
            for item in task.definition_of_done:
                body_parts.append(f"- [ ] {item}")
        
        return "\\n".join(body_parts)

class GitHubProjectCreator:
    def __init__(self, project_number: str = "1", owner: str = "@me"):
        self.project_number = project_number
        self.owner = owner

    def create_project_item(self, task: Task) -> bool:
        """Create a GitHub project item using gh CLI"""
        title = task.title
        body = TaskParser.format_task_body(task)
        
        # Construct gh CLI command
        cmd = [
            "gh", "project", "item-create", self.project_number,
            "--owner", self.owner,
            "--title", title,
            "--body", body,
            "--format", "json"
        ]
        
        try:
            print(f"Creating task: {title}")
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Parse JSON response
            response = json.loads(result.stdout)
            print(f"✅ Created: {response.get('title', 'Unknown')} (ID: {response.get('id', 'Unknown')})")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to create task '{title}': {e.stderr}")
            return False
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse response for task '{title}': {e}")
            return False

def main():
    """Main function to run the script"""
    filename = "tasks.md"
    
    # Check if gh CLI is available
    try:
        subprocess.run(["gh", "--version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ GitHub CLI (gh) is not installed or not available. Please install it first.")
        print("Visit: https://cli.github.com/")
        sys.exit(1)
    
    print(f"Parsing tasks from {filename}...")
    parser = TaskParser(filename)
    tasks = parser.parse_file()
    
    print(f"Found {len(tasks)} tasks")
    
    if not tasks:
        print("No tasks found. Exiting.")
        return
    
    # Show sample of tasks
    print("\nSample tasks to be created:")
    for i, task in enumerate(tasks[:5], 1):
        print(f"{i:3d}. {task.title} ({task.task_type})")
    
    if len(tasks) > 5:
        print(f"    ... and {len(tasks) - 5} more tasks")
    
    response = input(f"\nDo you want to create {len(tasks)} project items? (y/N): ").strip().lower()
    if response not in ['y', 'yes']:
        print("Cancelled.")
        return
    
    # Create project items
    creator = GitHubProjectCreator()
    success_count = 0
    failed_tasks = []
    
    print("\n" + "="*50)
    print("Creating GitHub project items...")
    print("="*50)
    
    for i, task in enumerate(tasks, 1):
        print(f"\n[{i}/{len(tasks)}] ", end="")
        if creator.create_project_item(task):
            success_count += 1
        else:
            failed_tasks.append(task.title)
            # Ask if user wants to continue
            if len(failed_tasks) >= 3:
                continue_response = input("\nMultiple failures detected. Continue? (y/N): ").strip().lower()
                if continue_response not in ['y', 'yes']:
                    break
    
    print("\n" + "="*50)
    print(f"📊 Summary: {success_count}/{len(tasks)} tasks created successfully")
    
    if failed_tasks:
        print(f"\n❌ Failed tasks ({len(failed_tasks)}):")
        for task_title in failed_tasks:
            print(f"  - {task_title}")

if __name__ == "__main__":
    main()