$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$showcaseRoot = Join-Path $projectRoot 'static\videos\showcase'
$outputPath = Join-Path $showcaseRoot 'manifest.json'
$categories = @('Mechanics', 'Fluid Dynamics', 'Magnetism', 'Optics')
$allowedExt = @('.mp4', '.webm', '.ogg', '.mov', '.m4v')

$manifest = [ordered]@{}

foreach ($category in $categories) {
    $folder = Join-Path $showcaseRoot $category
    if (Test-Path $folder) {
        $files = Get-ChildItem -LiteralPath $folder -File |
            Where-Object { $allowedExt -contains $_.Extension.ToLowerInvariant() } |
            Sort-Object Name |
            ForEach-Object {
                $safeName = [System.Uri]::EscapeDataString($_.Name).Replace('%2F', '/')
                "static/videos/showcase/$category/$safeName"
            }
        $manifest[$category] = @($files)
    } else {
        $manifest[$category] = @()
    }
}

$manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $outputPath -Encoding UTF8
Write-Host "Generated showcase manifest: $outputPath"
