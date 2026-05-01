from rest_framework import serializers
from .models import PromotionSettings
from offers.models import Offer


class MarqueeOfferSerializer(serializers.ModelSerializer):
    """Lightweight offer serializer for the marquee ticker."""

    class Meta:
        model = Offer
        fields = ['id', 'name', 'description', 'discount_percentage', 'image_url']


class PromotionSettingsSerializer(serializers.ModelSerializer):
    """Serializer for PromotionSettings — used for both GET and PATCH."""

    marquee_offers_detail = MarqueeOfferSerializer(
        source='marquee_offers', many=True, read_only=True
    )
    marquee_offers = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Offer.objects.all(),
        required=False
    )
    
    popup_offers_detail = MarqueeOfferSerializer(
        source='popup_offers', many=True, read_only=True
    )
    popup_offers = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Offer.objects.all(),
        required=False
    )

    class Meta:
        model = PromotionSettings
        fields = [
            'id', 'is_marquee_enabled', 'marquee_speed',
            'marquee_offers', 'marquee_offers_detail',
            'is_popup_enabled', 'popup_strategy',
            'popup_offers', 'popup_offers_detail',
            'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']
