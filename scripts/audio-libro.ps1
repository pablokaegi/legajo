# El piloto Windows usa la voz en castellano del equipo. Recibe los guiones por stdin.
$ErrorActionPreference = 'Stop'
[Console]::InputEncoding = [Text.UTF8Encoding]::new($false)
$guiones = ConvertFrom-Json -InputObject ([Console]::In.ReadToEnd())
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media.SpeechSynthesis, ContentType=WindowsRuntime]
$null = [Windows.Media.SpeechSynthesis.SpeechSynthesisStream, Windows.Media.SpeechSynthesis, ContentType=WindowsRuntime]
$sintetizador = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
try {
    $voz = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices |
        Where-Object Language -Like 'es-*' | Select-Object -First 1
    if (-not $voz) { throw 'Falta una voz local en castellano.' }
    $sintetizador.Voice = $voz
    $asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() |
        Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } |
        Select-Object -First 1
    foreach ($guion in $guiones) {
        $operacion = $sintetizador.SynthesizeTextToStreamAsync([string]$guion)
        $tarea = $asTask.MakeGenericMethod([Windows.Media.SpeechSynthesis.SpeechSynthesisStream]).Invoke($null, @($operacion))
        $tarea.Wait()
        $audio = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($tarea.Result)
        $memoria = [IO.MemoryStream]::new()
        try {
            $audio.CopyTo($memoria)
            [Console]::Out.WriteLine([Convert]::ToBase64String($memoria.ToArray()))
        } finally {
            $memoria.Dispose()
            $audio.Dispose()
        }
    }
} finally { $sintetizador.Dispose() }
