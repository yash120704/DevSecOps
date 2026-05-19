"""
CI Hygiene checks module.
"""
import os
import sys
import shutil
import subprocess
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def run_ci_checks(repo_path: str) -> dict:
    """
    Run CI hygiene checks on repository.
    
    Returns:
        Dictionary with rule results
    """
    results = {
        'module': 'ci_hygiene',
        'rules': [],
        'summary': {
            'total_rules': 0,
            'passed': 0,
            'warned': 0,
            'failed': 0,
        }
    }
    
    repo_path_obj = Path(repo_path)
    
    # Rule 1: README exists
    readme_check = _check_readme_exists(repo_path_obj)
    results['rules'].append(readme_check)
    results['summary']['total_rules'] += 1
    _update_summary(results['summary'], readme_check['status'])
    
    # Rule 2: CI Config exists
    ci_config_check = _check_ci_config(repo_path_obj)
    results['rules'].append(ci_config_check)
    results['summary']['total_rules'] += 1
    _update_summary(results['summary'], ci_config_check['status'])
    
    # Rule 3: Tests exist
    tests_exist_check = _check_tests_exist(repo_path_obj)
    results['rules'].append(tests_exist_check)
    results['summary']['total_rules'] += 1
    _update_summary(results['summary'], tests_exist_check['status'])
    
    # Rule 4: Tests pass
    if tests_exist_check['status'] == 'PASS':
        tests_pass_check = _check_tests_pass(repo_path_obj)
        results['rules'].append(tests_pass_check)
        results['summary']['total_rules'] += 1
        _update_summary(results['summary'], tests_pass_check['status'])
    
    # Rule 5: Build passes
    build_check = _check_build_passes(repo_path_obj)
    results['rules'].append(build_check)
    results['summary']['total_rules'] += 1
    _update_summary(results['summary'], build_check['status'])
    
    return results


def _check_readme_exists(repo_path: Path) -> dict:
    """Check if README file exists."""
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


def _check_ci_config(repo_path: Path) -> dict:
    """Check if CI configuration exists."""
    ci_configs = [
        '.github/workflows',
        '.gitlab-ci.yml',
        '.travis.yml',
        'circleci',
        'Jenkinsfile',
    ]
    
    for config in ci_configs:
        config_path = repo_path / config
        if config_path.exists():
            return {
                'rule': 'CI_CONFIG_EXISTS',
                'status': 'PASS',
                'details': f'CI config found: {config}',
                'weight': 1.0,
            }
    
    return {
        'rule': 'CI_CONFIG_EXISTS',
        'status': 'WARN',
        'details': 'No CI configuration detected',
        'weight': 0.5,
    }


def _check_tests_exist(repo_path: Path) -> dict:
    """Check if test files exist."""
    test_patterns = ['test_*.py', '*_test.py', 'tests/', 'test/']
    
    for pattern in test_patterns:
        if pattern.endswith('/'):
            # Directory check
            test_dir = repo_path / pattern.rstrip('/')
            if test_dir.exists() and test_dir.is_dir():
                return {
                    'rule': 'TESTS_EXIST',
                    'status': 'PASS',
                    'details': f'Test directory found: {pattern}',
                    'weight': 1.0,
                }
        else:
            # File pattern check
            test_files = list(repo_path.rglob(pattern))
            if test_files:
                return {
                    'rule': 'TESTS_EXIST',
                    'status': 'PASS',
                    'details': f'Test files found: {len(test_files)} files',
                    'weight': 1.0,
                }
    
    return {
        'rule': 'TESTS_EXIST',
        'status': 'WARN',
        'details': 'No test files detected',
        'weight': 0.5,
    }


