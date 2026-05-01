$p = Invoke-RestMethod -Uri 'http://localhost:5018/api/Despachos/clientes/buscar?termino=205' -Method Get
$id = $p[0].idEmpresa
$bl = 'MSCU' + (Get-Random -Minimum 100000 -Maximum 999999)
$hash = @{ idEmpresa = $id; codigoBl = $bl }
$body = $hash | ConvertTo-Json
Write-Output '---REQUEST---'
Write-Output $body
Write-Output '---RESPONSE---'
Invoke-RestMethod -Uri 'http://localhost:5018/api/Despachos' -Method Post -Body $body -ContentType 'application/json' | ConvertTo-Json -Depth 5
Write-Output '---BL-USED---'
Write-Output $bl
