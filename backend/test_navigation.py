"""
Test script for navigation suggestions
"""
import sys
sys.path.append('.')

from main import get_navigation_suggestions

# Test cases for navigation
test_cases = [
    "about",
    "profile",
    "tentang",
    "perusahaan",
    "kami",
    "calculator",
    "hitung",
    "hpp",
    "harga pokok",
    "biaya",
    "perhitungan",
    "menu",
    "daftar",
    "makanan",
    "minuman",
    "produk",
]

print("Testing navigation suggestions:")
print("=" * 60)

for message in test_cases:
    suggestions = get_navigation_suggestions(message)
    print(f"\nMessage: '{message}'")
    if suggestions:
        for nav in suggestions:
            print(f"  - {nav.button_text} -> {nav.section_path} ({nav.section_name})")
    else:
        print("  No navigation suggestions")
