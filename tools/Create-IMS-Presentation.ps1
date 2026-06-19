param(
  [string]$OutputPath = (Join-Path (Get-Location) "IMS_Top10_Presentation.pptx")
)

$ErrorActionPreference = "Stop"

$ppLayoutBlank = 12
$ppSaveAsOpenXMLPresentation = 24
$msoTextOrientationHorizontal = 1
$msoShapeRectangle = 1
$msoShapeRoundedRectangle = 5
$msoShapeOval = 9
$msoTrue = -1
$msoFalse = 0

function RgbValue([int]$r, [int]$g, [int]$b) {
  return $r + ($g -shl 8) + ($b -shl 16)
}

$C = @{
  Navy = RgbValue 15 23 42
  Dark = RgbValue 17 24 39
  Ink = RgbValue 15 23 42
  Muted = RgbValue 100 116 139
  Light = RgbValue 248 250 252
  Line = RgbValue 226 232 240
  White = RgbValue 255 255 255
  Blue = RgbValue 37 99 235
  Teal = RgbValue 15 118 110
  Green = RgbValue 22 101 52
  GreenBg = RgbValue 220 252 231
  Amber = RgbValue 146 64 14
  AmberBg = RgbValue 254 243 199
  Rose = RgbValue 190 18 60
  RoseBg = RgbValue 255 228 230
  Violet = RgbValue 109 40 217
  BlueBg = RgbValue 219 234 254
}

function Add-ShapeBox($slide, [int]$shapeType, [double]$x, [double]$y, [double]$w, [double]$h, [int]$fill, [int]$line = -1, [double]$lineWeight = 1) {
  $shape = $slide.Shapes.AddShape($shapeType, $x, $y, $w, $h)
  $shape.Fill.Visible = $msoTrue
  $shape.Fill.ForeColor.RGB = $fill
  if ($line -ge 0) {
    $shape.Line.Visible = $msoTrue
    $shape.Line.ForeColor.RGB = $line
    $shape.Line.Weight = $lineWeight
  } else {
    $shape.Line.Visible = $msoFalse
  }
  return $shape
}

function Add-TextBox($slide, [string]$text, [double]$x, [double]$y, [double]$w, [double]$h, [double]$size = 18, [int]$color = $C.Ink, [bool]$bold = $false, [string]$font = "Aptos", [int]$align = 1) {
  $shape = $slide.Shapes.AddTextbox($msoTextOrientationHorizontal, $x, $y, $w, $h)
  $shape.TextFrame.MarginLeft = 0
  $shape.TextFrame.MarginRight = 0
  $shape.TextFrame.MarginTop = 0
  $shape.TextFrame.MarginBottom = 0
  $range = $shape.TextFrame.TextRange
  $range.Text = $text
  $range.Font.Name = $font
  $range.Font.Size = $size
  $range.Font.Color.RGB = $color
  if ($bold) { $range.Font.Bold = $msoTrue } else { $range.Font.Bold = $msoFalse }
  $range.ParagraphFormat.Alignment = $align
  return $shape
}

function Add-Header($slide, [string]$num, [string]$section, [string]$count, [bool]$dark = $false) {
  $textColor = if ($dark) { $C.White } else { $C.Ink }
  $muted = if ($dark) { RgbValue 203 213 225 } else { RgbValue 148 163 184 }
  Add-ShapeBox $slide $msoShapeRoundedRectangle 46 32 34 34 $C.Blue -1 | Out-Null
  Add-TextBox $slide $num 46 39 34 18 10 $C.White $true "Aptos" 2 | Out-Null
  Add-TextBox $slide $section 90 38 450 24 15 $textColor $true | Out-Null
  Add-TextBox $slide $count 820 40 95 20 10 $muted $true "Aptos" 3 | Out-Null
}

function Add-Eyebrow($slide, [string]$text, [double]$x, [double]$y, [bool]$dark = $false) {
  $color = if ($dark) { RgbValue 191 219 254 } else { $C.Blue }
  Add-TextBox $slide $text.ToUpper() $x $y 760 18 10 $color $true | Out-Null
}

