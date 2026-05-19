"""
Policy Engine - Central orchestrator for all checks.
"""
import logging
from . import ci_checks, quality_checks, security_checks, governance_checks

logger = logging.getLogger(__name__)


class PolicyEngine:
    """Orchestrates execution of all policy check modules."""
    
    def __init__(self):
        self.modules = {
            'ci': ci_checks,
            'quality': quality_checks,
            'security': security_checks,
            'governance': governance_checks,
        }
    
    def run(self, repo_path: str) -> dict:
        """
        Execute all policy check modules.
        
        Args:
            repo_path: Path to cloned repository
        
        Returns:
            Dictionary containing results from all modules
        """
        results = {
            'ci_hygiene': {},
            'code_quality': {},
            'security': {},
            'governance': {},
        }
        
        try:
            # Run CI Hygiene checks
            logger.info("Running CI Hygiene checks...")
            results['ci_hygiene'] = ci_checks.run_ci_checks(repo_path)
            
            # Run Code Quality checks
            logger.info("Running Code Quality checks...")
            results['code_quality'] = quality_checks.run_quality_checks(repo_path)
            
            # Run Security checks
            logger.info("Running Security checks...")
            results['security'] = security_checks.run_security_checks(repo_path)
            
            # Run Governance checks
            logger.info("Running Governance checks...")
            results['governance'] = governance_checks.run_governance_checks(repo_path)
            
        except Exception as e:
            logger.error(f"Error running policy engine: {e}")
            raise
        
        return results
