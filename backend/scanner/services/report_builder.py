"""
Report Builder - Generates structured reports from scan results.
"""
from datetime import datetime
from .scoring_engine import calculate_score


def build_report(repo_url: str, repo_name: str, check_results: dict) -> dict:
    """
    Build comprehensive scan report.
    
    Args:
        repo_url: Repository URL
        repo_name: Repository name
        check_results: Results from policy engine
    
    Returns:
        Complete report dictionary
    """
    # Calculate score
    score_data = calculate_score(check_results)
    
    # Build report
    report = {
        'repo_url': repo_url,
        'repo_name': repo_name,
        'timestamp': datetime.utcnow().isoformat(),
        'ci_hygiene': check_results.get('ci_hygiene', {}),
        'code_quality': check_results.get('code_quality', {}),
        'security': check_results.get('security', {}),
        'governance': check_results.get('governance', {}),
        'score': score_data['final_score'],
        'risk_level': score_data['risk_level'],
        'module_scores': score_data['module_scores'],
    }
    
    # Extract failures and warnings for quick reference
    failures = []
    warnings = []
    
    for module_name in ['ci_hygiene', 'code_quality', 'security', 'governance']:
        module_result = check_results.get(module_name, {})
        rules = module_result.get('rules', [])
        
        for rule in rules:
            if rule.get('status') == 'FAIL':
                failures.append({
                    'module': module_name,
                    'rule': rule.get('rule'),
                    'details': rule.get('details'),
                    'findings': rule.get('findings', []),  # Include detailed findings
                })
            elif rule.get('status') == 'WARN':
                warnings.append({
                    'module': module_name,
                    'rule': rule.get('rule'),
                    'details': rule.get('details'),
                    'findings': rule.get('findings', []),  # Include detailed findings
                })
    
    report['failures'] = failures
    report['warnings'] = warnings
    
    return report
