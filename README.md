# Thermal FOV Rechner

Interaktiver, statischer FOV-Rechner für Wärmebildkameras. Die Website berechnet HFOV, VFOV, DFOV, Sichtfeldgröße und IFOV anhand von Sensorauflösung, Pixelabstand, Brennweite und Entfernung.

## Funktionen

- Entfernung von 10 bis 500 m per Schieberegler
- Tier im Ausgabefenster mit der Maus verschiebbar; vertikales Ziehen aktualisiert die Entfernung und alle davon abhängigen Werte
- detailreiche White-Hot-Tierdarstellungen mit thermischen Abstufungen statt flacher Piktogramme
- mehrere Brennweiten als überlagerte Sichtfelder
- Sensor-Voreinstellungen und freie Eingabe
- standardmäßig ausgeschaltete, relative NETD-Vorschau mit 15, 18, 20, 25, 30, 35, 40 und 50 mK; kleinere Werte bedeuten höhere thermische Empfindlichkeit und weniger Rauschen
- KI-generierte Wildtier-Piktogramme mit hinterlegten Beispielmaßen
- illustrative Thermal-Baumgrafiken mit fester Anordnung, Entfernungsmaßstab und einstellbarer Anzahl
- Feldbewuchs aus Büschen, Rübenkraut und jungem Raps mit fester Anordnung und maßstäblicher Entfernung
- jeweils bis zu 100 Bäume oder Feldpflanzen von 10–500 m; bereits die ersten acht Objekte decken den gesamten Entfernungsbereich ab; Vegetation vor der gewählten Tierentfernung kann das Tier verdecken
- optional zuschaltbarer Vergleichsausschnitt von 39,6° horizontal × 27,0° vertikal; ausgeschaltet wird das größte Kamerasichtfeld verwendet
- gemeinsame Bodenperspektive mit 1,60 m Beobachterhöhe und waagerechter Kamera
- auswählbare Vorschaubrennweite; Tier, Bewuchs und Rauschvorschau teilen ein natives Sensorpixelraster
- responsive Darstellung für Desktop und Mobilgeräte

Die veröffentlichte Website wird per GitHub Actions direkt aus `docs/` auf GitHub Pages bereitgestellt.

## Berechnungsmodell und Prüfung

Die Sensorauflösung bezeichnet aktive Sensorpixel, nicht die Displayauflösung.
Bei quadratischen Pixeln gilt für jede Achse:

- Aktive Sensorgröße in mm: `Pixelzahl × Pixelabstand in µm / 1000`
- Optischer Bildwinkel: `2 × atan(Sensorgröße / (2 × Brennweite))`
- Sichtfeld in m: `Distanz in m × Sensorgröße in mm / Brennweite in mm`
- Digitalzoom: Sichtfeld und aktive Sensorgröße des Ausschnitts jeweils durch den Zoomfaktor teilen; den Winkel anschließend neu berechnen.
- IFOV in mrad, paraxiale Näherung: `Pixelabstand in µm / Brennweite in mm`

Für die Diagonale wird die Sensordiagonale aus Breite und Höhe berechnet.
„Anzeige m / px“ nutzt ein simuliertes Ausgaberaster in Sensorauflösung. Digitalzoom
vergrößert einen Ausschnitt des zuvor gerasterten Sensorbildes und erhöht die
native Detailauflösung nicht. Die Vorschau nutzt das Raster der ausgewählten
Vorschaubrennweite; weitere Brennweiten werden als Sichtfeldrahmen dargestellt.
Auch Vegetation und Rauschvorschau werden vor dem Digitalzoom gerastert.

Der Ursprung liegt auf der optischen Achse. Bei waagerechter Kamera und ebenem
Boden wird eine Höhe `H` in der Tiefe `D` auf die normierte Bildhöhe
`y = 0,5 + (1,60 - H) / (D × vertikales Sichtfeld / Referenzdistanz)` projiziert.
Damit liegen sämtliche Objektfüße in gleicher Tiefe auf derselben Bodenlinie.
Entfernungen bezeichnen die Tiefe entlang der optischen Achse, keine schrägen
Laserentfernungen. Die Achsenmaße gelten in der Ebene der gewählten Tierentfernung.
Bei starkem Zoom können bodennahe Ziele aus dem waagerechten Bildausschnitt fallen.
Die horizontalen Bodenlinien markieren 10, 20, 50, 100, 200, 500 und 1000 m.

Transparente Ränder werden aus allen Sprites entfernt. Tierbreiten beziehen sich
auf die gesamte Silhouette einschließlich Kopf und Schwanz; die Höhe ergibt sich
proportional aus der Grafik einschließlich Ohren und Geweih. Es handelt sich um
Beispieltiere, keine Durchschnitts- oder Schultermaße. Die Grafiken werden nicht
mehr auf vorgegebene Schulterhöhen gestaucht. Der feste Vergleichsausschnitt
repräsentiert kein physiologisch kalibriertes menschliches Gesichtsfeld.

