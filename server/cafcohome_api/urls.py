"""
URL configuration for cafcohome_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from .health import health_check
from .backup_views import BackupView, BackupPreviewView, RestoreView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/v1/', include('accounts.urls')),
    path('api/v1/', include('products.urls')),
    path('api/v1/', include('orders.urls')),
    path('api/v1/', include('offers.urls')),
    path('api/v1/', include('blog.urls')),
    path('api/v1/', include('reviews.urls')),
    path('api/v1/', include('inventory.urls')),
    # Backup & Restore
    path('api/v1/backup/', BackupView.as_view(), name='backup'),
    path('api/v1/backup/preview/', BackupPreviewView.as_view(), name='backup-preview'),
    path('api/v1/backup/restore/', RestoreView.as_view(), name='backup-restore'),
]
