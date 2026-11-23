Add-Type -AssemblyName System.Drawing
$sourceDir = Join-Path (Get-Location) 'stickers\source'
$candidateDir = Join-Path (Get-Location) 'stickers\candidate'
$previewDir = Join-Path (Get-Location) 'sticker-previews'
New-Item -ItemType Directory -Force -Path $candidateDir,$previewDir | Out-Null
$sheet = [System.Drawing.Bitmap]::new((Join-Path $sourceDir 'sticker-sheet.jpeg'))
$edgesX = @(0,216,432,648,864,1080); $edgesY = @(0,218,436,654,872,1076)
$white = [System.Drawing.Color]::White

function Save-WhiteBackgroundCrop($source,$number,$left,$top,$width,$height) {
  $bmp=[System.Drawing.Bitmap]::new($width,$height,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g=[System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($source,[System.Drawing.Rectangle]::new(0,0,$width,$height),[System.Drawing.Rectangle]::new($left,$top,$width,$height),[System.Drawing.GraphicsUnit]::Pixel);$g.Dispose()
  $seen=[System.Collections.BitArray]::new($width*$height);$q=[System.Collections.Generic.Queue[int]]::new()
  $q.Enqueue(0);$q.Enqueue($width-1);$q.Enqueue(($height-1)*$width);$q.Enqueue($height*$width-1)
  while($q.Count){$idx=$q.Dequeue();if($seen[$idx]){continue};$seen[$idx]=$true;$x=$idx%$width;$y=[math]::Floor($idx/$width);$c=$bmp.GetPixel($x,$y)
    $min=[math]::Min($c.R,[math]::Min($c.G,$c.B));$max=[math]::Max($c.R,[math]::Max($c.G,$c.B))
    if($min -lt 215 -or ($max-$min) -gt 36){continue}
    $alpha=[math]::Max(0,[math]::Min(255,255-$min))
    if($alpha -lt 18){$alpha=0}
    if($alpha -gt 0){$a=$alpha/255.0;$r=[math]::Max(0,[math]::Min(255,[math]::Round(($c.R-(1-$a)*255)/$a)));$gg=[math]::Max(0,[math]::Min(255,[math]::Round(($c.G-(1-$a)*255)/$a)));$b=[math]::Max(0,[math]::Min(255,[math]::Round(($c.B-(1-$a)*255)/$a)));$bmp.SetPixel($x,$y,[System.Drawing.Color]::FromArgb($alpha,$r,$gg,$b))}else{$bmp.SetPixel($x,$y,[System.Drawing.Color]::FromArgb(0,255,255,255))}
    if($x -gt 0){$q.Enqueue($idx-1)};if($x -lt $width-1){$q.Enqueue($idx+1)};if($y -gt 0){$q.Enqueue($idx-$width)};if($y -lt $height-1){$q.Enqueue($idx+$width)}
  }
  # Decontaminate pale JPEG matte pixels on the cut edge and retain antialiasing.
  for($y=1;$y -lt $height-1;$y++){for($x=1;$x -lt $width-1;$x++){$c=$bmp.GetPixel($x,$y);if($c.A -ne 255){continue};$mn=[math]::Min($c.R,[math]::Min($c.G,$c.B));$mx=[math]::Max($c.R,[math]::Max($c.G,$c.B));if($mn -lt 150 -or $mn -gt 250 -or ($mx-$mn) -gt 24){continue};$edge=$false;foreach($d in @(@(-1,0),@(1,0),@(0,-1),@(0,1),@(-1,-1),@(1,-1),@(-1,1),@(1,1))){if($bmp.GetPixel($x+$d[0],$y+$d[1]).A -eq 0){$edge=$true;break}};if($edge){$a=[math]::Max(0,255-$mn);if($a -lt 12){$bmp.SetPixel($x,$y,[System.Drawing.Color]::FromArgb(0,0,0,0))}else{$f=$a/255.0;$r=[math]::Max(0,[math]::Min(255,[math]::Round(($c.R-(1-$f)*255)/$f)));$gg=[math]::Max(0,[math]::Min(255,[math]::Round(($c.G-(1-$f)*255)/$f)));$b=[math]::Max(0,[math]::Min(255,[math]::Round(($c.B-(1-$f)*255)/$f)));$bmp.SetPixel($x,$y,[System.Drawing.Color]::FromArgb($a,$r,$gg,$b))}}}}
  $bmp.Save((Join-Path $candidateDir ("sticker-{0:D2}.png" -f $number)),[System.Drawing.Imaging.ImageFormat]::Png);$bmp.Dispose()
}

for($row=0;$row -lt 5;$row++){$cols=if($row -eq 4){3}else{5};for($col=0;$col -lt $cols;$col++){$x=$edgesX[$col]+4;$y=$edgesY[$row]+4;$w=$edgesX[$col+1]-$edgesX[$col]-8;$h=$edgesY[$row+1]-$edgesY[$row]-8;$number=$row*5+$col+1;if($number -eq 14){continue};Save-WhiteBackgroundCrop $sheet $number $x $y $w $h}}
$sheet.Dispose()

# Manually protect the white bodies on stickers 6 and 7: their open sides connect to the white sheet background.
$sheet=[System.Drawing.Bitmap]::new((Join-Path $sourceDir 'sticker-sheet.jpeg'))
foreach($spec in @(@{n=6;x=4;y=222;pts=@(@(53,168),@(53,117),@(54,89),@(58,68),@(68,53),@(82,43),@(100,37),@(119,38),@(135,44),@(146,56),@(150,69),@(148,79),@(146,98),@(149,168))},@{n=7;x=220;y=222;pts=@(@(53,167),@(53,113),@(56,86),@(62,68),@(75,56),@(91,49),@(110,48),@(129,50),@(143,58),@(149,72),@(150,84),@(147,93),@(149,164))})){
  $raw=[System.Drawing.Bitmap]::new(208,210,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb);$rg=[System.Drawing.Graphics]::FromImage($raw);$rg.DrawImage($sheet,[System.Drawing.Rectangle]::new(0,0,208,210),[System.Drawing.Rectangle]::new($spec.x,$spec.y,208,210),[System.Drawing.GraphicsUnit]::Pixel);$rg.Dispose()
  $mask=[System.Drawing.Bitmap]::new(208,210,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb);$mg=[System.Drawing.Graphics]::FromImage($mask);$mg.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias;$p=[System.Drawing.Drawing2D.GraphicsPath]::new();$points=[System.Drawing.Point[]]@($spec.pts|ForEach-Object{[System.Drawing.Point]::new($_[0],$_[1])});$p.AddPolygon($points);$mg.FillPath([System.Drawing.Brushes]::White,$p);$mg.Dispose();$p.Dispose()
  $tmp=[System.Drawing.Bitmap]::new((Join-Path $candidateDir ("sticker-{0:D2}.png" -f $spec.n)));$out=[System.Drawing.Bitmap]::new($tmp);$tmp.Dispose();for($yy=0;$yy -lt 210;$yy++){for($xx=0;$xx -lt 208;$xx++){if($mask.GetPixel($xx,$yy).A -gt 0){$c=$raw.GetPixel($xx,$yy);$out.SetPixel($xx,$yy,[System.Drawing.Color]::FromArgb($mask.GetPixel($xx,$yy).A,$c.R,$c.G,$c.B))}}};for($yy=0;$yy -lt 20;$yy++){for($xx=0;$xx -lt 60;$xx++){$out.SetPixel($xx,$yy,[System.Drawing.Color]::FromArgb(0,0,0,0))}};$out.Save((Join-Path $candidateDir ("sticker-{0:D2}.png" -f $spec.n)),[System.Drawing.Imaging.ImageFormat]::Png);$out.Dispose();$raw.Dispose();$mask.Dispose()
}

# The last row has a gray photographic gradient. Remove only its edge-connected neutral gray field.
foreach($n in @(21,22,23)){$index=$n-1;$row=[math]::Floor($index/5);$col=$index%5;$raw=[System.Drawing.Bitmap]::new(208,196,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb);$rg=[System.Drawing.Graphics]::FromImage($raw);$rg.DrawImage($sheet,[System.Drawing.Rectangle]::new(0,0,208,196),[System.Drawing.Rectangle]::new($col*216+4,$row*218+4,208,196),[System.Drawing.GraphicsUnit]::Pixel);$rg.Dispose();$tmp=[System.Drawing.Bitmap]::new((Join-Path $candidateDir ("sticker-{0:D2}.png" -f $n)));$out=[System.Drawing.Bitmap]::new($tmp);$tmp.Dispose();for($y=70;$y -lt 196;$y++){for($x=0;$x -lt 208;$x++){$c=$raw.GetPixel($x,$y);$mn=[math]::Min($c.R,[math]::Min($c.G,$c.B));$mx=[math]::Max($c.R,[math]::Max($c.G,$c.B));if($mn -ge 175 -and $mn -le 245 -and ($mx-$mn) -le 18){$out.SetPixel($x,$y,[System.Drawing.Color]::FromArgb(0,255,255,255))}}};$out.Save((Join-Path $candidateDir ("sticker-{0:D2}.png" -f $n)),[System.Drawing.Imaging.ImageFormat]::Png);$raw.Dispose();$out.Dispose()};$sheet.Dispose()

# Sticker 14 sits on a black tile. Remove the black edge-connected field while keeping dark ink close to the white/color artwork.
$crop=[System.Drawing.Bitmap]::new(208,210,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb);$g=[System.Drawing.Graphics]::FromImage($crop)
$source=[System.Drawing.Bitmap]::new((Join-Path $sourceDir 'sticker-sheet.jpeg'))
$g.DrawImage($source,[System.Drawing.Rectangle]::new(0,0,208,210),[System.Drawing.Rectangle]::new(652,440,208,210),[System.Drawing.GraphicsUnit]::Pixel);$g.Dispose();$source.Dispose()
$sourcePixels=[System.Drawing.Bitmap]::new(208,210,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb);$sg=[System.Drawing.Graphics]::FromImage($sourcePixels);$sg.DrawImage($crop,0,0);$sg.Dispose()
for($y=0;$y -lt 210;$y++){for($x=0;$x -lt 208;$x++){$c=$sourcePixels.GetPixel($x,$y);$max=[math]::Max($c.R,[math]::Max($c.G,$c.B));$keep=$max -ge 55;if(!$keep){for($dy=-2;$dy -le 2 -and !$keep;$dy++){for($dx=-2;$dx -le 2 -and !$keep;$dx++){$nx=$x+$dx;$ny=$y+$dy;if($nx -ge 0 -and $nx -lt 208 -and $ny -ge 0 -and $ny -lt 210){$near=$sourcePixels.GetPixel($nx,$ny);if([math]::Max($near.R,[math]::Max($near.G,$near.B)) -ge 85){$keep=$true}}}}};if(!$keep){$crop.SetPixel($x,$y,[System.Drawing.Color]::FromArgb(0,0,0,0))}}};$sourcePixels.Dispose();$crop.Save((Join-Path $candidateDir 'sticker-14.png'),[System.Drawing.Imaging.ImageFormat]::Png);$crop.Dispose()

$single=[System.Drawing.Bitmap]::new((Join-Path $sourceDir 'sticker-24-source.jpeg'));Save-WhiteBackgroundCrop $single 24 4 4 ($single.Width-8) ($single.Height-8);$single.Dispose()

# Build three 5x5 compositing previews before touching the active sticker assets.
$colors=@(@([System.Drawing.Color]::White),@([System.Drawing.Color]::FromArgb(255,34,39,53)),@([System.Drawing.Color]::FromArgb(255,255,220,238)),@([System.Drawing.Color]::FromArgb(255,206,241,255)),@([System.Drawing.Color]::FromArgb(255,226,245,204)))
for($theme=0;$theme -lt 3;$theme++){$canvas=[System.Drawing.Bitmap]::new(1080,1080);$cg=[System.Drawing.Graphics]::FromImage($canvas);$cg.Clear([System.Drawing.Color]::FromArgb(255,34,39,53));for($n=1;$n -le 24;$n++){$col=($n-1)%5;$row=[math]::Floor(($n-1)/5);$x=$col*216;$y=$row*216;$bg=if($theme -eq 0){[System.Drawing.Color]::White}elseif($theme -eq 1){[System.Drawing.Color]::FromArgb(255,34,39,53)}else{$colors[1+($n%4)][0]};$cg.FillRectangle([System.Drawing.SolidBrush]::new($bg),$x,$y,216,216);$st=[System.Drawing.Image]::FromFile((Join-Path $candidateDir ("sticker-{0:D2}.png" -f $n)));$cg.DrawImage($st,[System.Drawing.Rectangle]::new($x+5,$y+5,206,206));$st.Dispose();$cg.DrawRectangle([System.Drawing.Pens]::Gray,$x,$y,215,215)};$cg.Dispose();$name=@('white-background.png','dark-background.png','colored-background.png')[$theme];$canvas.Save((Join-Path $previewDir $name),[System.Drawing.Imaging.ImageFormat]::Png);$canvas.Dispose()}
Write-Output 'Candidate assets and white/dark/colored previews created. Active sticker files were not changed.'
