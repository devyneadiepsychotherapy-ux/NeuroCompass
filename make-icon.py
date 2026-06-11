from PIL import Image

compass = Image.open("public/compass.png").convert("RGBA")

bg = Image.new("RGBA", (180, 180), "#B8D0AE")

size = 136
compass = compass.resize((size, size), Image.LANCZOS)

offset = (180 - size) // 2
bg.paste(compass, (offset, offset), compass)

bg.convert("RGB").save("public/apple-touch-icon.png")
print("apple-touch-icon.png created in public/")
