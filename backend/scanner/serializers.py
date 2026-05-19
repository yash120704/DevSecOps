"""
Serializers for scanner API.
"""
from rest_framework import serializers
from .models import ScanReport


class ScanRequestSerializer(serializers.Serializer):
    """Serializer for scan request."""
    repo_url = serializers.URLField(required=True)
    
    def validate_repo_url(self, value):
        """Validate that URL is from GitHub."""
        from django.conf import settings
        from urllib.parse import urlparse
        
        parsed = urlparse(value)
        if parsed.hostname not in settings.ALLOWED_GIT_HOSTS:
            raise serializers.ValidationError(
                f"Only repositories from {', '.join(settings.ALLOWED_GIT_HOSTS)} are allowed."
            )
        return value


class ScanReportSerializer(serializers.ModelSerializer):
    """Serializer for scan report."""
    
    class Meta:
        model = ScanReport
        fields = [
            'id',
            'repo_url',
            'repo_name',
            'compliance_score',
            'risk_level',
            'report_json',
            'scan_status',
            'error_message',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'repo_name',
            'compliance_score',
            'risk_level',
            'report_json',
            'scan_status',
            'error_message',
            'created_at',
            'updated_at',
        ]