function Add-Title($slide, [string]$title, [double]$x, [double]$y, [double]$w, [double]$size = 34, [bool]$dark = $false) {
  $color = if ($dark) { $C.White } else { $C.Ink }
  Add-TextBox $slide $title $x $y $w 100 $size $color $true "Aptos Display" | Out-Null
}

function Add-Subtitle($slide, [string]$text, [double]$x, [double]$y, [double]$w, [bool]$dark = $false) {
  $color = if ($dark) { RgbValue 219 234 254 } else { RgbValue 71 85 105 }
  Add-TextBox $slide $text $x $y $w 80 16 $color $false | Out-Null
}

function Add-Bullets($slide, [string[]]$items, [double]$x, [double]$y, [double]$w, [double]$h, [bool]$dark = $false) {
  $color = if ($dark) { RgbValue 226 232 240 } else { RgbValue 51 65 85 }
  $text = ($items | ForEach-Object { "• $_" }) -join "`r"
  $shape = Add-TextBox $slide $text $x $y $w $h 15 $color $false
  $shape.TextFrame.TextRange.ParagraphFormat.SpaceAfter = 8
  return $shape
}

function Add-Card($slide, [double]$x, [double]$y, [double]$w, [double]$h, [string]$title, [string[]]$bullets, [bool]$dark = $false) {
  $fill = if ($dark) { RgbValue 15 23 42 } else { $C.White }
  $line = if ($dark) { RgbValue 51 65 85 } else { $C.Line }
  $titleColor = if ($dark) { $C.White } else { $C.Ink }
  Add-ShapeBox $slide $msoShapeRoundedRectangle $x $y $w $h $fill $line | Out-Null
  Add-TextBox $slide $title ($x + 18) ($y + 18) ($w - 36) 26 18 $titleColor $true | Out-Null
  Add-Bullets $slide $bullets ($x + 18) ($y + 58) ($w - 36) ($h - 70) $dark | Out-Null
}

function Add-Metric($slide, [double]$x, [double]$y, [double]$w, [string]$value, [string]$label) {
  Add-ShapeBox $slide $msoShapeRoundedRectangle $x $y $w 92 $C.Light $C.Line | Out-Null
  Add-TextBox $slide $value ($x + 16) ($y + 16) ($w - 32) 34 25 $C.Blue $true "Aptos Display" | Out-Null
  Add-TextBox $slide $label ($x + 16) ($y + 55) ($w - 32) 28 10 $C.Muted $true | Out-Null
}

function Add-Pill($slide, [string]$text, [double]$x, [double]$y, [int]$fill, [int]$color) {
  Add-ShapeBox $slide $msoShapeRoundedRectangle $x $y 84 22 $fill -1 | Out-Null
  Add-TextBox $slide $text ($x + 8) ($y + 5) 68 12 8 $color $true "Aptos" 2 | Out-Null
}

