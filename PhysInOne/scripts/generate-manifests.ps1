$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot

function Get-EncodedPath($baseRelative, $fileName) {
    $encoded = [System.Uri]::EscapeDataString($fileName).Replace('%2F', '/')
    return "$baseRelative/$encoded"
}

# Showcase JSON + JS
$showcaseRoot = Join-Path $projectRoot 'static\videos\showcase'
$tabs = @('Mechanics', 'Fluid Dynamics', 'Magnetism', 'Optics')
$videoExt = @('.mp4', '.webm', '.ogg', '.mov', '.m4v')
$showcase = [ordered]@{}

foreach ($tab in $tabs) {
    $folder = Join-Path $showcaseRoot $tab
    if (Test-Path $folder) {
        $items = Get-ChildItem -LiteralPath $folder -File |
            Where-Object { $videoExt -contains $_.Extension.ToLowerInvariant() } |
            Sort-Object Name |
            ForEach-Object { Get-EncodedPath "static/videos/showcase/$tab" $_.Name }
        $showcase[$tab] = @($items)
    } else {
        $showcase[$tab] = @()
    }
}

$showcaseJson = $showcase | ConvertTo-Json -Depth 4
Set-Content -LiteralPath (Join-Path $showcaseRoot 'manifest.json') -Value $showcaseJson -Encoding UTF8
Set-Content -LiteralPath (Join-Path $showcaseRoot 'manifest.js') -Value ("window.SHOWCASE_MANIFEST = " + $showcaseJson + ";") -Encoding UTF8

# Contributors JSON + JS
$contribRoot = Join-Path $projectRoot 'static\images\Contributers'
$imageExt = @('.jpg', '.jpeg', '.png', '.webp')
$photos = @()

if (Test-Path $contribRoot) {
    $photos = Get-ChildItem -LiteralPath $contribRoot -File |
        Where-Object { $imageExt -contains $_.Extension.ToLowerInvariant() } |
        Sort-Object Name |
        ForEach-Object { Get-EncodedPath 'static/images/Contributers' $_.Name }
}

$contrib = [ordered]@{ photos = @($photos) }
$contribJson = $contrib | ConvertTo-Json -Depth 4
Set-Content -LiteralPath (Join-Path $contribRoot 'manifest.json') -Value $contribJson -Encoding UTF8
Set-Content -LiteralPath (Join-Path $contribRoot 'manifest.js') -Value ("window.CONTRIBUTORS_MANIFEST = " + $contribJson + ";") -Encoding UTF8

Write-Host 'Generated:'
Write-Host (Join-Path $showcaseRoot 'manifest.json')
Write-Host (Join-Path $showcaseRoot 'manifest.js')
Write-Host (Join-Path $contribRoot 'manifest.json')
Write-Host (Join-Path $contribRoot 'manifest.js')
