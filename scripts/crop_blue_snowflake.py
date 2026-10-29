from PIL import Image

img = Image.open('temp_frogs/IMG_4567.jpg')
w, h = img.size

# Find frog bounding box (pixels not near white/light gray background)
left, top, right, bottom = w, h, 0, 0
for y in range(0, h, 10):
    for x in range(0, w, 10):
        r, g, b = img.getpixel((x, y))
        # background is very light
        if not (r > 210 and g > 210 and b > 210):
            left = min(left, x)
            top = min(top, y)
            right = max(right, x)
            bottom = max(bottom, y)

print(f"Frog bounding box: ({left}, {top}, {right}, {bottom}), width={right-left}, height={bottom-top}")

# Crop with padding
pad_x = int((right - left) * 0.1)
pad_y = int((bottom - top) * 0.1)
c_left = max(0, left - pad_x)
c_top = max(0, top - pad_y)
c_right = min(w, right + pad_x)
c_bottom = min(h, bottom + pad_y)

cropped = img.crop((c_left, c_top, c_right, c_bottom))
# Resize to 900x675
cropped.thumbnail((900, 900), Image.Resampling.LANCZOS)
cropped.save('temp_frogs/blue_snowflake_preview.jpg', quality=85, optimize=True)
print("Saved cropped blue_snowflake_preview.jpg:", cropped.size)
