#!/bin/bash
set -e
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"

cd "$(dirname "$0")"

# Restaurar index.html al entry point de dev si fue sobreescrito por un deploy anterior
if grep -q '/presupuestoeuropa2027/assets/' index.html; then
  cat > index.html << 'EOF'
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><text y='56' font-size='56'>✈</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="apple-mobile-web-app-title" content="Europa 2027" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <title>Europa 2027 — Presupuesto</title>
    <script type="module" src="/src/main.jsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
EOF
fi

npm run build

cp dist/index.html index.html
cp dist/assets/* assets/

git add index.html assets/
git commit -m "${1:-deploy}"
git push origin main

echo "✓ Deploy completo"
