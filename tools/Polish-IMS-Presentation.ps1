param(
  [string]$Path = (Join-Path (Get-Location) "IMS_Top10_Presentation.pptx")
)

$ErrorActionPreference = "Stop"

$msoTextOrientationHorizontal = 1
$msoShapeRectangle = 1
$msoShapeRoundedRectangle = 5
$msoShapeOval = 9
$msoTrue = -1
$msoFalse = 0
$msoSendToBack = 1

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
  TealSoft = RgbValue 240 253 250
  Dark = RgbValue 17 24 39
  Navy = RgbValue 15 23 42
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

function Add-ShapeBox($slide, [int]$shapeType, [double]$x, [double]$y, [double]$w, [double]$h, [int]$fill, [int]$line = -1) {
  $shape = $slide.Shapes.AddShape($shapeType, $x, $y, $w, $h)
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

function Convert-ToWhiteTheme($slide, [double]$width, [double]$height) {
  $slide.FollowMasterBackground = $msoFalse
  $slide.Background.Fill.Solid()
  $slide.Background.Fill.ForeColor.RGB = $C.White

  foreach ($shape in @($slide.Shapes)) {
    try {
      $isFullBackground = $shape.Left -le 2 -and $shape.Top -le 2 -and $shape.Width -ge ($width - 4) -and $shape.Height -ge ($height - 4)
      if ($isFullBackground -and $shape.Fill.Visible) {
        $shape.Fill.ForeColor.RGB = $C.White
        $shape.Line.Visible = $msoFalse
      }

      if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
        $hasSolidDarkFill = $false
        if ($shape.Fill.Visible) {
          $fillColor = [int]$shape.Fill.ForeColor.RGB
          $hasSolidDarkFill = $fillColor -eq $C.Dark -or $fillColor -eq $C.Navy
        }

        if (-not $hasSolidDarkFill) {
          $textRange = $shape.TextFrame.TextRange
          $fontSize = [double]$textRange.Font.Size
          if ($fontSize -ge 22) {
            $textRange.Font.Color.RGB = $C.Ink
          } elseif ($textRange.Text.Trim().Length -le 4) {
            $textRange.Font.Color.RGB = $C.White
          } else {
            $textRange.Font.Color.RGB = $C.Muted
          }
        }
      }
    } catch {
      # Continue polishing the remaining shapes.
    }
  }

  $aura1 = Add-ShapeBox $slide $msoShapeOval ($width - 170) -90 240 240 $C.BlueSoft -1
  $aura1.ZOrder($msoSendToBack) | Out-Null
  $aura2 = Add-ShapeBox $slide $msoShapeOval -90 ($height - 155) 220 220 $C.TealSoft -1
  $aura2.ZOrder($msoSendToBack) | Out-Null
}

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = $msoTrue
$presentation = $ppt.Presentations.Open((Resolve-Path $Path).Path, 0, 0, 0)

try {
  $width = [double]$presentation.PageSetup.SlideWidth
  $height = [double]$presentation.PageSetup.SlideHeight

  if ($presentation.Slides.Count -ge 4) {
    Convert-ToWhiteTheme $presentation.Slides.Item(4) $width $height
  }

  $lastSlide = $presentation.Slides.Item($presentation.Slides.Count)
  Convert-ToWhiteTheme $lastSlide $width $height

  if ($presentation.Slides.Count -lt 18) {
    $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
  } else {
    $slide = $presentation.Slides.Item(18)
    foreach ($shape in @($slide.Shapes)) {
      $shape.Delete()
    }
  }

  $slide.FollowMasterBackground = $msoFalse
  $slide.Background.Fill.Solid()
  $slide.Background.Fill.ForeColor.RGB = $C.White
  Add-ShapeBox $slide $msoShapeOval ($width - 170) -90 240 240 $C.BlueSoft -1 | Out-Null
  Add-ShapeBox $slide $msoShapeOval -90 ($height - 155) 220 220 $C.TealSoft -1 | Out-Null
  Add-ShapeBox $slide $msoShapeRoundedRectangle 46 32 34 34 $C.Blue -1 | Out-Null
  Add-TextBox $slide "18" 46 39 34 18 10 $C.White $true 2 | Out-Null
  Add-TextBox $slide "Closing" 90 38 450 24 15 $C.Ink $true | Out-Null
  Add-TextBox $slide "18 / 18" ($width - 140) 40 95 20 10 (RgbValue 148 163 184) $true 3 | Out-Null
  Add-TextBox $slide "THANK YOU" 90 150 ($width - 180) 80 54 $C.Ink $true 2 | Out-Null
  Add-TextBox $slide "FOR LISTENING" 90 230 ($width - 180) 44 28 $C.Blue $true 2 | Out-Null
  Add-TextBox $slide "Internship Management and Performance Tracking System" 150 315 ($width - 300) 36 20 $C.Muted $true 2 | Out-Null
  Add-TextBox $slide "Questions and feedback are welcome." 180 365 ($width - 360) 28 16 $C.Muted $false 2 | Out-Null

  $presentation.Save()
  Write-Host "Updated presentation: $Path"
  Write-Host "Slide count: $($presentation.Slides.Count)"
}
finally {
  if ($presentation) { $presentation.Close() | Out-Null }
  if ($ppt) { $ppt.Quit() | Out-Null }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation) | Out-Null
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
