$content = Get-Content "d:/PROJECTS/oscar-ai-new/reconstruction/oscar-ai-v2/src/lib/intelligence/unified-editor/HTMLSanitiser.ts" -Raw
$content = $content -replace ".replace(/'/g, ''')", ".replace(/'/g, '#39;')"
Set-Content "d:/PROJECTS/oscar-ai-new/reconstruction/oscar-ai-v2/src/lib/intelligence/unified-editor/HTMLSanitiser.ts" -Value $content -Encoding UTF8
Write-Host "File updated successfully"