function Add-DashboardMock($slide, [double]$x, [double]$y, [double]$w, [double]$h, [string]$role, [string]$active, [string[]]$nav, [string[]]$metrics, [object[]]$rows) {
  Add-ShapeBox $slide $msoShapeRoundedRectangle $x $y $w $h $C.White $C.Line | Out-Null
  Add-ShapeBox $slide $msoShapeRectangle $x $y $w 28 (RgbValue 241 245 249) $C.Line | Out-Null
  Add-ShapeBox $slide $msoShapeOval ($x + 12) ($y + 10) 7 7 (RgbValue 251 113 133) -1 | Out-Null
  Add-ShapeBox $slide $msoShapeOval ($x + 24) ($y + 10) 7 7 (RgbValue 251 191 36) -1 | Out-Null
  Add-ShapeBox $slide $msoShapeOval ($x + 36) ($y + 10) 7 7 (RgbValue 52 211 153) -1 | Out-Null

  $sideW = 145
  Add-ShapeBox $slide $msoShapeRectangle $x ($y + 28) $sideW ($h - 28) $C.Navy -1 | Out-Null
  Add-TextBox $slide $role ($x + 14) ($y + 48) ($sideW - 28) 22 13 $C.White $true | Out-Null
  $ny = $y + 82
  foreach ($n in $nav) {
    $fill = if ($n -eq $active) { $C.Blue } else { $C.Navy }
    Add-ShapeBox $slide $msoShapeRoundedRectangle ($x + 12) $ny ($sideW - 24) 24 $fill -1 | Out-Null
    Add-TextBox $slide $n ($x + 22) ($ny + 6) ($sideW - 44) 11 8 (RgbValue 219 234 254) $true | Out-Null
    $ny += 30
  }

  $mainX = $x + $sideW
  Add-ShapeBox $slide $msoShapeRectangle $mainX ($y + 28) ($w - $sideW) ($h - 28) $C.Light -1 | Out-Null
  Add-TextBox $slide "$role Dashboard" ($mainX + 18) ($y + 50) 230 26 16 $C.Ink $true | Out-Null
  Add-Pill $slide "LIVE" ($x + $w - 112) ($y + 52) $C.GreenBg $C.Green

  $mx = $mainX + 18
  $my = $y + 92
  $metricW = (($w - $sideW - 54) / 4)
  for ($i = 0; $i -lt 4; $i++) {
    Add-ShapeBox $slide $msoShapeRoundedRectangle ($mx + ($metricW + 8) * $i) $my $metricW 62 $C.White $C.Line | Out-Null
    $parts = $metrics[$i].Split("|")
    Add-TextBox $slide $parts[0] ($mx + ($metricW + 8) * $i + 10) ($my + 12) ($metricW - 20) 20 16 $C.Ink $true | Out-Null
    Add-TextBox $slide $parts[1] ($mx + ($metricW + 8) * $i + 10) ($my + 37) ($metricW - 20) 12 8 $C.Muted $true | Out-Null
  }

  $tableY = $my + 80
  Add-ShapeBox $slide $msoShapeRoundedRectangle $mx $tableY ($w - $sideW - 36) 152 $C.White $C.Line | Out-Null
  $rowY = $tableY + 8
  Add-TextBox $slide "ITEM" ($mx + 14) $rowY 150 12 8 (RgbValue 148 163 184) $true | Out-Null
  Add-TextBox $slide "OWNER" ($mx + 180) $rowY 110 12 8 (RgbValue 148 163 184) $true | Out-Null
  Add-TextBox $slide "STATUS" ($mx + 300) $rowY 80 12 8 (RgbValue 148 163 184) $true | Out-Null
  $rowY += 28
  foreach ($row in $rows) {
    Add-TextBox $slide $row[0] ($mx + 14) $rowY 150 14 9 $C.Ink $true | Out-Null
    Add-TextBox $slide $row[1] ($mx + 180) $rowY 100 14 9 $C.Muted $true | Out-Null
    $statusFill = $C.BlueBg
    $statusColor = $C.Blue
    if ($row[2] -match "Pending") { $statusFill = $C.AmberBg; $statusColor = $C.Amber }
    if ($row[2] -match "Approved|Complete|Active|Accepted") { $statusFill = $C.GreenBg; $statusColor = $C.Green }
    if ($row[2] -match "Rejected") { $statusFill = $C.RoseBg; $statusColor = $C.Rose }
    Add-Pill $slide $row[2] ($mx + 300) ($rowY - 4) $statusFill $statusColor
    $rowY += 32
  }
}

function New-Slide($presentation, [bool]$dark = $false) {
  $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, $ppLayoutBlank)
  $bg = if ($dark) { $C.Dark } else { $C.White }
  Add-ShapeBox $slide $msoShapeRectangle 0 0 960 540 $bg -1 | Out-Null
  if (-not $dark) {
    Add-ShapeBox $slide $msoShapeOval 790 -120 240 240 (RgbValue 239 246 255) -1 | Out-Null
    Add-ShapeBox $slide $msoShapeOval -90 380 220 220 (RgbValue 240 253 250) -1 | Out-Null
  }
  return $slide
}

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = $msoTrue
$presentation = $ppt.Presentations.Add($msoTrue)
$presentation.PageSetup.SlideWidth = 960
$presentation.PageSetup.SlideHeight = 540

