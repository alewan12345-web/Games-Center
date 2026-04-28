$prefixes = @('Nova','Turbo','Hyper','Quantum','Mega','Ultra','Pixel','Neon','Cosmic','Rocket','Storm')
$groups = @(
  @{ mode='tap'; base='Target Clash'; tag='TARGET CLASH'; lead='Pop targets quickly to stack points.'; slug='target-clash' },
  @{ mode='lane'; base='Lane Runner'; tag='LANE RUNNER'; lead='Switch lanes and dodge incoming blockers.'; slug='lane-runner' },
  @{ mode='catch'; base='Core Catch'; tag='CORE CATCH'; lead='Catch good drops and avoid hazards.'; slug='core-catch' },
  @{ mode='type'; base='Typing Sprint'; tag='TYPING SPRINT'; lead='Type words fast before time runs out.'; slug='typing-sprint' },
  @{ mode='math'; base='Math Reactor'; tag='MATH REACTOR'; lead='Solve equations quickly for score boosts.'; slug='math-reactor' },
  @{ mode='sequence'; base='Pattern Signal'; tag='PATTERN SIGNAL'; lead='Repeat the sequence in the correct order.'; slug='pattern-signal' }
)
$diffCycle = @('easy','normal','hard')

$newGames = @()
$count = 0
foreach ($g in $groups) {
  foreach ($p in $prefixes) {
    $count++
    $name = "$p $($g.base)"
    $slug = ("$($p)-$($g.slug)").ToLower().Replace(' ','-')
    $diff = $diffCycle[$count % 3]
    $newGames += [pscustomobject]@{
      slug=$slug; name=$name; mode=$g.mode; diff=$diff; tag=$g.tag; lead=$g.lead
    }
  }
}

foreach ($game in $newGames) {
  $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pixel Party | $($game.name)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bungee&family=VT323&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles/main.css">
</head>
<body>
  <div class="scanlines"></div>
  <header class="topbar">
    <a class="logo" href="../index.html">PIXEL PARTY</a>
    <nav class="nav">
      <a href="../index.html">Home</a>
      <a href="../games.html">Games</a>
    </nav>
  </header>

  <main class="container game-page" id="arcade-root" data-mode="$($game.mode)" data-difficulty="$($game.diff)" data-title="$($game.name)">
    <section class="hero small">
      <p class="tag">$($game.tag)</p>
      <h1>$($game.name)</h1>
      <p class="lead">$($game.lead)</p>
    </section>

    <section class="game-shell">
      <div class="hud">
        <span>Score: <strong id="score">0</strong></span>
        <span>Time: <strong id="time">0</strong>s</span>
        <span>Status: <strong id="status">Ready</strong></span>
      </div>
      <canvas id="arcade-canvas" width="760" height="500" aria-label="$($game.name) game"></canvas>
      <div id="arcade-panel" class="typing-panel" hidden></div>
      <div class="controls">
        <button id="start" class="btn">Start</button>
        <button id="restart" class="btn">Restart</button>
        <a class="btn" href="../games.html">Back To Games</a>
      </div>
    </section>
  </main>

  <script src="../scripts/main.js"></script>
  <script src="../scripts/arcade-pack.js"></script>
</body>
</html>
"@
  Set-Content -LiteralPath (Join-Path 'games' ($game.slug + '.html')) -Value $html -NoNewline
}

$tileLines = New-Object System.Collections.Generic.List[string]
foreach ($game in $newGames) {
  $tileLines.Add('      <a class="game-tile" href="games/' + $game.slug + '.html">')
  $tileLines.Add('        <h2>' + $game.name + '</h2>')
  $tileLines.Add('        <p>' + $game.lead + '</p>')
  $tileLines.Add('      </a>')
}
$tiles = [string]::Join("`r`n", $tileLines)

$gamesPath = 'games.html'
$content = Get-Content -LiteralPath $gamesPath -Raw
$needle = "    </section>`r`n  </main>"
if ($content.Contains($needle)) {
  $content = $content.Replace($needle, "$tiles`r`n    </section>`r`n  </main>")
} else {
  $needle2 = "    </section>`n  </main>"
  $content = $content.Replace($needle2, "$tiles`n    </section>`n  </main>")
}
Set-Content -LiteralPath $gamesPath -Value $content -NoNewline

Write-Output ("Created " + $newGames.Count + " new games")
