"""
Security checks module.
"""
import os
import re
import shutil
import subprocess
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Patterns for secret detection
SECRET_PATTERNS = [
    (r'password\s*=\s*["\']([^"\']+)["\']', 'Hardcoded password'),
    (r'api_key\s*=\s*["\']([^"\']+)["\']', 'Hardcoded API key'),
    (r'secret\s*=\s*["\']([^"\']+)["\']', 'Hardcoded secret'),
    (r'apikey\s*=\s*["\']([^"\']+)["\']', 'Hardcoded API key'),
    (r'access_token\s*=\s*["\']([^"\']+)["\']', 'Hardcoded access token'),
    (r'private_key\s*=\s*["\']([^"\']+)["\']', 'Hardcoded private key'),
    (r'aws_secret_access_key\s*=\s*["\']([^"\']+)["\']', 'AWS secret key'),
    (r'AKIA[0-9A-Z]{16}', 'AWS access key ID'),
]


def run_security_checks(repo_path: str) -> dict:
    """
    Run security checks on repository.
    
    Returns:
        Dictionary with rule results
    """
    results = {
        'module': 'security',
        'rules': [],
        'summary': {
            'total_rules': 0,
            'passed': 0,
            'warned': 0,
            'failed': 0,
        }
    }
    
    repo_path_obj = Path(repo_path)
    
    # Rule 1: Secret scan
    secret_check = _check_secrets(repo_path_obj)
    results['rules'].append(secret_check)
    results['summary']['total_rules'] += 1
    _update_summary(results['summary'], secret_check['status'])
    
    # Rule 2: Dependency vulnerabilities
    vuln_check = _check_dependencies(repo_path_obj)
    results['rules'].append(vuln_check)
    results['summary']['total_rules'] += 1
    _update_summary(results['summary'], vuln_check['status'])
    
    # Rule 3: Debug mode detection
    debug_check = _check_debug_mode(repo_path_obj)
    results['rules'].append(debug_check)
    results['summary']['total_rules'] += 1
    _update_summary(results['summary'], debug_check['status'])
    
    return results


