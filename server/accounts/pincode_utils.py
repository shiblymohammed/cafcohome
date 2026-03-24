"""Utility functions for pincode lookup."""
import json
import os
from typing import Dict, Optional, List


# Load pincode data from JSON file
PINCODE_DATA = {}
PINCODE_INDEX = {}  # Reverse index: pincode -> list of locations

json_path = os.path.join(os.path.dirname(__file__), 'pincode_data.json')
try:
    with open(json_path, 'r', encoding='utf-8') as f:
        PINCODE_DATA = json.load(f)
        
    # Build reverse index for fast pincode lookup
    for state, districts in PINCODE_DATA.items():
        if isinstance(districts, dict):
            for district, areas in districts.items():
                if isinstance(areas, dict):
                    for area, pincode in areas.items():
                        pincode_clean = pincode.strip()
                        if pincode_clean not in PINCODE_INDEX:
                            PINCODE_INDEX[pincode_clean] = []
                        PINCODE_INDEX[pincode_clean].append({
                            'area': area.strip(),
                            'district': district.strip(),
                            'state': state.strip()
                        })
    
    print(f"Loaded {len(PINCODE_INDEX)} pincodes from database")
except Exception as e:
    print(f"Warning: Could not load pincode data: {e}")


def lookup_pincode(pincode: str) -> Optional[Dict[str, any]]:
    """
    Look up location details for a given Indian pincode.
    Returns area(s), district, and state.
    
    Args:
        pincode: 6-digit Indian pincode
        
    Returns:
        Dictionary with 'areas' (list), 'district', 'state' keys, or None if not found
        If multiple areas exist for the pincode, all are returned in the 'areas' list
    """
    if not pincode or len(pincode) != 6 or not pincode.isdigit():
        return None
    
    # Check local database
    if pincode in PINCODE_INDEX:
        locations = PINCODE_INDEX[pincode]
        
        if len(locations) == 1:
            # Single area for this pincode
            return {
                'area': locations[0]['area'],
                'areas': [locations[0]['area']],
                'district': locations[0]['district'],
                'state': locations[0]['state']
            }
        else:
            # Multiple areas for this pincode
            # Use the first one as default, but provide all options
            return {
                'area': locations[0]['area'],  # Default to first area
                'areas': [loc['area'] for loc in locations],
                'district': locations[0]['district'],
                'state': locations[0]['state']
            }
    
    return None
