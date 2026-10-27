# Deploy NAVYCommerce frontend. Windows PowerShell 5.1+.
[CmdletBinding()]
param(
    [string]$ResourceGroup = 'rg-navycommerce-demo',
    [string]$EnvironmentName = 'cae-navycommerce-demo',
    [string]$BackendAppName = 'navycommerce-api',
    [string]$AppName = 'navycommerce-web',
    [string]$IdentityName = 'id-navycommerce-web',
    [string]$RegistryName = 'acrnavycommercefahsa',
    [string]$Image = 'acrnavycommercefahsa.azurecr.io/navycommerce-web:demo-20261018-232835'
)

$ErrorActionPreference = 'Stop'

function Invoke-AzJson {
    param([string[]]$AzArguments)
    $result = & az @AzArguments --only-show-errors --output json
    if ($LASTEXITCODE -ne 0) { throw 'Perintah Azure gagal. Periksa error di atas tanpa mencetak secret.' }
    if ($result) { return (($result -join "`n") | ConvertFrom-Json) }
}

Get-Command az -ErrorAction Stop | Out-Null
$temporaryPath = $null
$jwtSecret = $document = $null
try {
    Write-Host 'Membaca konfigurasi backend dan environment Azure...'
    $environment = Invoke-AzJson -AzArguments @('containerapp', 'env', 'show', '-g', $ResourceGroup, '-n', $EnvironmentName)
    $backend = Invoke-AzJson -AzArguments @('containerapp', 'show', '-g', $ResourceGroup, '-n', $BackendAppName)
    $registry = Invoke-AzJson -AzArguments @('acr', 'show', '-g', $ResourceGroup, '-n', $RegistryName)
    if ($environment.properties.provisioningState -ne 'Succeeded') { throw 'Environment Azure belum siap.' }
    $backendHost = [string]$backend.properties.configuration.ingress.fqdn
    if ([string]::IsNullOrWhiteSpace($backendHost)) { throw 'Hostname backend tidak tersedia.' }
    if (-not $Image.StartsWith($registry.loginServer + '/', [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Image tidak berasal dari registry yang dipilih.'
    }
    $backendOrigin = 'https://' + $backendHost
    $backendVariables = @($backend.properties.template.containers | ForEach-Object { $_.env })
    $issuer = [string](@($backendVariables | Where-Object { $_.name -eq 'JwtSettings__Issuer' }).value)
    $audience = [string](@($backendVariables | Where-Object { $_.name -eq 'JwtSettings__Audience' }).value)
    $secretName = [string](@($backendVariables | Where-Object { $_.name -eq 'JwtSettings__Secret' }).secretRef)
    if ([string]::IsNullOrWhiteSpace($issuer) -or [string]::IsNullOrWhiteSpace($audience) -or
        [string]::IsNullOrWhiteSpace($secretName)) { throw 'Konfigurasi JWT backend tidak sesuai. Hentikan sebelum deployment.' }
    if ($secretName -notmatch '^[a-z0-9-]+$') { throw 'Nama secret JWT tidak valid.' }
    # Capture the queried value in memory. Do not print or write it into the repository.
    $jwtSecret = Invoke-AzJson -AzArguments @('containerapp', 'secret', 'list', '-g', $ResourceGroup,
        '-n', $BackendAppName, '--show-values', '--query', "[?name=='$secretName'].value | [0]")
    if ([string]::IsNullOrWhiteSpace($jwtSecret) -or [System.Text.Encoding]::UTF8.GetByteCount($jwtSecret) -lt 32) {
        throw 'JWT secret backend belum berhasil dibaca atau terlalu pendek.'
    }

    $identities = @(Invoke-AzJson -AzArguments @('identity', 'list', '-g', $ResourceGroup))
    $identity = $identities | Where-Object { $_.name -eq $IdentityName } | Select-Object -First 1
    if (-not $identity) {
        Write-Host 'Membuat identity frontend...'
        $identity = Invoke-AzJson -AzArguments @('identity', 'create', '-g', $ResourceGroup,
            '-n', $IdentityName, '--location', $environment.location)
    }
    $assignments = @(Invoke-AzJson -AzArguments @('role', 'assignment', 'list', '--scope', $registry.id))
    $hasPullRole = @($assignments | Where-Object {
        $_.principalId -eq $identity.principalId -and $_.roleDefinitionName -eq 'AcrPull'
    }).Count -gt 0
    if (-not $hasPullRole) {
        Write-Host 'Memberikan identity frontend izin AcrPull...'
        Invoke-AzJson -AzArguments @('role', 'assignment', 'create', '--assignee-object-id', $identity.principalId,
            '--assignee-principal-type', 'ServicePrincipal', '--role', 'AcrPull', '--scope', $registry.id) | Out-Null
    }

    $identityMap = @{}
    $identityMap[$identity.id] = @{}
    $document = @{
        name = $AppName
        type = 'Microsoft.App/containerApps'
        location = $environment.location
        identity = @{ type = 'UserAssigned'; userAssignedIdentities = $identityMap }
        properties = @{
            environmentId = $environment.id
            workloadProfileName = 'Consumption'
            configuration = @{
                activeRevisionsMode = 'Single'
                secrets = @(@{ name = 'jwt-secret'; value = $jwtSecret })
                registries = @(@{ server = $registry.loginServer; identity = $identity.id })
                ingress = @{
                    external = $true; targetPort = 3000; transport = 'auto'; allowInsecure = $false
                    traffic = @(@{ latestRevision = $true; weight = 100 })
                }
            }
            template = @{
                containers = @(@{
                    name = 'web'; image = $Image
                    resources = @{ cpu = 0.5; memory = '1Gi' }
                    env = @(
                        @{ name = 'NODE_ENV'; value = 'production' },
                        @{ name = 'PORT'; value = '3000' },
                        @{ name = 'HOSTNAME'; value = '0.0.0.0' },
                        @{ name = 'NEXT_TELEMETRY_DISABLED'; value = '1' },
                        @{ name = 'AUTH_API_URL'; value = $backendOrigin + '/api/Auth' },
                        @{ name = 'BACKEND_API_URL'; value = $backendOrigin + '/api' },
                        @{ name = 'NEXT_PUBLIC_AUTH_API_URL'; value = $backendOrigin + '/api/Auth' },
                        @{ name = 'AUTH_JWT_ISSUER'; value = $issuer },
                        @{ name = 'AUTH_JWT_AUDIENCE'; value = $audience },
                        @{ name = 'AUTH_JWT_SECRET'; secretRef = 'jwt-secret' }
                    )
                    probes = @(
                        @{ type = 'Startup'; tcpSocket = @{ port = 3000 }; periodSeconds = 2; timeoutSeconds = 1; failureThreshold = 120 },
                        @{ type = 'Readiness'; tcpSocket = @{ port = 3000 }; periodSeconds = 5; timeoutSeconds = 2; failureThreshold = 3 }
                    )
                })
                scale = @{
                    minReplicas = 0; maxReplicas = 1
                    rules = @(@{ name = 'http-requests'; http = @{ metadata = @{ concurrentRequests = '20' } } })
                }
            }
        }
    }

    $temporaryPath = Join-Path ([System.IO.Path]::GetTempPath()) ('navycommerce-web-' + [Guid]::NewGuid().ToString('N') + '.yaml')
    [System.IO.File]::WriteAllText($temporaryPath, ($document | ConvertTo-Json -Depth 30), [System.Text.UTF8Encoding]::new($false))
    $apps = @(Invoke-AzJson -AzArguments @('containerapp', 'list', '-g', $ResourceGroup))
    $exists = @($apps | Where-Object { $_.name -eq $AppName }).Count -gt 0
    $operation = if ($exists) { 'update' } else { 'create' }
    Write-Host ('Deploy frontend (' + $operation + '). Tunggu sampai selesai...')
    & az containerapp $operation --name $AppName --resource-group $ResourceGroup --yaml $temporaryPath `
        --query '{name:name,state:properties.provisioningState}' --output table --only-show-errors
    if ($LASTEXITCODE -ne 0) {
        throw 'Deployment frontend gagal. Jika error menyebut image pull/authorization, tunggu propagasi AcrPull lalu jalankan ulang. Untuk error lain, kirim pesannya terlebih dahulu.'
    }

    $frontend = Invoke-AzJson -AzArguments @('containerapp', 'show', '-g', $ResourceGroup, '-n', $AppName)
    $frontendHost = [string]$frontend.properties.configuration.ingress.fqdn
    if ([string]::IsNullOrWhiteSpace($frontendHost)) { throw 'Frontend dibuat tetapi hostname belum tersedia.' }
    $frontendOrigin = 'https://' + $frontendHost
    $currentCors = [string](@($backendVariables | Where-Object { $_.name -eq 'Cors__AllowedOrigins__0' }).value)
    if ($currentCors -ne $frontendOrigin) {
        Write-Host 'Menyesuaikan CORS backend dengan hostname frontend aktual...'
        & az containerapp update --name $BackendAppName --resource-group $ResourceGroup `
            --set-env-vars "Cors__AllowedOrigins__0=$frontendOrigin" `
            --query '{name:name,state:properties.provisioningState}' --output table --only-show-errors
        if ($LASTEXITCODE -ne 0) { throw 'Frontend sudah dibuat, tetapi pembaruan CORS gagal. Kirim error tanpa menghapus app.' }
    }

    Write-Host ''
    Write-Host ('Frontend URL: ' + $frontendOrigin)
    Write-Host ('Backend URL: ' + $backendOrigin)
    Write-Host ('Image: ' + $Image)
    Write-Host 'JWT issuer, audience, dan secret memakai nilai backend Azure yang sama.'
    Write-Host 'Tes beranda, /products, dan /auth. Data demo Azure belum otomatis terisi.'
}
finally {
    if ($temporaryPath -and (Test-Path -LiteralPath $temporaryPath)) {
        Remove-Item -LiteralPath $temporaryPath -Force
    }
    $jwtSecret = $document = $null
}
