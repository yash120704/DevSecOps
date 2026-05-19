"""
Scoring Engine - Calculates compliance score from check results.
"""
import logging

logger = logging.getLogger(__name__)

# Module weights
MODULE_WEIGHTS = {
    'ci_hygiene': 0.30,      # 30%
    'code_quality': 0.25,    # 25%
    'security': 0.30,        # 30%
    'governance': 0.15,      # 15%
}


def calculate_score(check_results: dict) -> dict:
    """
    Calculate compliance score from check results.
    
    Args:
        check_results: Dictionary with results from all modules
    
    Returns:
        Dictionary with score and risk level
    """
    module_scores = {}
    total_score = 0.0
    
    for module_name, module_weight in MODULE_WEIGHTS.items():
        if module_name not in check_results:
            logger.warning(f"Module {module_name} not found in results")
            continue
        
        module_result = check_results[module_name]
        module_score = _calculate_module_score(module_result)
        weighted_score = module_score * module_weight
        module_scores[module_name] = {
            'raw_score': module_score,
            'weighted_score': weighted_score,
            'weight': module_weight,
        }
        total_score += weighted_score
    
    # Calculate risk level
    risk_level = _determine_risk_level(total_score)
    
    return {
        'final_score': round(total_score * 100, 2),  # Convert to percentage
        'risk_level': risk_level,
        'module_scores': module_scores,
        'max_possible_score': 100.0,
    }


def _calculate_module_score(module_result: dict) -> float:
    """
    Calculate score for a single module.
    
    Each rule contributes based on its weight and status:
    - PASS: full weight
    - WARN: half weight
    - FAIL: zero weight
    """
    if 'rules' not in module_result:
        return 0.0
    
    rules = module_result['rules']
    if not rules:
        return 0.0
    
    total_weight = 0.0
    achieved_weight = 0.0
    
    for rule in rules:
        rule_weight = rule.get('weight', 1.0)
        status = rule.get('status', 'FAIL')
        
        total_weight += rule_weight
        
        if status == 'PASS':
            achieved_weight += rule_weight
        elif status == 'WARN':
            achieved_weight += rule_weight * 0.5
        # FAIL contributes 0
    
    if total_weight == 0:
        return 0.0
    
    return achieved_weight / total_weight


def _determine_risk_level(score: float) -> str:
    """
    Determine risk level based on score.
    
    Args:
        score: Score between 0.0 and 1.0
    
    Returns:
        Risk level string
    """
    percentage = score * 100
    
    if percentage >= 90:
        return 'Low'
    elif percentage >= 70:
        return 'Medium'
    else:
        return 'High'