try {
  $s = New-Slide $presentation $true
  Add-Header $s "IMS" "Internship Management System" "1 / 18" $true
  Add-Eyebrow $s "Top 10 Faculty Project Selection" 54 120 $true
  Add-Title $s "Internship Management and Performance Tracking System" 54 145 610 44 $true
  Add-Subtitle $s "A full-stack web and mobile platform that connects students, faculty, UIL, companies, mentors, and evaluators into one transparent internship workflow." 54 300 600 $true
  Add-DashboardMock $s 640 105 280 330 "IMS" "Dashboard" @("Dashboard","Students","Applications","Reports","Evaluations","Approvals") @("7|Faculties","210+|Students","6|Roles","100%|Scoring") @(@("Company registration","UIL","Pending"),@("Student application","Student","Review"),@("Mentor evaluation","Company","Complete"))

  $s = New-Slide $presentation
  Add-Header $s "01" "Project Context" "2 / 18"
  Add-Eyebrow $s "Why this project matters" 54 92
  Add-Title $s "Internship coordination is not only a student problem. It is an institutional workflow problem." 54 118 790 34
  Add-Card $s 64 255 250 190 "Students" @("Find relevant internships","Apply with required documents","Track status, progress and feedback")
  Add-Card $s 354 255 250 190 "Faculty and Mentors" @("Assign mentors and evaluators","Monitor reports and attendance","Approve completed progress")
  Add-Card $s 644 255 250 190 "UIL and Companies" @("Verify organizations","Approve internship posts","Manage applicants and evaluations")

  $s = New-Slide $presentation
  Add-Header $s "02" "The Problem" "3 / 18"
  Add-Eyebrow $s "Current pain points" 54 92
  Add-Title $s "Manual internship management creates delay, duplication, weak tracking, and unclear responsibility." 54 118 520 32
  Add-Subtitle $s "Before a unified system, information is scattered across paper forms, spreadsheets, phone calls, email, and informal communication." 54 245 500
  Add-Card $s 620 105 275 330 "Pain Points" @("Duplicate company registration","Students cannot easily track status","Faculty progress monitoring is difficult","Reports and evaluations are separated","Final scoring is hard to audit")

  $s = New-Slide $presentation $true
  Add-Header $s "03" "Our Solution" "4 / 18" $true
  Add-Eyebrow $s "System overview" 54 92 $true
  Add-Title $s "One platform, six roles, one internship lifecycle." 54 118 760 38 $true
  $steps = @("Register|Students, companies and faculties enter the system","Approve|UIL verifies companies and posts","Apply|Students submit CV and academic PDF","Assign|Faculty and companies assign mentors","Monitor|Progress, reports and feedback stay visible","Evaluate|Final mark is calculated transparently")
  $x = 54
  foreach ($st in $steps) {
    $parts = $st.Split("|")
    Add-ShapeBox $s $msoShapeRoundedRectangle $x 265 135 145 (RgbValue 15 23 42) (RgbValue 51 65 85) | Out-Null
    Add-TextBox $s $parts[0] ($x + 14) 285 110 24 16 $C.White $true | Out-Null
    Add-TextBox $s $parts[1] ($x + 14) 322 108 60 10 (RgbValue 203 213 225) $false | Out-Null
    $x += 145
  }

  $s = New-Slide $presentation
  Add-Header $s "04" "Stakeholders" "5 / 18"
  Add-Eyebrow $s "Role-based ecosystem" 54 92
  Add-Title $s "Every stakeholder has a dedicated dashboard and responsibility boundary." 54 118 750 36
  Add-Card $s 54 235 270 115 "Admin" @("Users, faculties, security, logs")
  Add-Card $s 345 235 270 115 "UIL" @("Company approval, internship approval")
  Add-Card $s 636 235 270 115 "Faculty" @("Student upload, mentors, grading")
  Add-Card $s 54 370 270 115 "Student" @("Apply, reports, progress, feedback")
  Add-Card $s 345 370 270 115 "Company" @("Post internships, review applicants")
  Add-Card $s 636 370 270 115 "Mentors and Evaluators" @("Attendance, evaluation, presentation")

  $s = New-Slide $presentation
  Add-Header $s "05" "Admin Dashboard" "6 / 18"
  Add-Eyebrow $s "Dashboard snapshot" 54 86
  Add-Title $s "Admin controls the platform foundation: users, security, logs, backups, and faculties." 54 110 790 32
  Add-DashboardMock $s 54 230 520 250 "Admin" "Overview" @("Overview","Faculties","Users","Password Reset","Logs","Backup") @("Users|Managed","Reset|Password","Audit|Logs","DB|Backup") @(@("FAC-11","Faculty","Active"),@("BDU-ST-001","Student","Review"),@("UIL-01","UIL","Active"))
  Add-Card $s 620 230 270 250 "Core Admin Ideas" @("Register and manage faculties","Reset passwords with forced change","Audit sensitive actions","Backup database for recovery")

  $s = New-Slide $presentation
  Add-Header $s "06" "UIL Dashboard" "7 / 18"
  Add-Eyebrow $s "Quality gate" 54 86
  Add-Title $s "UIL protects the system by approving companies and internship posts before students apply." 54 110 810 32
  Add-Card $s 54 230 275 250 "UIL Controls" @("Company email duplication blocked","UIL notified on registration","Approve/reject actions separated","Company receives decision status","Duration rules enforced")
  Add-DashboardMock $s 365 230 520 250 "UIL" "Company Approval" @("Company Approval","Internship Approval","Recommendation","Notifications") @("12|Pending","8|Approved","3|Rejected","Live|Alerts") @(@("BlueTech PLC","License","Pending"),@("Ethio Software","Profile","Approved"),@("Smart Build","Missing","Rejected"))

  $s = New-Slide $presentation
  Add-Header $s "07" "Student Experience" "8 / 18"
  Add-Eyebrow $s "Student dashboard and mobile app" 54 86
  Add-Title $s "Students can apply, track progress, submit reports, view feedback, and rate companies after completion." 54 110 790 31
  Add-DashboardMock $s 54 230 520 250 "Student" "Dashboard" @("Dashboard","Opportunities","Applications","Status","Reports","Feedback") @("62%|Progress","CV|Submitted","PDF|Report","4.7|Rating") @(@("Application","BlueTech","Accepted"),@("Report","Faculty","Review"),@("Feedback","Mentor","Complete"))
  Add-ShapeBox $s $msoShapeRoundedRectangle 650 198 175 300 $C.Dark -1 | Out-Null
  Add-ShapeBox $s $msoShapeRoundedRectangle 662 210 151 276 $C.Light -1 | Out-Null
  Add-ShapeBox $s $msoShapeRoundedRectangle 675 230 125 78 $C.Blue -1 | Out-Null
  Add-TextBox $s "Internship Status" 688 250 100 20 14 $C.White $true | Out-Null
  Add-ShapeBox $s $msoShapeRoundedRectangle 675 324 125 58 $C.White $C.Line | Out-Null
  Add-TextBox $s "BlueTech PLC" 686 338 100 15 11 $C.Ink $true | Out-Null
  Add-ShapeBox $s $msoShapeRoundedRectangle 686 362 94 8 (RgbValue 226 232 240) -1 | Out-Null
  Add-ShapeBox $s $msoShapeRoundedRectangle 686 362 58 8 $C.Blue -1 | Out-Null

  $s = New-Slide $presentation
  Add-Header $s "08" "Company Dashboard" "9 / 18"
  Add-Eyebrow $s "Industry participation" 54 86
  Add-Title $s "Companies manage internship vacancies, applicants, assigned students, and company mentors." 54 110 760 32
  Add-Card $s 54 230 275 250 "Company Functions" @("Register and wait for UIL approval","Post validated internships","Review applicants","Assign company mentors","Submit evaluations and attendance")
  Add-DashboardMock $s 365 230 520 250 "Company" "Overview" @("Overview","Vacancies","Applications","Mentors","Assigned Students") @("5|Vacancies","28|Applications","4|Mentors","12|Students") @(@("Software Engineer","CS, IT","Approved"),@("Network Intern","Cyber","Pending"),@("Site Intern","Civil","Active"))

  $s = New-Slide $presentation
  Add-Header $s "09" "Faculty Dashboard" "10 / 18"
  Add-Eyebrow $s "Academic coordination" 54 86
  Add-Title $s "Faculty manages students, mentors, reports, stipend, evaluator assignment, and final approval." 54 110 790 32
  Add-DashboardMock $s 54 230 520 250 "Faculty" "Overview" @("Overview","Manage Students","Assign Mentors","Monitor Progress","Reports","Evaluators") @("CSV|Upload","30+|Students","2|Evaluators","100%|Mark") @(@("BDU-COMP-001","Attendance","Complete"),@("BDU-COMP-002","Report","Review"),@("BDU-COMP-003","Evaluation","Pending"))
  Add-Card $s 620 230 270 250 "Faculty Ideas" @("Student creation through CSV upload","Soft-delete mentor history","Approve all only when complete","Send signed report to evaluators")

  $s = New-Slide $presentation
  Add-Header $s "10" "Evaluation Model" "11 / 18"
  Add-Eyebrow $s "Transparent scoring" 54 86
  Add-Title $s "Final internship mark is calculated from four clear components." 54 110 760 36
  Add-Metric $s 54 230 190 "10%" "Faculty attendance"
  Add-Metric $s 275 230 190 "40%" "Company evaluation"
  Add-Metric $s 496 230 190 "20%" "Faculty mentor report"
  Add-Metric $s 717 230 190 "30%" "Presentation evaluators"
  Add-Card $s 165 360 630 105 "Why it matters" @("Students know how they are graded","Faculty can audit every mark source","Company evaluation receives proper weight")

  $s = New-Slide $presentation
  Add-Header $s "11" "Smart Rules" "12 / 18"
  Add-Eyebrow $s "Business logic" 54 86
  Add-Title $s "The system enforces rules that reduce invalid data before it reaches approval." 54 110 800 34
  Add-Card $s 70 235 390 220 "Internship Duration" @("Computing-related departments can use minimum two-month internships","Other departments and faculties require four months","Related posts can be shared while student rules remain enforced")
  Add-Card $s 500 235 390 220 "Data Integrity" @("Company email duplication is blocked","Soft delete preserves history","Students rate companies only after completion","Approve-all works only for complete records")

  $s = New-Slide $presentation
  Add-Header $s "12" "System Architecture" "13 / 18"
  Add-Eyebrow $s "Technical design" 54 86
  Add-Title $s "Full-stack architecture with separate web, mobile, API, database, storage, and email layers." 54 110 790 31
  Add-Card $s 54 230 265 235 "React Web Dashboard" @("Role-based dashboards","Vite and Tailwind CSS","Axios API client")
  Add-Card $s 348 230 265 235 "Expo Mobile App" @("Student mobile workflow","Applications and reports","Progress and notifications")
  Add-Card $s 642 230 265 235 "Node API and MySQL" @("Express REST API","JWT and role middleware","Multer, Cloudinary, Nodemailer")

  $s = New-Slide $presentation
  Add-Header $s "13" "Security" "14 / 18"
  Add-Eyebrow $s "Security mechanisms" 54 86
  Add-Title $s "Security controls protect authentication, authorization, input handling, uploads, and abuse prevention." 54 110 790 30
  Add-Card $s 54 220 265 125 "Authentication" @("JWT sessions","bcryptjs password hashing","Forced temporary password change")
  Add-Card $s 348 220 265 125 "Authorization" @("Role middleware","Protected routes","Own-account password change")
  Add-Card $s 642 220 265 125 "Data Protection" @("Parameterized MySQL queries","Helmet headers","CORS configuration")
  Add-Card $s 54 370 265 125 "Uploads" @("Multer file handling","PDF-only flows","Cloudinary storage")
  Add-Card $s 348 370 265 125 "Abuse Protection" @("express-rate-limit","Upload limiter","Expensive action limiter")
  Add-Card $s 642 370 265 125 "Auditability" @("System logs","Soft-delete history","Database backup")

  $s = New-Slide $presentation
  Add-Header $s "14" "Notifications" "15 / 18"
  Add-Eyebrow $s "Communication" 54 86
  Add-Title $s "Notifications and emails reduce manual follow-up between students, UIL, faculty, and companies." 54 110 800 32
  Add-Card $s 70 235 390 220 "Notification Examples" @("UIL notified when company registers","Company receives approval or rejection","Internship post decisions are communicated","Students see feedback and evaluation updates")
  Add-Card $s 500 235 390 220 "Email Resilience" @("Nodemailer integration","Business action succeeds even if SMTP is blocked","Temporary passwords shown when email fails","Failed delivery is logged")

  $s = New-Slide $presentation
  Add-Header $s "15" "Impact" "16 / 18"
  Add-Eyebrow $s "Value delivered" 54 86
  Add-Title $s "The system turns internship management from a scattered manual process into a transparent digital workflow." 54 110 810 32
  Add-Metric $s 54 230 190 "Less" "Paper and repeated manual work"
  Add-Metric $s 275 230 190 "More" "Visibility for stakeholders"
  Add-Metric $s 496 230 190 "Fair" "Weighted evaluation"
  Add-Metric $s 717 230 190 "Safe" "History and audit trail"
  Add-TextBox $s "Our core contribution is connecting internship registration, approval, application, supervision, reporting, presentation, and grading into one accountable system." 120 370 720 70 21 $C.Ink $true | Out-Null

  $s = New-Slide $presentation
  Add-Header $s "16" "Demo Plan" "17 / 18"
  Add-Eyebrow $s "How to present tomorrow" 54 86
  Add-Title $s "A strong demo should follow the real internship lifecycle." 54 110 770 36
  Add-Card $s 70 235 390 220 "Recommended Demo Order" @("Admin: user management and reset","UIL: approve company and post","Company: post internship and review applicants","Student: apply with CV and academic PDF","Faculty: assign mentor and evaluator","Evaluator: open report and grade")
  Add-Card $s 500 235 390 220 "What to Emphasize" @("Every role has its own dashboard","Invalid data is blocked early","Progress is visible in web and mobile","Final marks are transparent","History is preserved")

  $s = New-Slide $presentation $true
  Add-Header $s "17" "Conclusion" "18 / 18" $true
  Add-Eyebrow $s "Closing message" 54 110 $true
  Add-Title $s "From internship placement to final evaluation, the whole process is now traceable." 54 140 800 44 $true
  Add-Subtitle $s "This project gives the faculty a practical, scalable, and auditable system for managing internships across students, companies, mentors, UIL officers, and evaluators." 54 310 760 $true
  Add-Card $s 540 360 350 110 "Final Statement" @("Built around the real responsibilities of the faculty internship process.") $true

  if (Test-Path $OutputPath) {
    Remove-Item -LiteralPath $OutputPath -Force
  }
  $presentation.SaveAs($OutputPath, $ppSaveAsOpenXMLPresentation)
  Write-Host "Created presentation: $OutputPath"
}
finally {
  if ($presentation) { $presentation.Close() | Out-Null }
  if ($ppt) { $ppt.Quit() | Out-Null }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation) | Out-Null
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
