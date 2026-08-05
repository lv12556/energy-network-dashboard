param([int]$Port = 5173)

$root = Split-Path -Parent $PSCommandPath
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()

Write-Host "Energy dashboard: http://localhost:$Port/"
while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $requestBuffer = [byte[]]::new(4096)
    $requestLength = $stream.Read($requestBuffer, 0, $requestBuffer.Length)
    $request = [System.Text.Encoding]::ASCII.GetString($requestBuffer, 0, $requestLength)
    $requestPath = ([regex]::Match($request, '^GET\s+([^\s?]+)')).Groups[1].Value
    if ($requestPath -eq '/') { $requestPath = '/index.html' }
    $allowedPaths = @('/index.html', '/styles.css', '/app.js', '/data/china.geojson')

    if ($allowedPaths -contains $requestPath) {
      $filePath = Join-Path $root $requestPath.TrimStart('/').Replace('/', '\')
      $body = [System.IO.File]::ReadAllBytes($filePath)
      $contentType = if ($requestPath.EndsWith('.css')) { 'text/css; charset=utf-8' } elseif ($requestPath.EndsWith('.js')) { 'application/javascript; charset=utf-8' } elseif ($requestPath.EndsWith('.geojson')) { 'application/geo+json; charset=utf-8' } else { 'text/html; charset=utf-8' }
      $status = '200 OK'
    } else {
      $body = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
      $contentType = 'text/plain; charset=utf-8'
      $status = '404 Not Found'
    }

    $header = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    $stream.Write($body, 0, $body.Length)
    $stream.Close()
  } finally {
    $client.Close()
  }
}
