from rest_framework import serializers
from utils.email_service import send_contact_form_email


class ContactFormSerializer(serializers.Serializer):
    """Serializer for contact form submission."""
    
    name = serializers.CharField(required=True, max_length=200)
    email = serializers.EmailField(required=True)
    phone_number = serializers.CharField(required=True, max_length=15)
    message = serializers.CharField(required=True)
    
    def create(self, validated_data):
        """Send contact form email."""
        success = send_contact_form_email(
            name=validated_data['name'],
            email=validated_data['email'],
            phone=validated_data['phone_number'],
            message=validated_data['message']
        )
        
        if not success:
            raise serializers.ValidationError('Failed to send email. Please try again later.')
        
        return validated_data