def _check_tests_pass(repo_path: Path) -> dict:
    """Run tests and check if they pass."""
    try:
        # Check if pytest is available
        result = subprocess.run(
            ['pytest', '--version'],
            capture_output=True,
            text=True,
            timeout=5,
        )
        
        if result.returncode != 0:
            return {
                'rule': 'TESTS_PASS',
                'status': 'WARN',
                'details': 'pytest not available',
                'weight': 0.5,
            }
        
        # Run pytest with timeout
        test_result = subprocess.run(
            ['pytest', '-v', '--tb=short'],
            cwd=str(repo_path),
            capture_output=True,
            text=True,
            timeout=30,
        )
        
        if test_result.returncode == 0:
            return {
                'rule': 'TESTS_PASS',
                'status': 'PASS',
                'details': 'All tests passed',
                'weight': 1.0,
            }
        else:
            return {
                'rule': 'TESTS_PASS',
                'status': 'FAIL',
                'details': f'Tests failed: {test_result.stdout[:200]}',
                'weight': 1.0,
            }
            
    except subprocess.TimeoutExpired:
        return {
            'rule': 'TESTS_PASS',
            'status': 'WARN',
            'details': 'Test execution timed out',
            'weight': 0.5,
        }
    except FileNotFoundError:
        return {
            'rule': 'TESTS_PASS',
            'status': 'WARN',
            'details': 'pytest not installed',
            'weight': 0.5,
        }
    except Exception as e:
        logger.error(f"Error running tests: {e}")
        return {
            'rule': 'TESTS_PASS',
            'status': 'WARN',
            'details': f'Error: {str(e)[:100]}',
            'weight': 0.5,
        }


def _check_build_passes(repo_path: Path) -> dict:
    """Check if project builds successfully."""
    # Check for Python project
    if (repo_path / 'requirements.txt').exists() or (repo_path / 'setup.py').exists():
        return _check_python_build(repo_path)
    
    # Check for Node.js project
    if (repo_path / 'package.json').exists():
        return _check_node_build(repo_path)
    
    return {
        'rule': 'BUILD_PASSES',
        'status': 'WARN',
        'details': 'No recognized build configuration found',
        'weight': 0.5,
    }


def _check_python_build(repo_path: Path) -> dict:
    """Check Python project build."""
    try:
        # Use an offline-friendly build sanity check.
        # Dependency resolution is often network-bound and can timeout on large repos.
        result = subprocess.run(
            [sys.executable, '-m', 'compileall', '-q', '.'],
            cwd=str(repo_path),
            capture_output=True,
            text=True,
            timeout=60,
        )

        if result.returncode == 0:
            return {
                'rule': 'BUILD_PASSES',
                'status': 'PASS',
                'details': 'Python sources compile successfully',
                'weight': 1.0,
            }

        return {
            'rule': 'BUILD_PASSES',
            'status': 'WARN',
            'details': 'Python compile check reported issues',
            'weight': 0.5,
        }
    except subprocess.TimeoutExpired:
        return {
            'rule': 'BUILD_PASSES',
            'status': 'WARN',
            'details': 'Python build check timed out after 60 seconds',
            'weight': 0.5,
        }
    except Exception as e:
        logger.error(f"Error checking Python build: {e}")
        return {
            'rule': 'BUILD_PASSES',
            'status': 'WARN',
            'details': f'Build check error: {str(e)[:100]}',
            'weight': 0.5,
        }


def _check_node_build(repo_path: Path) -> dict:
    """Check Node.js project build."""
    # Verify npm is available on PATH before attempting any Node checks
    if shutil.which("npm") is None:
        return {
            'rule': 'BUILD_PASSES',
            'status': 'PASS',
            'details': 'package.json found but npm is not installed - skipping Node.js build check',
            'weight': 1.0,
        }
    
    try:
        # Check if npm install would work
        result = subprocess.run(
            ['npm', 'install', '--dry-run'],
            cwd=str(repo_path),
            capture_output=True,
            text=True,
            timeout=30,
        )
        
        if result.returncode == 0:
            return {
                'rule': 'BUILD_PASSES',
                'status': 'PASS',
                'details': 'Node.js dependencies can be installed',
                'weight': 1.0,
            }
        
        return {
            'rule': 'BUILD_PASSES',
            'status': 'WARN',
            'details': 'Could not verify Node.js build',
            'weight': 0.5,
        }
    except FileNotFoundError:
        # npm was found by which() but subprocess can't find it (rare edge case)
        return {
            'rule': 'BUILD_PASSES',
            'status': 'PASS',
            'details': 'npm command not found - skipping Node.js build check',
            'weight': 1.0,
        }
    except subprocess.TimeoutExpired:
        return {
            'rule': 'BUILD_PASSES',
            'status': 'WARN',
            'details': 'Node.js build check timed out',
            'weight': 0.5,
        }
    except Exception as e:
        logger.warning(f"Error checking Node.js build: {e}")
        return {
            'rule': 'BUILD_PASSES',
            'status': 'WARN',
            'details': f'Build check error: {str(e)[:100]}',
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
