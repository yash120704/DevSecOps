"""
Database models for scan reports.
"""
from django.db import models
from django.utils import timezone


class ScanReport(models.Model):
    """Stores scan results for repositories."""
    
    RISK_LEVELS = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]
    
    repo_url = models.URLField(max_length=500)
    repo_name = models.CharField(max_length=255)
    compliance_score = models.FloatField()
    risk_level = models.CharField(max_length=50, choices=RISK_LEVELS)
    report_json = models.JSONField()
    scan_status = models.CharField(max_length=50, default='pending')  # pending, running, completed, failed
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['repo_url']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.repo_name} - {self.compliance_score}% ({self.risk_level})"
