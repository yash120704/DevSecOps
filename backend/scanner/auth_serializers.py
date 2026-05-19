"""
Serializers for authentication and scan reports.
"""
from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    """User registration serializer."""
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )
        return value


class LoginSerializer(serializers.Serializer):
    """User login serializer."""
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )


class ScanRequestSerializer(serializers.Serializer):
    """Scan request serializer."""
    repo_url = serializers.URLField()


class ScanReportSerializer(serializers.Serializer):
    """Scan report response serializer."""
    id = serializers.CharField()
    user_id = serializers.CharField()
    repo_url = serializers.URLField()
    repo_name = serializers.CharField()
    compliance_score = serializers.FloatField(allow_null=True)
    risk_level = serializers.CharField(allow_null=True)
    scan_status = serializers.CharField()
    report_json = serializers.JSONField(allow_null=True)
    created_at = serializers.DateTimeField()
    error_message = serializers.CharField(allow_null=True, allow_blank=True)


class SearchHistorySerializer(serializers.Serializer):
    """Search history entry serializer."""
    id = serializers.CharField()
    search_query = serializers.CharField()
    search_result = serializers.JSONField(allow_null=True)
    created_at = serializers.DateTimeField()
