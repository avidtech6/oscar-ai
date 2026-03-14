# Read the file
$content = Get-Content "d:/PROJECTS/oscar-ai-new/reconstruction/oscar-ai-v2/src/lib/intelligence/unified-editor/HTMLSanitiser.ts" -Raw

# Split into lines for more precise control
$lines = $content -split "`r`n"

# Find and replace the specific line
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "\t\t\t\.replace\(/'\/g, '''''\)") {
        $lines[$i] = "`t`t`t.replace(/'/g, '#39;')"
        Write-Host "Found and replaced line $($i+1)"
    }
}

# Join the lines back
$newContent = $lines -join "`r`n"

# Write the file
Set-Content "d:/PROJECTS/oscar-ai-new/reconstruction/oscar-ai-v2/src/lib/intelligence/unified-editor/HTMLSanitiser.ts" -Value $newContent -Encoding UTF8
Write-Host "File updated successfully"