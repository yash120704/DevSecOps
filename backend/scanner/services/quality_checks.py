"""
Code Quality checks module.
"""
import os
import subprocess
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def run_quality_checks(repo_path: str) -> dict:
    """
    Run code quality checks on repository.
    
    Returns:
        Dictionary with rule results
    """
    results = {
        'module': 'code_quality',
        'rules': [],
        'summary': {
            'total_rules': 0,
            'passed': 0,
            'warned': 0,
            'failed': 0,
        }
    }
    
    repo_path_obj = Path(repo_path)
    
    # Rule 1: Static analysis (flake8)
    flake8_check = _check_flake8(repo_path_obj)
    results['rules'].append(flake8_check)
    results['summary']['total_rules'] += 1
    _update_summary(results['summary'], flake8_check['status'])
    
    # Rule 2: Cyclomatic complexity
    complexity_check = _check_complexity(repo_path_obj)
    results['rules'].append(complexity_check)
    results['summary']['total_rules'] += 1
    _update_summary(results['summary'], complexity_check['status'])
    
    # Rule 3: Large file detection
    large_file_check = _check_large_files(repo_path_obj)
    results['rules'].append(large_file_check)
    results['summary']['total_rules'] += 1
    _update_summary(results['summary'], large_file_check['status'])
    
    return results


def _check_flake8(repo_path: Path) -> dict:
    """Run flake8 static analysis."""
    try:
        # Find Python files
        python_files = list(repo_path.rglob('*.py'))
        if not python_files:
            return {
                'rule': 'STATIC_ANALYSIS',
                'status': 'WARN',
                'details': 'No Python files found',
                'weight': 0.5,
            }
        
        # Check if flake8 is available
        result = subprocess.run(
            ['flake8', '--version'],
            capture_output=True,
            text=True,
            timeout=5,
        )
        
        if result.returncode != 0:
            return {
                'rule': 'STATIC_ANALYSIS',
                'status': 'WARN',
                'details': 'flake8 not available',
                'weight': 0.5,
            }
        
        # Run flake8
        flake8_result = subprocess.run(
            [
                'flake8', '.', '--count', '--statistics',
                '--exclude', '.venv,.git,node_modules,__pycache__,.pytest_cache,.tox,temp_scans,migrations,media,static'
            ],
            cwd=str(repo_path),
            capture_output=True,
            text=True,
            timeout=30,
        )
        
        if flake8_result.returncode == 0:
            return {
                'rule': 'STATIC_ANALYSIS',
                'status': 'PASS',
                'details': 'No flake8 violations found',
                'weight': 1.0,
            }
        else:
            # Parse violations
            violations = len(flake8_result.stdout.split('\n')) - 1
            return {
                'rule': 'STATIC_ANALYSIS',
                'status': 'WARN' if violations < 50 else 'FAIL',
                'details': f'Found {violations} flake8 violations',
                'weight': 1.0,
            }
            
    except subprocess.TimeoutExpired:
        return {
            'rule': 'STATIC_ANALYSIS',
            'status': 'WARN',
            'details': 'flake8 execution timed out',
            'weight': 0.5,
        }
    except FileNotFoundError:
        return {
            'rule': 'STATIC_ANALYSIS',
            'status': 'WARN',
            'details': 'flake8 not installed',
            'weight': 0.5,
        }
    except Exception as e:
        logger.error(f"Error running flake8: {e}")
        return {
            'rule': 'STATIC_ANALYSIS',
            'status': 'WARN',
            'details': f'Error: {str(e)[:100]}',
            'weight': 0.5,
        }


def _check_complexity(repo_path: Path) -> dict:
    """Check cyclomatic complexity using radon."""
    try:
        python_files = list(repo_path.rglob('*.py'))
        if not python_files:
            return {
                'rule': 'COMPLEXITY',
                'status': 'WARN',
                'details': 'No Python files found',
                'weight': 0.5,
            }
        
        # Check if radon is available
        result = subprocess.run(
            ['radon', '--version'],
            capture_output=True,
            text=True,
            timeout=5,
        )
        
        if result.returncode != 0:
            return {
                'rule': 'COMPLEXITY',
                'status': 'WARN',
                'details': 'radon not available',
                'weight': 0.5,
            }
        
        # Run radon complexity check with exclusions for heavy directories
        # Increased timeout to 60 seconds and exclude common non-essential folders
        radon_result = subprocess.run(
            [
                'radon', 'cc', '.', '-a', '-nb',
                # Exclude directories that slow down analysis
                '--exclude', '.venv,.git,node_modules,__pycache__,.pytest_cache,.tox,temp_scans,migrations,media,static'
            ],
            cwd=str(repo_path),
            capture_output=True,
            text=True,
            timeout=60,
        )
        
        # Parse output for high complexity functions
        output = radon_result.stdout
        high_complexity = []
        for line in output.split('\n'):
            if 'C' in line or 'F' in line:  # C = complexity, F = function
                parts = line.split()
                if len(parts) >= 2:
                    try:
                        complexity = int(parts[-1])
                        if complexity > 10:  # Threshold
                            high_complexity.append(line.strip())
                    except ValueError:
                        pass
        
        if not high_complexity:
            return {
                'rule': 'COMPLEXITY',
                'status': 'PASS',
                'details': 'No high complexity functions found',
                'weight': 1.0,
            }
        else:
            return {
                'rule': 'COMPLEXITY',
                'status': 'WARN' if len(high_complexity) < 5 else 'FAIL',
                'details': f'Found {len(high_complexity)} high complexity functions',
                'weight': 1.0,
            }
            
    except subprocess.TimeoutExpired:
        return {
            'rule': 'COMPLEXITY',
            'status': 'WARN',
            'details': 'Complexity check timed out (skipped heavy directories)',
            'weight': 0.5,
        }
    except FileNotFoundError:
        return {
            'rule': 'COMPLEXITY',
            'status': 'WARN',
            'details': 'radon not installed',
            'weight': 0.5,
        }
    except Exception as e:
        logger.error(f"Error checking complexity: {e}")
        return {
            'rule': 'COMPLEXITY',
            'status': 'WARN',
            'details': f'Error: {str(e)[:100]}',
            'weight': 0.5,
        }


def _check_large_files(repo_path: Path) -> dict:
    """Check for files exceeding line count threshold."""
    threshold = 500  # lines
    large_files = []
    
    try:
        # Check Python files
        for py_file in repo_path.rglob('*.py'):
            try:
                with open(py_file, 'r', encoding='utf-8', errors='ignore') as f:
                    line_count = sum(1 for _ in f)
                    if line_count > threshold:
                        large_files.append({
                            'file': str(py_file.relative_to(repo_path)),
                            'lines': line_count,
                        })
            except Exception:
                continue
        
        if not large_files:
            return {
                'rule': 'LARGE_FILES',
                'status': 'PASS',
                'details': f'No files exceed {threshold} lines',
                'weight': 1.0,
            }
        else:
            return {
                'rule': 'LARGE_FILES',
                'status': 'WARN' if len(large_files) < 3 else 'FAIL',
                'details': f'Found {len(large_files)} files exceeding {threshold} lines',
                'weight': 1.0,
            }
    except Exception as e:
        logger.error(f"Error checking large files: {e}")
        return {
            'rule': 'LARGE_FILES',
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
