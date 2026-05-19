"""
API views for scanner app with Supabase integration.
"""
import logging
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .auth_serializers import ScanRequestSerializer, ScanReportSerializer, SearchHistorySerializer
from .services.supabase_client import supabase
from .tasks import run_scan_task
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


class ScanView(APIView):
    """Endpoint to initiate a repository scan."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ScanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        repo_url = serializer.validated_data['repo_url']
        user_id = request.auth.get('user_id')
        
        try:
            # Extract repo name from URL
            repo_name = repo_url.split('/')[-1] or 'unknown'
            repo_name = repo_name.replace('.git', '')
            
            # Create pending scan report in Supabase
            scan_report = supabase.add_scan_report(
                user_id=user_id,
                repo_url=repo_url,
                repo_name=repo_name
            )
            
            if not scan_report:
                raise Exception("Failed to create scan report")
            
            # Add to search history
            try:
                supabase.add_search_history(
                    user_id=user_id,
                    search_query=repo_url,
                    search_result={'status': 'pending', 'scan_id': scan_report['id']}
                )
            except Exception as e:
                logger.warning(f"Failed to add to search history: {e}")
            
            # Start async scan task with Supabase ID
            try:
                run_scan_task.delay(scan_report['id'], user_id)
                return Response({
                    'scan_id': scan_report['id'],
                    'status': 'pending',
                    'message': 'Scan initiated successfully'
                }, status=status.HTTP_202_ACCEPTED)
            except Exception as e:
                logger.error(f"Failed to start scan task: {e}")
                # Update status to failed
                supabase.update_scan_report(
                    scan_report['id'],
                    user_id,
                    scan_status='failed',
                    error_message=str(e)
                )
                return Response({
                    'error': 'Failed to start scan',
                    'message': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        except Exception as e:
            logger.error(f"Scan creation error: {e}")
            return Response({
                'error': 'Failed to create scan',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ScanStatusView(APIView):
    """Get scan status by ID."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        user_id = request.auth.get('user_id')
        
        try:
            scan_report = supabase.get_scan_report(pk, user_id)
            if not scan_report:
                return Response(
                    {'error': 'Scan report not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = ScanReportSerializer(scan_report)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to get scan status: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ReportListView(APIView):
    """List all scan reports for authenticated user."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_id = request.auth.get('user_id')
        limit = request.query_params.get('limit', 50)
        
        try:
            reports = supabase.get_user_scan_reports(user_id, limit=int(limit))
            serializer = ScanReportSerializer(reports, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to get scan reports: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ReportDetailView(APIView):
    """Get detailed scan report for authenticated user."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        user_id = request.auth.get('user_id')
        
        try:
            report = supabase.get_scan_report(pk, user_id)
            if not report:
                return Response(
                    {'error': 'Report not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = ScanReportSerializer(report)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to get report: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class SearchHistoryView(APIView):
    """Get search history for authenticated user."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_id = request.auth.get('user_id')
        limit = request.query_params.get('limit', 10)
        
        try:
            history = supabase.get_search_history(user_id, limit=int(limit))
            serializer = SearchHistorySerializer(history, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to get search history: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def delete(self, request):
        """Clear all search history for user."""
        user_id = request.auth.get('user_id')
        
        try:
            # Delete all history entries for user
            result = (
                supabase.db_client.table('search_history')
                .delete()
                .eq('user_id', user_id)
                .execute()
            )
            
            return Response({
                'success': True,
                'message': 'Search history cleared'
            })
        except Exception as e:
            logger.error(f"Failed to clear search history: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class SearchHistoryDetailView(APIView):
    """Get or delete specific search history entry."""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, pk):
        user_id = request.auth.get('user_id')
        
        try:
            result = (
                supabase.db_client.table('search_history')
                .delete()
                .eq('id', pk)
                .eq('user_id', user_id)
                .execute()
            )
            
            if not result.data:
                return Response(
                    {'error': 'History entry not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response({'success': True, 'message': 'Entry deleted'})
        except Exception as e:
            logger.error(f"Failed to delete history entry: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
