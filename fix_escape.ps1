$content = Get-Content src/lib/intelligence/unified-editor/HTMLSanitiser.ts -Raw
$content = $content -replace '\.replace\(/&/g, ''&''\)', '.replace(/&/g, ''&'')'
$content = $content -replace '\.replace\(/</g, ''<''\)', '.replace(/</g, ''<'')'
$content = $content -replace '\.replace\(/>/g, ''>''\)', '.replace(/>/g, ''>'')'
$content = $content -replace '\.replace\(/"/g, ''"''\)', '.replace(/"/g, ''"'')'
$content = $content -replace "\.replace\(/'/g, ''''''\)", ".replace(/'/g, ''''')"
Set-Content src/lib/intelligence/unified-editor/HTMLSanitiser.ts -Value $content -NoNewline
Write-Host "Fixed."