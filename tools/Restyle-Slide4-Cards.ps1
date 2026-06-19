param(
  [string]$Path = (Join-Path (Get-Location) "IMS_Top10_Presentation.pptx")
)

$ErrorActionPreference = "Stop"

$msoTrue = -1
$msoFalse = 0
$msoShapeRoundedRectangle = 5
$msoTextOrientationHorizontal = 1

function RgbValue([int]$r, [int]$g, [int]$b) {
  return $r + ($g -shl 8) + ($b -shl 16)
}

$C = @{
  White = RgbValue 255 255 255
  Ink = RgbValue 15 23 42
  Muted = RgbValue 100 116 139
  Light = RgbValue 248 250 252
  Line = RgbValue 226 232 240
  Blue = RgbValue 37 99 235
  BlueSoft = RgbValue 239 246 255
}

function Add-TextBox($slide, [string]$text, [double]$x, [double]$y, [double]$w, [double]$h, [double]$size, [int]$color, [bool]$bold = $false, [int]$align = 1) {
  $shape = $slide.Shapes.AddTextbox($msoTextOrientationHorizontal, $x, $y, $w, $h)
  $shape.TextFrame.MarginLeft = 0
  $shape.TextFrame.MarginRight = 0
  $shape.TextFrame.MarginTop = 0
  $shape.TextFrame.MarginBottom = 0
  $range = $shape.TextFrame.TextRange
  $range.Text = $text
  $range.Font.Name = "Aptos"
  $range.Font.Size = $size
  $range.Font.Color.RGB = $color
  $range.Font.Bold = $(if ($bold) { $msoTrue } else { $msoFalse })
  $range.ParagraphFormat.Alignment = $align
  return $shape
}

function Add-ShapeBox($slide, [double]$x, [double]$y, [double]$w, [double]$h, [int]$fill, [int]$line = -1) {
  $shape = $slide.Shapes.AddShape($msoShapeRoundedRectangle, $x, $y, $w, $h)
  $shape.Fill.Visible = $msoTrue
  $shape.Fill.ForeColor.RGB = $fill
  if ($line -ge 0) {
    $shape.Line.Visible = $msoTrue
    $shape.Line.ForeColor.RGB = $line
  } else {
    $shape.Line.Visible = $msoFalse
  }
  return $shape
}

$steps = @(
  @{ Title = "Register"; Body = "Students, companies and faculties enter the system" },
  @{ Title = "Approve"; Body = "UIL verifies companies and posts" },
  @{ Title = "Apply"; Body = "Students submit CV and academic PDF" },
  @{ Title = "Assign"; Body = "Faculty and companies assign mentors" },
  @{ Title = "Monitor"; Body = "Progress, reports and feedback stay visible" },
  @{ Title = "Evaluate"; Body = "Final mark is calculated transparently" }
)

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = $msoTrue
$presentation = $ppt.Presentations.Open((Resolve-Path $Path).Path, 0, 0, 0)

try {
  $slide = $presentation.Slides.Item(4)
  $slide.FollowMasterBackground = $msoFalse
  $slide.Background.Fill.Solid()
  $slide.Background.Fill.ForeColor.RGB = $C.White

  $deleteIds = @()
  foreach ($shape in $slide.Shapes) {
    $inCardZone = $shape.Top -ge 250 -and $shape.Top -le 420 -and $shape.Left -ge 45 -and $shape.Left -le 925
    if ($inCardZone) {
      $deleteIds += $shape.Id
    }
  }

  foreach ($id in $deleteIds) {
    try {
      $slide.Shapes.Item($id).Delete()
    } catch {
      # Shape may already be gone if it was grouped or deleted.
    }
  }

  $cardW = 135
  $cardH = 145
  $startX = 54
  $gap = 10
  $y = 265

  for ($i = 0; $i -lt $steps.Count; $i++) {
    $x = $startX + (($cardW + $gap) * $i)
    Add-ShapeBox $slide $x $y $cardW $cardH $C.Light $C.Line | Out-Null
    Add-ShapeBox $slide ($x + 14) ($y + 15) 30 30 $C.BlueSoft -1 | Out-Null
    Add-TextBox $slide ([string]($i + 1)) ($x + 14) ($y + 22) 30 13 10 $C.Blue $true 2 | Out-Null
    Add-TextBox $slide $steps[$i].Title ($x + 14) ($y + 55) ($cardW - 28) 24 16 $C.Blue $true | Out-Null
    Add-TextBox $slide $steps[$i].Body ($x + 14) ($y + 88) ($cardW - 28) 44 9.5 $C.Muted $false | Out-Null
  }

  $presentation.Save()
  Write-Host "Slide 4 cards restyled."
}
finally {
  if ($presentation) { $presentation.Close() | Out-Null }
  if ($ppt) { $ppt.Quit() | Out-Null }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation) | Out-Null
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
