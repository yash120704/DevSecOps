"""
Repository cloning service.
"""
import os
import subprocess
import tempfile
import shutil
import logging
import time
from urllib.parse import urlparse
from django.conf import settings
from ..utils.validators import validate_github_url

logger = logging.getLogger(__name__)


class RepoCloner:
    """Handles cloning of Git repositories."""
    
    def __init__(self):
        self.temp_dir = settings.TEMP_SCAN_DIR
        os.makedirs(self.temp_dir, exist_ok=True)
    
    def clone(self, repo_url: str, timeout: int = None) -> tuple[str, str]:
        """
        Clone a repository to a temporary directory.
        
        Args:
            repo_url: GitHub repository URL
            timeout: Maximum time to wait for clone (seconds, defaults to SCAN_TIMEOUT)
        
        Returns:
            Tuple of (repo_path, repo_name)
        
        Raises:
            Exception: If cloning fails
        """
        if timeout is None:
            timeout = settings.SCAN_TIMEOUT
        
        # Validate URL
        is_valid, error_msg = validate_github_url(repo_url)
        if not is_valid:
            raise ValueError(error_msg)
        
        parsed = urlparse(repo_url)
        
        # Extract repo name
        repo_name = repo_url.rstrip('/').split('/')[-1]
        if repo_name.endswith('.git'):
            repo_name = repo_name[:-4]
        
        # Create temporary directory for this scan
        temp_path = tempfile.mkdtemp(dir=self.temp_dir, prefix=f"scan_{repo_name}_")
        
        try:
            # Clone repository
            logger.info(f"Cloning {repo_url} to {temp_path}")
            result = subprocess.run(
                ['git', 'clone', '--depth', '1', repo_url, temp_path],
                capture_output=True,
                text=True,
                timeout=timeout,
                check=True,
            )
            
            logger.info(f"Successfully cloned {repo_url}")
            return temp_path, repo_name
            
        except subprocess.TimeoutExpired:
            shutil.rmtree(temp_path, ignore_errors=True)
            raise Exception(f"Repository clone timed out after {timeout} seconds")
        except subprocess.CalledProcessError as e:
            shutil.rmtree(temp_path, ignore_errors=True)
            error_msg = e.stderr or e.stdout or "Unknown error"
            raise Exception(f"Failed to clone repository: {error_msg}")
        except Exception as e:
            shutil.rmtree(temp_path, ignore_errors=True)
            raise Exception(f"Unexpected error during clone: {str(e)}")
    
    def cleanup(self, repo_path: str):
        """Remove temporary repository directory."""
        if not os.path.exists(repo_path):
            return
        
        # On Windows, Git can briefly lock files like .git/FETCH_HEAD or .git/objects/pack/*.idx
        # Retry a few times with backoff before giving up to avoid noisy cleanup warnings.
        max_attempts = 5
        for attempt in range(1, max_attempts + 1):
            try:
                shutil.rmtree(repo_path)
                logger.info(f"Cleaned up {repo_path}")
                return
            except (OSError, PermissionError) as e:
                winerror = getattr(e, "winerror", None)
                # WinError 32: "The process cannot access the file because it is being used by another process"
                # WinError 5: "Access is denied" (often temporary on Windows with locked files)
                if winerror in (32, 5) and attempt < max_attempts:
                    wait_time = 0.5 * attempt  # Exponential backoff: 0.5s, 1s, 1.5s, 2s
                    logger.debug(f"Retry {attempt}/{max_attempts} cleanup after {wait_time}s (WinError {winerror})")
                    time.sleep(wait_time)
                    continue
                # If it's not a retryable error or we've exhausted retries, log and give up
                if attempt == max_attempts:
                    logger.warning(f"Failed to cleanup {repo_path} after {max_attempts} attempts: {e}")
                else:
                    logger.warning(f"Failed to cleanup {repo_path}: {e}")
                return
            except Exception as e:
                # Unexpected error - log and give up immediately
                logger.warning(f"Unexpected error cleaning up {repo_path}: {e}")
                return
