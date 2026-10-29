from PIL import Image

for f in ['IMG_4567.jpg', 'IMG_4554.jpg', 'IMG_4544.jpg']:
    p = 'temp_frogs/' + f
    img = Image.open(p)
    w, h = img.size
    # Check color
    pixels = list(img.getdata())
    r_avg = sum(px[0] for px in pixels) / len(pixels)
    g_avg = sum(px[1] for px in pixels) / len(pixels)
    b_avg = sum(px[2] for px in pixels) / len(pixels)
    print(f"{f}: size={w}x{h}, Avg RGB=({r_avg:.1f}, {g_avg:.1f}, {b_avg:.1f})")

