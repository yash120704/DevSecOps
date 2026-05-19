"""
Supabase client and utilities for backend integration.
Handles authentication, database operations, and search history.
"""
import os
import json
from supabase import create_client, Client
import logging

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Singleton Supabase client for the application."""
    
    _instance = None
    _client: Client = None
    _db_client: Client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseClient, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize Supabase client with credentials from environment."""
        try:
            supabase_url = os.getenv('SUPABASE_URL')
            supabase_anon_key = os.getenv('SUPABASE_ANON_KEY')
            supabase_service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
            
            if not supabase_url or not supabase_anon_key:
                raise ValueError(
                    "Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment"
                )
            
            # Client for auth operations (signup/login/token verification)
            self._client = create_client(supabase_url, supabase_anon_key)

            # Client for database operations from backend.
            # Service role bypasses RLS and we enforce user scoping in queries.
            db_key = supabase_service_role_key or supabase_anon_key
            self._db_client = create_client(supabase_url, db_key)

            logger.info("Supabase clients initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise
    
    @property
    def client(self) -> Client:
        """Get Supabase auth client instance."""
        if self._client is None:
            self._initialize()
        return self._client

    @property
    def db_client(self) -> Client:
        """Get Supabase database client instance."""
        if self._db_client is None:
            self._initialize()
        return self._db_client
    
    def verify_token(self, token: str) -> dict:
        """
        Verify JWT token and get user info.
        
        Args:
            token: JWT token from request header
            
        Returns:
            User data dict with user_id, email, etc.
        """
        try:
            user = self.client.auth.get_user(token)
            return {
                'user_id': user.user.id,
                'email': user.user.email,
                'user_metadata': user.user.user_metadata or {}
            }
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            raise ValueError(f"Invalid token: {str(e)}")
    
    def register_user(self, email: str, password: str) -> dict:
        """
        Register a new user with email and password.
        
        Args:
            email: User email
            password: User password
            
        Returns:
            User data and session
        """
        try:
            response = self.client.auth.sign_up({
                "email": email,
                "password": password
            })
            return {
                'user': {
                    'user_id': response.user.id,
                    'email': response.user.email
                },
                'session': {
                    'access_token': response.session.access_token if response.session else None,
                    'refresh_token': response.session.refresh_token if response.session else None
                }
            }
        except Exception as e:
            logger.error(f"Registration failed: {e}")
            raise
    
    def login_user(self, email: str, password: str) -> dict:
        """
        Login user with email and password.
        
        Args:
            email: User email
            password: User password
            
        Returns:
            User data and session tokens
        """
        try:
            response = self.client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            return {
                'user': {
                    'user_id': response.user.id,
                    'email': response.user.email
                },
                'session': {
                    'access_token': response.session.access_token,
                    'refresh_token': response.session.refresh_token
                }
            }
        except Exception as e:
            logger.error(f"Login failed: {e}")
            raise
    
    def add_scan_report(self, user_id: str, repo_url: str, repo_name: str) -> dict:
        """
        Create a new scan report for a user.
        
        Args:
            user_id: Supabase user ID
            repo_url: GitHub repository URL
            repo_name: Repository name
            
        Returns:
            Created scan report with ID
        """
        try:
            data = {
                'user_id': user_id,
                'repo_url': repo_url,
                'repo_name': repo_name,
                'scan_status': 'pending'
            }
            
            response = self.db_client.table('scan_reports').insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Failed to add scan report: {e}")
            raise
    
    def update_scan_report(self, scan_id: str, user_id: str, **updates) -> dict:
        """
        Update an existing scan report.
        
        Args:
            scan_id: Scan report ID
            user_id: User ID (for verification)
            **updates: Fields to update
            
        Returns:
            Updated scan report
        """
        try:
            response = (
                self.db_client.table('scan_reports')
                .update(updates)
                .eq('id', scan_id)
                .eq('user_id', user_id)
                .execute()
            )
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Failed to update scan report: {e}")
            raise
    
    def get_user_scan_reports(self, user_id: str, limit: int = 50) -> list:
        """
        Get all scan reports for a user.
        
        Args:
            user_id: Supabase user ID
            limit: Max number of reports to fetch
            
        Returns:
            List of scan reports
        """
        try:
            response = (
                self.db_client.table('scan_reports')
                .select('*')
                .eq('user_id', user_id)
                .order('created_at', desc=True)
                .limit(limit)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Failed to get scan reports: {e}")
            raise
    
    def get_scan_report(self, scan_id: str, user_id: str) -> dict:
        """
        Get a specific scan report for a user.
        
        Args:
            scan_id: Scan report ID
            user_id: User ID (for verification)
            
        Returns:
            Scan report data
        """
        try:
            response = (
                self.db_client.table('scan_reports')
                .select('*')
                .eq('id', scan_id)
                .eq('user_id', user_id)
                .single()
                .execute()
            )
            return response.data if response.data else None
        except Exception as e:
            logger.error(f"Failed to get scan report: {e}")
            raise
    
    def add_search_history(self, user_id: str, search_query: str, search_result: dict = None) -> dict:
        """
        Add entry to user's search history. Automatically maintains last 10 entries via trigger.
        
        Args:
            user_id: Supabase user ID
            search_query: Search query/GitHub URL
            search_result: Search result JSON
            
        Returns:
            Created history entry
        """
        try:
            data = {
                'user_id': user_id,
                'search_query': search_query,
                'search_result': search_result or {}
            }
            
            response = self.db_client.table('search_history').insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Failed to add search history: {e}")
            raise
    
    def get_search_history(self, user_id: str, limit: int = 10) -> list:
        """
        Get user's search history (last N entries).
        
        Args:
            user_id: Supabase user ID
            limit: Max number of entries (default 10)
            
        Returns:
            List of search history entries
        """
        try:
            response = (
                self.db_client.table('search_history')
                .select('*')
                .eq('user_id', user_id)
                .order('created_at', desc=True)
                .limit(limit)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Failed to get search history: {e}")
            raise


# Global Supabase client instance
supabase = SupabaseClient()
