"""
Governance checks module.
"""
import os
import subprocess
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def run_governance_checks(repo_path: str) -> dict:
    """
    Run governance checks on repository.
    
    Returns:
        Dictionary with rule results
    """
    results = {
        'module': 'governance',
        'rules': [],
        'summary': {
            'total_rules': 0,
            'passed': 0,
            'warned': 0,
            'failed': 0,
        }
    }
    
    repo_path_obj = Path(repo_path)
    
    # Rule 1: README exists (duplicate from CI, but included for completeness)
    readme_check = _check_readme(repo_path_obj)
    results['rules'].append(readme_check)
    results['summary']['total_rules'] += 1
    _update_summary(results['summary'], readme_check['status'])
    
    # Rule 2: License exists
    license_check = _check_license(repo_path_obj)
    results['rules'].append(license_check)
    results['summary']['total_rules'] += 1
    _update_summary(results['summary'], license_check['status'])
    
    # Rule 3: Requirements/dependencies file exists
    deps_check = _check_dependencies_file(repo_path_obj)
    results['rules'].append(deps_check)
    results['summary']['total_rules'] += 1
    _update_summary(results['summary'], deps_check['status'])
    
    # Rule 4: Commit message format
    commit_check = _check_commit_messages(repo_path_obj)
    results['rules'].append(commit_check)
    results['summary']['total_rules'] += 1
    _update_summary(results['summary'], commit_check['status'])
    
    return results


def _check_readme(repo_path: Path) -> dict:
    """Check if README exists."""
    readme_files = ['README.md', 'README.rst', 'README.txt', 'readme.md']
    
    for readme in readme_files:
        if (repo_path / readme).exists():
            return {
                'rule': 'README_EXISTS',
                'status': 'PASS',
                'details': f'{readme} found',
                'weight': 1.0,
            }
    
    return {
        'rule': 'README_EXISTS',
        'status': 'FAIL',
        'details': 'No README file found',
        'weight': 1.0,
    }


def _check_license(repo_path: Path) -> dict:
    """Check if LICENSE file exists."""
    license_files = ['LICENSE', 'LICENSE.txt', 'LICENSE.md', 'LICENCE', 'LICENCE.txt']
    
    for license_file in license_files:
        if (repo_path / license_file).exists():
            return {
                'rule': 'LICENSE_EXISTS',
                'status': 'PASS',
                'details': f'{license_file} found',
                'weight': 1.0,
            }
    
    return {
        'rule': 'LICENSE_EXISTS',
        'status': 'WARN',
        'details': 'No LICENSE file found',
        'weight': 0.5,
    }


def _check_dependencies_file(repo_path: Path) -> dict:
    """Check if dependencies file exists."""
    dep_files = ['requirements.txt', 'package.json', 'Pipfile', 'poetry.lock', 'yarn.lock']
    
    for dep_file in dep_files:
        if (repo_path / dep_file).exists():
            return {
                'rule': 'DEPENDENCIES_FILE_EXISTS',
                'status': 'PASS',
                'details': f'{dep_file} found',
                'weight': 1.0,
            }
    
    return {
        'rule': 'DEPENDENCIES_FILE_EXISTS',
        'status': 'WARN',
        'details': 'No dependencies file found',
        'weight': 0.5,
    }


def _check_commit_messages(repo_path: Path) -> dict:
    """Check commit message format."""
    try:
        # Get recent commit messages
        result = subprocess.run(
            ['git', 'log', '--pretty=format:%s', '-n', '20'],
            cwd=str(repo_path),
            capture_output=True,
            text=True,
            timeout=10,
        )
        
        if result.returncode != 0:
            return {
                'rule': 'COMMIT_MESSAGE_FORMAT',
                'status': 'WARN',
                'details': 'Could not retrieve commit messages',
                'weight': 0.5,
            }
        
        commit_messages = result.stdout.strip().split('\n')
        if not commit_messages:
            return {
                'rule': 'COMMIT_MESSAGE_FORMAT',
                'status': 'WARN',
                'details': 'No commit messages found',
                'weight': 0.5,
            }
        
        # Check for conventional commit format (optional check)
        # Format: type(scope): subject
        conventional_pattern = r'^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+'
        import re
        
        conventional_count = sum(1 for msg in commit_messages 
                               if re.match(conventional_pattern, msg))
        ratio = conventional_count / len(commit_messages) if commit_messages else 0
        
        if ratio >= 0.7:
            return {
                'rule': 'COMMIT_MESSAGE_FORMAT',
                'status': 'PASS',
                'details': f'{conventional_count}/{len(commit_messages)} commits follow conventional format',
                'weight': 1.0,
            }
        elif ratio >= 0.4:
            return {
                'rule': 'COMMIT_MESSAGE_FORMAT',
                'status': 'WARN',
                'details': f'Only {conventional_count}/{len(commit_messages)} commits follow conventional format',
                'weight': 0.5,
            }
        else:
            return {
                'rule': 'COMMIT_MESSAGE_FORMAT',
                'status': 'WARN',
                'details': 'Commit messages do not follow conventional format',
                'weight': 0.5,
            }
            
    except subprocess.TimeoutExpired:
        return {
            'rule': 'COMMIT_MESSAGE_FORMAT',
            'status': 'WARN',
            'details': 'Commit check timed out',
            'weight': 0.5,
        }
    except FileNotFoundError:
        return {
            'rule': 'COMMIT_MESSAGE_FORMAT',
            'status': 'WARN',
            'details': 'git not available',
            'weight': 0.5,
        }
    except Exception as e:
        logger.error(f"Error checking commit messages: {e}")
        return {
            'rule': 'COMMIT_MESSAGE_FORMAT',
            'status': 'WARN',
            'details': f'Error: {str(e)[:100]}',
            'weight': 0.5,
        }


def _update_summary(summary: dict, status: str):
    """Update summary counts."""
    if status == 'PASS':
        summary['passed'] += 1
    elif status == 'WARN':
        summary['warned'] += 1
    elif status == 'FAIL':
        summary['failed'] += 1
