# Zero-dependency static HTTP server for ROAD (Rent On A Dress) on http://localhost:8080
$port = 8080
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
$listener.Start()
Write-Output "ROAD Server listening at http://localhost:$port (Root: $root)"

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
}

try {
  while ($true) {
    $client = $null
    try {
      $client = $listener.AcceptTcpClient()
      $stream = $client.GetStream()
      $reader = New-Object System.IO.StreamReader($stream)
      $requestLine = $reader.ReadLine()
      # Drain remaining HTTP request headers so TCP socket closes cleanly
      while ($null -ne ($headerLine = $reader.ReadLine()) -and $headerLine -ne "") {}

      if ($requestLine) {
        $parts = $requestLine.Split(" ")
        if ($parts.Length -ge 2) {
          $rawUrl = $parts[1].Split("?")[0]
          $relPath = [System.Uri]::UnescapeDataString($rawUrl).TrimStart("/")
          if ([string]::IsNullOrWhiteSpace($relPath)) { $relPath = "index.html" }
          $filePath = Join-Path $root ($relPath -replace "/", "\")

          if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
            $stream.Flush()
          } else {
            $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($body, 0, $body.Length)
            $stream.Flush()
          }
        }
      }
    } catch {
      # Ignore individual client disconnect/abort errors and continue serving
    } finally {
      if ($null -ne $client) {
        try { $client.Close() } catch {}
      }
    }
  }
} finally {
  $listener.Stop()
}
