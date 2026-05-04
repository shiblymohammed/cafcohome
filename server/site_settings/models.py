from django.db import models
from offers.models import Offer


class PromotionSettings(models.Model):
    """Singleton model for site-wide promotion settings."""

    is_marquee_enabled = models.BooleanField(
        default=False,
        help_text="Enable the scrolling offer ticker above the navbar"
    )
    marquee_speed = models.IntegerField(
        default=40,
        help_text="Scrolling speed in seconds (lower = faster)"
    )
    marquee_offers = models.ManyToManyField(
        Offer,
        blank=True,
        related_name='marquee_settings',
        help_text="Active offers to display in the marquee ticker"
    )

    # Welcome Pop-up Settings
    is_popup_enabled = models.BooleanField(
        default=False,
        help_text="Enable the first-visit welcome offer pop-up"
    )
    
    POPUP_STRATEGIES = [
        ('single', 'Single Offer'),
        ('cycle_daily', 'Cycle Daily'),
        ('cycle_hourly', 'Cycle Hourly'),
    ]
    popup_strategy = models.CharField(
        max_length=20,
        choices=POPUP_STRATEGIES,
        default='single',
        help_text="How to cycle through multiple popup offers"
    )
    popup_offers = models.ManyToManyField(
        Offer,
        blank=True,
        related_name='popup_settings',
        help_text="Active offers to display in the welcome pop-up"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'promotion_settings'
        verbose_name = 'Promotion Settings'
        verbose_name_plural = 'Promotion Settings'

    def __str__(self):
        return f"Promotion Settings (Marquee: {'ON' if self.is_marquee_enabled else 'OFF'})"

    def save(self, *args, **kwargs):
        """Enforce singleton — only one instance allowed."""
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        """Get or create the singleton instance."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class BackupHistory(models.Model):
    """Tracks backup and restore operations."""

    ACTION_CHOICES = [
        ('backup', 'Backup'),
        ('restore', 'Restore'),
    ]
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('partial', 'Partial Success'),
        ('failed', 'Failed'),
    ]

    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='success')
    performed_by = models.CharField(max_length=200, blank=True, default='')
    filename = models.CharField(max_length=500, blank=True, default='')
    file_size = models.BigIntegerField(null=True, blank=True)
    strategy = models.CharField(max_length=20, blank=True, default='')
    records_created = models.IntegerField(default=0)
    records_overwritten = models.IntegerField(default=0)
    records_skipped = models.IntegerField(default=0)
    records_renamed = models.IntegerField(default=0)
    records_errors = models.IntegerField(default=0)
    total_records = models.IntegerField(default=0)
    error_message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'backup_history'
        ordering = ['-created_at']
        verbose_name = 'Backup History'
        verbose_name_plural = 'Backup History'

    def __str__(self):
        return f"{self.get_action_display()} — {self.created_at.strftime('%Y-%m-%d %H:%M')}"
