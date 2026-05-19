"""
Celery tasks for async scanning with Supabase integration.
"""
import logging
from celery import shared_task
from django.conf import settings

from .services.repo_cloner import RepoCloner
from .services.policy_engine import PolicyEngine
from .services.report_builder import build_report
from .services.supabase_client import supabase

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def run_scan_task(self, scan_report_id: str, user_id: str):
    """
    Celery task to run repository scan with Supabase integration.
    
    Args:
        scan_report_id: ID of scan report in Supabase
        user_id: Supabase user ID
    """
    repo_cloner = RepoCloner()
    repo_path = None
    
    try:
        # Get scan report from Supabase
        scan_report = supabase.get_scan_report(scan_report_id, user_id)
        if not scan_report:
            raise ValueError(f"Scan report {scan_report_id} not found")
        
        # Update status to running
        supabase.update_scan_report(
            scan_report_id,
            user_id,
            scan_status='running'
        )
        
        # Clone repository
        logger.info(f"Cloning repository: {scan_report['repo_url']}")
        repo_path, repo_name = repo_cloner.clone(scan_report['repo_url'])
        
        # Run policy engine
        logger.info("Running policy engine...")
        policy_engine = PolicyEngine()
        check_results = policy_engine.run(repo_path)
        
        # Build report
        logger.info("Building report...")
        report = build_report(
            scan_report['repo_url'],
            repo_name,
            check_results
        )
        
        # Update scan report with results
        supabase.update_scan_report(
            scan_report_id,
            user_id,
            compliance_score=report['score'],
            risk_level=report['risk_level'],
            report_json=report,
            scan_status='completed'
        )
        
        logger.info(f"Scan completed successfully: {scan_report_id}")
        
    except Exception as e:
        logger.error(f"Scan failed: {e}")
        
        try:
            # Update status to failed in Supabase
            supabase.update_scan_report(
                scan_report_id,
                user_id,
                scan_status='failed',
                error_message=str(e)
            )
        except Exception as update_error:
            logger.error(f"Failed to update scan status: {update_error}")
        
        # Retry if not max retries
        if self.request.retries < self.max_retries:
            logger.info(f"Retrying scan task, attempt {self.request.retries + 1}")
            raise self.retry(exc=e, countdown=60)
        
    finally:
        # Cleanup cloned repository
        if repo_path:
            try:
                repo_cloner.cleanup(repo_path)
            except Exception as e:
                logger.warning(f"Failed to cleanup repo: {e}")
