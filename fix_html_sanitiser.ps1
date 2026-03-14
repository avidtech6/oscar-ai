$content = Get-Content "src/lib/intelligence/unified-editor/HTMLSanitiser.ts"
$content = $content -replace "\t\t\t.replace(/'/g, ''')", "\t\t\t.replace(/'/g, '#39;')"
Set-Content "src/lib/intelligence/unified-editor/HTMLSanitiser.ts" -Value $content -Encoding UTF8
Write-Host "File updated successfully"