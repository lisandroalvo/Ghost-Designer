#!/bin/bash
# Create simple placeholder icons using ImageMagick or Python
python3 << 'PYTHON_EOF'
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    # Create image with dark background
    img = Image.new('RGB', (size, size), '#0B0D10')
    draw = ImageDraw.Draw(img)
    
    # Draw rounded rectangle background
    draw.rounded_rectangle([(0, 0), (size, size)], radius=int(size*0.22), fill='#0B0D10')
    
    # Draw microphone shape
    center_x, center_y = size // 2, size // 2
    scale = size / 192
    
    # Mic body (rounded rectangle)
    mic_width = int(36 * scale)
    mic_height = int(50 * scale)
    mic_x = center_x - mic_width // 2
    mic_y = center_y - int(45 * scale)
    draw.rounded_rectangle(
        [(mic_x, mic_y), (mic_x + mic_width, mic_y + mic_height)],
        radius=int(18 * scale),
        fill='#87F1C6'
    )
    
    # Mic stand base
    stand_y = center_y + int(10 * scale)
    stand_width = int(50 * scale)
    draw.arc(
        [(center_x - stand_width//2, stand_y - stand_width//2), 
         (center_x + stand_width//2, stand_y + stand_width//2)],
        start=0, end=180, fill='#87F1C6', width=int(6 * scale)
    )
    
    # Vertical line
    draw.line(
        [(center_x, center_y + int(35 * scale)), (center_x, center_y + int(50 * scale))],
        fill='#87F1C6', width=int(6 * scale)
    )
    
    # Base horizontal line
    base_y = center_y + int(50 * scale)
    draw.line(
        [(center_x - int(15 * scale), base_y), (center_x + int(15 * scale), base_y)],
        fill='#87F1C6', width=int(6 * scale)
    )
    
    # Save
    img.save(f'icon-{size}.png', 'PNG')
    print(f"Created icon-{size}.png")

# Create both sizes
create_icon(192)
create_icon(512)
PYTHON_EOF
