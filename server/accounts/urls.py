from django.urls import path
from .views import (
    UserRegistrationView,
    UserLoginView,
    GoogleAuthView,
    StaffLoginView,
    LogoutView,
    StaffCreateView,
    StaffListView,
    UserListView,
    UserDetailView,
    UserBlockView,
    UserUnblockView,
    UserDeleteView,
    ContactFormView,
    UserProfileView,
    PincodeLookupView
)
from .dashboard_views import DashboardStatsView
from .otp_views import SendOTPView, VerifyOTPView, ResendOTPView

app_name = 'accounts'

urlpatterns = [
    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # Authentication
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', UserLoginView.as_view(), name='login'),
    path('auth/google/', GoogleAuthView.as_view(), name='google-login'),
    path('auth/admin-login/', StaffLoginView.as_view(), name='admin-login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    
    # OTP Verification
    path('auth/otp/send/', SendOTPView.as_view(), name='send-otp'),
    path('auth/otp/verify/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/otp/resend/', ResendOTPView.as_view(), name='resend-otp'),
    
    # User profile
    path('users/profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Pincode lookup
    path('pincode/<str:pincode>/', PincodeLookupView.as_view(), name='pincode-lookup'),
    
    # Staff management
    path('staff/', StaffListView.as_view(), name='staff-list'),
    path('staff/create/', StaffCreateView.as_view(), name='staff-create'),
    
    # User management
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('users/<int:pk>/block/', UserBlockView.as_view(), name='user-block'),
    path('users/<int:pk>/unblock/', UserUnblockView.as_view(), name='user-unblock'),
    path('users/<int:pk>/delete/', UserDeleteView.as_view(), name='user-delete'),
    
    # Contact form
    path('contact/', ContactFormView.as_view(), name='contact-form'),
]
