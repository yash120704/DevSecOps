"""
URL configuration for scanner app.
"""
from django.urls import path
from . import views, auth_views

app_name = 'scanner'

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', auth_views.register_view, name='register'),
    path('auth/login/', auth_views.login_view, name='login'),
    path('auth/logout/', auth_views.logout_view, name='logout'),
    path('auth/refresh/', auth_views.refresh_token_view, name='refresh-token'),
    path('auth/verify/', auth_views.verify_token_view, name='verify-token'),
    
    # Scan endpoints
    path('scan/', views.ScanView.as_view(), name='scan'),
    path('reports/', views.ReportListView.as_view(), name='reports'),
    path('reports/<str:pk>/', views.ReportDetailView.as_view(), name='report-detail'),
    path('scan-status/<str:pk>/', views.ScanStatusView.as_view(), name='scan-status'),
    
    # Search history endpoints
    path('history/', views.SearchHistoryView.as_view(), name='search-history'),
    path('history/<str:pk>/', views.SearchHistoryDetailView.as_view(), name='history-detail'),
]
