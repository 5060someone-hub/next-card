import os

files = [
    'src/components/CardPreview.jsx',
    'src/pages/PublicCard.jsx',
    'src/pages/CardEditor.jsx',
    'src/pages/AdminCardEditor.jsx'
]

for f in files:
    path = os.path.join(os.getcwd(), f)
    if os.path.exists(path):
        with open(path, 'rb') as file:
            content = file.read()
        # Remove BOM if present
        if content.startswith(b'\xef\xbb\xbf'):
            content = content[3:]
        # Clean up any non-standard whitespace/hidden chars
        clean_content = content.decode('utf-8', errors='ignore').encode('utf-8')
        with open(path, 'wb') as file:
            file.write(clean_content)
        print(f'Cleaned: {f}')