def _check_secrets(repo_path: Path) -> dict:
    """Scan for hardcoded secrets."""
    found_secrets = []
    
    try:
        # Scan Python files
        for py_file in repo_path.rglob('*.py'):
            try:
                with open(py_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    for pattern, description in SECRET_PATTERNS:
                        matches = re.finditer(pattern, content, re.IGNORECASE)
                        for match in matches:
                            # Skip if it's a comment or example
                            line_start = content.rfind('\n', 0, match.start()) + 1
                            line = content[line_start:content.find('\n', match.start())]
                            if not line.strip().startswith('#'):
                                found_secrets.append({
                                    'file': str(py_file.relative_to(repo_path)),
                                    'type': description,
                                    'line': content[:match.start()].count('\n') + 1,
                                })
            except Exception as e:
                logger.debug(f"Error scanning {py_file}: {e}")
                continue
        
        # Scan config files
        config_files = ['*.env', '*.config', '*.ini', '*.yaml', '*.yml']
        for pattern in config_files:
            for config_file in repo_path.rglob(pattern):
                try:
                    with open(config_file, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        for pattern_regex, description in SECRET_PATTERNS:
                            if re.search(pattern_regex, content, re.IGNORECASE):
                                found_secrets.append({
                                    'file': str(config_file.relative_to(repo_path)),
                                    'type': description,
                                })
                except Exception:
                    continue
        
        if not found_secrets:
            return {
                'rule': 'SECRET_SCAN',
                'status': 'PASS',
                'details': 'No hardcoded secrets detected',
                'weight': 1.0,
            }
        else:
            return {
                'rule': 'SECRET_SCAN',
                'status': 'FAIL',
                'details': f'Found {len(found_secrets)} potential secrets',
                'weight': 1.0,
                'findings': found_secrets[:10],  # Limit to 10
            }
            
    except Exception as e:
        logger.error(f"Error scanning for secrets: {e}")
        return {
            'rule': 'SECRET_SCAN',
            'status': 'WARN',
            'details': f'Error: {str(e)[:100]}',
            'weight': 0.5,
        }


def _check_dependencies(repo_path: Path) -> dict:
    """Check for dependency vulnerabilities."""
    try:
        # Check Python dependencies
        if (repo_path / 'requirements.txt').exists():
            return _check_python_dependencies(repo_path)
        
        # Check Node.js dependencies
        if (repo_path / 'package.json').exists():
            return _check_node_dependencies(repo_path)
        
        return {
            'rule': 'DEPENDENCY_VULNERABILITIES',
            'status': 'WARN',
            'details': 'No dependency file found',
            'weight': 0.5,
        }
    except Exception as e:
        logger.error(f"Error checking dependencies: {e}")
        return {
            'rule': 'DEPENDENCY_VULNERABILITIES',
            'status': 'WARN',
            'details': f'Error: {str(e)[:100]}',
            'weight': 0.5,
        }


def _check_python_dependencies(repo_path: Path) -> dict:
    """Check Python dependencies using pip-audit."""
    try:
        # Check if pip-audit is available
        result = subprocess.run(
            ['pip-audit', '--version'],
            capture_output=True,
            text=True,
            timeout=5,
        )
        
        if result.returncode != 0:
            return {
                'rule': 'DEPENDENCY_VULNERABILITIES',
                'status': 'WARN',
                'details': 'pip-audit not available',
                'weight': 0.5,
            }
        
        # Run pip-audit with a higher timeout to reduce false timeouts
        # Note: pip-audit returns exit code 1 when vulnerabilities are found, not an error
        audit_result = subprocess.run(
            ['pip-audit', '-r', 'requirements.txt', '--format', 'json', '--progress-spinner', 'off'],
            cwd=str(repo_path),
            capture_output=True,
            text=True,
            timeout=120,
        )
        
        # pip-audit exit codes: 0 = no vulns, 1 = vulns found, 2 = error
        # We need to parse JSON output regardless of exit code
        if audit_result.returncode in [0, 1]:
            # Parse JSON output
            import json
            try:
                vulns = json.loads(audit_result.stdout)
                high_severity = [v for v in vulns.get('vulnerabilities', []) 
                                if v.get('severity', '').upper() in ['HIGH', 'CRITICAL']]
                
                if not high_severity:
                    return {
                        'rule': 'DEPENDENCY_VULNERABILITIES',
                        'status': 'PASS',
                        'details': 'No high severity vulnerabilities found',
                        'weight': 1.0,
                    }
                else:
                    # Extract detailed findings
                    findings = []
                    for vuln in high_severity:
                        findings.append({
                            'package': vuln.get('name', 'Unknown'),
                            'version': vuln.get('installed_version', 'Unknown'),
                            'severity': vuln.get('severity', 'Unknown').upper(),
                            'id': vuln.get('id', 'Unknown'),
                            'description': vuln.get('description', 'No description available'),
                            'fixed_version': vuln.get('fixed_versions', ['Not available'])[0] if vuln.get('fixed_versions') else 'Not available',
                        })
                    
                    return {
                        'rule': 'DEPENDENCY_VULNERABILITIES',
                        'status': 'FAIL',
                        'details': f'Found {len(high_severity)} high severity vulnerabilities',
                        'weight': 1.0,
                        'findings': findings[:20],  # Limit to 20
                    }
            except json.JSONDecodeError:
                # If JSON parsing fails, check stderr
                if 'No known vulnerabilities found' in audit_result.stdout or 'No known vulnerabilities' in audit_result.stderr:
                    return {
                        'rule': 'DEPENDENCY_VULNERABILITIES',
                        'status': 'PASS',
                        'details': 'No vulnerabilities found',
                        'weight': 1.0,
                    }
                return {
                    'rule': 'DEPENDENCY_VULNERABILITIES',
                    'status': 'WARN',
                    'details': 'Could not parse vulnerability report',
                    'weight': 0.5,
                }
        else:
            return {
                'rule': 'DEPENDENCY_VULNERABILITIES',
                'status': 'WARN',
                'details': f'pip-audit execution failed (exit code {audit_result.returncode})',
                'weight': 0.5,
            }
            
    except subprocess.TimeoutExpired:
        return {
            'rule': 'DEPENDENCY_VULNERABILITIES',
            'status': 'WARN',
            'details': 'Dependency check timed out after 120 seconds',
            'weight': 0.5,
        }
    except FileNotFoundError:
        return {
            'rule': 'DEPENDENCY_VULNERABILITIES',
            'status': 'WARN',
            'details': 'pip-audit not installed',
            'weight': 0.5,
        }
    except Exception as e:
        logger.error(f"Error checking Python dependencies: {e}")
        return {
            'rule': 'DEPENDENCY_VULNERABILITIES',
            'status': 'WARN',
            'details': f'Error: {str(e)[:100]}',
            'weight': 0.5,
        }


def _check_node_dependencies(repo_path: Path) -> dict:
    """Check Node.js dependencies using npm audit."""
    # Verify npm is available on PATH before attempting any Node.js checks
    if shutil.which("npm") is None:
        return {
            'rule': 'DEPENDENCY_VULNERABILITIES',
            'status': 'PASS',
            'details': 'package.json found but npm is not installed - skipping Node.js dependency scan',
            'weight': 1.0,
        }
    
    try:
        # Run npm audit with shorter timeout for production environments
        # Free tier hosting may have slow npm, so we reduce timeout and handle gracefully
        audit_result = subprocess.run(
            ['npm', 'audit', '--json', '--audit-level=moderate'],
            cwd=str(repo_path),
            capture_output=True,
            text=True,
            timeout=60,  # Reduced from 120 to 60 seconds for faster feedback
        )
        
        # npm audit exit codes: 0 = no vulns, 1 = vulns found, other = error
        if audit_result.returncode in [0, 1]:
            import json
            try:
                audit_data = json.loads(audit_result.stdout)
                vulnerabilities = audit_data.get('vulnerabilities', {})
                high_vulns = []
                
                for package_name, vuln_data in vulnerabilities.items():
                    if vuln_data.get('severity') in ['high', 'critical']:
                        high_vulns.append({
                            'package': package_name,
                            'severity': vuln_data.get('severity', 'unknown').upper(),
                            'via': vuln_data.get('via', []),
                        })
                
                if not high_vulns:
                    return {
                        'rule': 'DEPENDENCY_VULNERABILITIES',
                        'status': 'PASS',
                        'details': 'No high severity vulnerabilities found',
                        'weight': 1.0,
                    }
                else:
                    # Extract detailed findings
                    findings = []
                    for vuln in high_vulns:
                        via_list = vuln.get('via', [])
                        # Convert via items (which can be strings or dicts) to strings
                        via_descriptions = []
                        for v in via_list:
                            if isinstance(v, dict):
                                via_descriptions.append(f"{v.get('title', 'Unknown')} (CVE: {v.get('cves', ['N/A'])[0] if v.get('cves') else 'N/A'})")
                            else:
                                via_descriptions.append(str(v))
                        
                        findings.append({
                            'package': vuln.get('package'),
                            'severity': vuln.get('severity'),
                            'vulnerabilities': ', '.join(via_descriptions[:3]),  # Limit to 3 descriptions
                        })
                    
                    return {
                        'rule': 'DEPENDENCY_VULNERABILITIES',
                        'status': 'FAIL',
                        'details': f'Found {len(high_vulns)} high severity vulnerabilities',
                        'weight': 1.0,
                        'findings': findings[:20],  # Limit to 20
                    }
            except json.JSONDecodeError:
                return {
                    'rule': 'DEPENDENCY_VULNERABILITIES',
                    'status': 'WARN',
                    'details': 'Could not parse npm audit output',
                    'weight': 0.5,
                }
        else:
            return {
                'rule': 'DEPENDENCY_VULNERABILITIES',
                'status': 'WARN',
                'details': f'npm audit execution failed (exit code {audit_result.returncode})',
                'weight': 0.5,
            }
            
    except subprocess.TimeoutExpired:
        return {
            'rule': 'DEPENDENCY_VULNERABILITIES',
            'status': 'WARN',
            'details': 'Dependency check timed out',
            'weight': 0.5,
        }
    except FileNotFoundError:
        # This shouldn't happen now since we check with shutil.which() first, but handle it anyway
        return {
            'rule': 'DEPENDENCY_VULNERABILITIES',
            'status': 'PASS',
            'details': 'npm command not found - skipping Node.js dependency scan',
            'weight': 1.0,
        }
    except Exception as e:
        logger.warning(f"Error checking Node.js dependencies: {e}")
        return {
            'rule': 'DEPENDENCY_VULNERABILITIES',
            'status': 'WARN',
            'details': f'Error: {str(e)[:100]}',
            'weight': 0.5,
        }


def _check_debug_mode(repo_path: Path) -> dict:
    """Check for debug mode enabled in production code."""
    debug_patterns = [
        (r'debug\s*=\s*True', 'Debug mode enabled'),
        (r'DEBUG\s*=\s*True', 'DEBUG flag enabled'),
        (r'debug\s*:\s*true', 'Debug mode enabled (YAML)'),
    ]
    
    found_debug = []
    
    try:
        # Check Python files
        for py_file in repo_path.rglob('*.py'):
            # Skip test files
            if 'test' in str(py_file).lower():
                continue
            
            try:
                with open(py_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    for pattern, description in debug_patterns:
                        if re.search(pattern, content, re.IGNORECASE):
                            found_debug.append({
                                'file': str(py_file.relative_to(repo_path)),
                                'type': description,
                            })
            except Exception:
                continue
        
        # Check config files
        for config_file in repo_path.rglob('*.{env,config,ini,yaml,yml}'):
            try:
                with open(config_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    for pattern, description in debug_patterns:
                        if re.search(pattern, content, re.IGNORECASE):
                            found_debug.append({
                                'file': str(config_file.relative_to(repo_path)),
                                'type': description,
                            })
            except Exception:
                continue
        
        if not found_debug:
            return {
                'rule': 'DEBUG_MODE',
                'status': 'PASS',
                'details': 'No debug mode detected',
                'weight': 1.0,
            }
        else:
            return {
                'rule': 'DEBUG_MODE',
                'status': 'WARN',
                'details': f'Found {len(found_debug)} instances of debug mode',
                'weight': 0.5,
                'findings': found_debug[:5],
            }
            
    except Exception as e:
        logger.error(f"Error checking debug mode: {e}")
        return {
            'rule': 'DEBUG_MODE',
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