Referenz bei 640 × 512 Pixeln, 12 µm, 35 mm, 100 m und 1× Zoom:

| Größe | Ergebnis |
| --- | --- |
| Aktive Sensorgröße | 7,68 × 6,144 mm |
| H / V / D Bildwinkel | 12,522° / 10,032° / 15,996° |
| Sichtfeld | 21,943 × 17,554 m |
| IFOV | ca. 0,343 mrad |
| Objektebene pro Sensorpixel | ca. 0,03429 m |
| Projektion der Wildschwein-Silhouette (1,50 × ca. 0,8951 m) | 43,75 × ca. 26,11 Sensorpixel |

Bei 2× Zoom halbiert sich das Sichtfeld; die nativen Tierpixel bleiben gleich.
Tierpixel beschreiben die projizierten Gesamtmaße, auch wenn Teile außerhalb des
Bildes liegen. Tiermaße, Silhouetten und Hintergrund sind illustrative Referenzen,
keine Simulation der tatsächlichen Erkennungsleistung. Verzeichnung, Fokus,
Gerätebeschnitt, Wetter, Beugung und gerätespezifische Bildverarbeitung sind nicht
modelliert. Die NETD-Vorschau legt reproduzierbares Rauschen auf das gewählte
Sensorbild. Ihre Stärke ist illustrativ und nicht temperaturkalibriert; ohne
radiometrische Szenendaten kann sie keine reale Erkennungsleistung vorhersagen.
Die Wald- und Feldbilder dienen als atmosphärischer Hintergrund ohne kalibrierte
Objektgrößen. Die darüberliegenden Tiere, Bäume und Feldpflanzen haben bekannte
Beispielabmessungen und perspektivisch konsistente Positionen. Verdeckung nutzt
die Transparenzmasken und die Tiefenreihenfolge der ebenen Objektgrafiken.

Abgleich mit Primärquellen:

- [Arducam FOV Calculator](https://www.arducam.com/blog/fov-calculator/): Eingangsgrößen und verzeichnungsfreies Näherungsmodell.
- [HIKMICRO STELLAR, Herstellerbroschüre 2022, Seite 27](https://webassets.hikmicrotech.com/global/asset/2bb7e96195034f32b8d29b9df25be0d1.pdf): SQ35 mit 640 × 512 / 12 µm / 35 mm und 12,52° × 10,03°; außerdem SH35 mit 384 × 288 / 12 µm.
- [LYNRED PICO640Gen2](https://www.lynred-usa.com/products/vga-resolution/pico640gen2-infrared-sensors.html): 640 × 480 / 17 µm.
- [GSTiR GST412W](https://www.gst-ir.net/products/uncooled-infrared-detectors/400X300/gst412w.html): 400 × 300 / 12 µm.
- [Seek Thermal C314HPX](https://www.thermal.com/uploads/1/0/1/3/101388544/high-temp-c314hpx-web.pdf): 320 × 240 / 12 µm.
- [Teledyne FLIR: How is NEDT measured?](https://www.flir.com/en-gb/support/instruments2/how-is-nedt-measured/): NETD als Temperaturdifferenz, deren Signal dem zeitlichen Kamerarauschen entspricht.
- [LYNRED: About our technologies](https://www.lynred.com/about-our-technologies): Definition, Einheit mK und Einfluss von Optik und Messbedingungen.

## Tests

Geprüft am 13.11.2026:

- `node --check docs/app.js`
- `node --test tests/geometry.test.cjs`: Herstellerreferenz, 720 Kombinationen aus Sensor, Entfernung, Zoom und Brennweite, gemeinsame Bodenebene, inverse Zugprojektion und feste Weltpositionen.
- `node tests/browser-realism.cjs`: Browserprüfungen einschließlich aller Tier- und Hintergrundvarianten, Sensorvoreinstellungen, extremer Seitenverhältnisse, Silhouettenzuschnitt, identischem nativem Sensorbild bei Digitalzoom, Vorschaubrennweite, Verdeckung, NETD-Auswahl, ungültiger Eingaben und echtem Mausziehen.

Der Browsertest benötigt Node.js 22 oder neuer und einen separaten Chromium-/Edge-
Testprozess mit `--remote-debugging-port=9227` und geöffnetem `docs/index.html`.
Alternativ den Endpunkt über `CDP_URL` setzen. Die Seite vorzugsweise über einen
lokalen HTTP-Server öffnen; für die Pixelprüfungen des Browsertests über `file:`
benötigt Chromium `--allow-file-access-from-files`. Die Anwendung selbst benötigt
keine Pixelzugriffe auf geladene Bilder und funktioniert auch als lokale Datei.
Der Browsertest kontrolliert die hinterlegten Alphagrenzen aller neun Sprites;
nach einem Austausch der Grafiken müssen diese Grenzen aktualisiert werden.
Der Browsertest verändert die Bedienelemente im Testprofil.
