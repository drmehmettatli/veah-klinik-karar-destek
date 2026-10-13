#!/bin/bash
# Kaynak parçaları birleştirir: index.html (yerel, tam belge) ve toksidrom-artifact.html (claude.ai artifact gövdesi)
cd "$(dirname "$0")"
body(){ cat src/01-head.html; cat src/04-body.html; echo '<script>'; cat src/02-data.js; echo; cat src/03-app.js; echo '</script>'; }
{ echo '<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>img{max-width:100%}[hidden]{display:none!important}</style></head><body>'; body; echo '</body></html>'; } > index.html
body > toksidrom-artifact.html
echo "index.html $(wc -c < index.html) B, artifact $(wc -c < toksidrom-artifact.html) B"
