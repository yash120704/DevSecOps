"""
Django admin configuration for scanner app.
"""
from django.contrib import admin
from .models import ScanReport


@admin.register(ScanReport)
class ScanReportAdmin(admin.ModelAdmin):
    list_display = ['repo_name', 'repo_url', 'compliance_score', 'risk_level', 'scan_status', 'created_at']
    list_filter = ['risk_level', 'scan_status', 'created_at']
    search_fields = ['repo_name', 'repo_url']
    readonly_fields = ['created_at', 'updated_at', 'report_json']
    
    fieldsets = (
        ('Repository Information', {
            'fields': ('repo_url', 'repo_name')
        }),
        ('Scan Results', {
            'fields': ('compliance_score', 'risk_level', 'scan_status', 'error_message')
        }),
        ('Report Data', {
            'fields': ('report_json',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
