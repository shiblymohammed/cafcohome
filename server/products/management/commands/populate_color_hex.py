from django.core.management.base import BaseCommand
from products.models import Color


class Command(BaseCommand):
    help = 'Populate hex codes for existing colors'

    # Common color mappings
    COLOR_HEX_MAP = {
        # Basic colors
        'black': '#000000',
        'white': '#FFFFFF',
        'red': '#FF0000',
        'blue': '#0000FF',
        'green': '#008000',
        'yellow': '#FFFF00',
        'orange': '#FFA500',
        'purple': '#800080',
        'pink': '#FFC0CB',
        'brown': '#A52A2A',
        'gray': '#808080',
        'grey': '#808080',
        
        # Extended colors
        'navy': '#000080',
        'teal': '#008080',
        'olive': '#808000',
        'lime': '#00FF00',
        'aqua': '#00FFFF',
        'maroon': '#800000',
        'fuchsia': '#FF00FF',
        'silver': '#C0C0C0',
        'gold': '#FFD700',
        'beige': '#F5F5DC',
        'ivory': '#FFFFF0',
        'khaki': '#F0E68C',
        'lavender': '#E6E6FA',
        'mint': '#98FF98',
        'peach': '#FFDAB9',
        'coral': '#FF7F50',
        'salmon': '#FA8072',
        'turquoise': '#40E0D0',
        'violet': '#EE82EE',
        'indigo': '#4B0082',
        'magenta': '#FF00FF',
        'cyan': '#00FFFF',
        'tan': '#D2B48C',
        'cream': '#FFFDD0',
        'charcoal': '#36454F',
        
        # Shades
        'light blue': '#ADD8E6',
        'dark blue': '#00008B',
        'light green': '#90EE90',
        'dark green': '#006400',
        'light gray': '#D3D3D3',
        'dark gray': '#A9A9A9',
        'light grey': '#D3D3D3',
        'dark grey': '#A9A9A9',
        'light pink': '#FFB6C1',
        'hot pink': '#FF69B4',
        'sky blue': '#87CEEB',
        'forest green': '#228B22',
        'sea green': '#2E8B57',
        'royal blue': '#4169E1',
        'midnight blue': '#191970',
        'powder blue': '#B0E0E6',
        'steel blue': '#4682B4',
        'slate gray': '#708090',
        'slate grey': '#708090',
    }

    def handle(self, *args, **options):
        colors = Color.objects.all()
        updated_count = 0
        
        for color in colors:
            color_name_lower = color.name.lower().strip()
            
            # Try exact match first
            if color_name_lower in self.COLOR_HEX_MAP:
                if not color.hex_code or color.hex_code == '':
                    color.hex_code = self.COLOR_HEX_MAP[color_name_lower]
                    color.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Updated {color.name} with hex code {color.hex_code}')
                    )
            else:
                # Try partial match
                for key, hex_code in self.COLOR_HEX_MAP.items():
                    if key in color_name_lower or color_name_lower in key:
                        if not color.hex_code or color.hex_code == '':
                            color.hex_code = hex_code
                            color.save()
                            updated_count += 1
                            self.stdout.write(
                                self.style.SUCCESS(f'Updated {color.name} with hex code {hex_code} (matched "{key}")')
                            )
                            break
                else:
                    if not color.hex_code or color.hex_code == '':
                        self.stdout.write(
                            self.style.WARNING(f'No hex code found for {color.name}, using default #CCCCCC')
                        )
                        color.hex_code = '#CCCCCC'
                        color.save()
                        updated_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully updated {updated_count} colors')
        )
