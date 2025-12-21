import base64

text = "cm9vdA"
encoded = base64.b64encode(text.encode("utf-8")).decode("utf-8")

print(encoded)