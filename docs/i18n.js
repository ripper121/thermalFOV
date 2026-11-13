(() => {
  'use strict';
  const english = {
    'Sprache':'Language', 'Automatisch':'Automatic',
    'FOV-Rechner für Wärmebildkameras mit Brennweitenvergleich und Wildtier-Referenz.':'Thermal camera field of view calculator with focal length comparisons and wildlife size references.',
    'Thermal FOV Rechner':'Thermal FOV Calculator', 'Thermal FOV Startseite':'Thermal FOV home',
    'LIVE-BERECHNUNG':'LIVE CALCULATION', 'OPTIK · SENSOR · DISTANZ':'OPTICS · SENSOR · DISTANCE',
    'Was sieht deine':'What does your', 'Wärmebildkamera?':'thermal camera see?',
    'Vergleiche Brennweiten, prüfe das Sichtfeld und sieh sofort, wie groß ein Wildtier im Bild erscheint.':'Compare focal lengths, check the field of view and see how large an animal appears in the image.',
    'Kamera':'Camera', 'Sensor-Voreinstellung':'Sensor preset', 'Benutzerdefiniert':'Custom',
    'Sensor manuell einstellen':'Manual sensor settings', 'Breite':'Width', 'Höhe':'Height',
    'Pixelabstand':'Pixel pitch', 'Aktive Sensorgröße':'Active sensor size', 'Digitaler Zoom':'Digital zoom',
    '7,68 × 6,14 mm':'7.68 × 6.14 mm', '1,0×':'1.0×', 'White Hot · 1,0×':'White Hot · 1.0×',
    'Vergrößert den Bildausschnitt, erzeugt aber keine zusätzlichen Sensordetails.':'Enlarges the image crop without capturing any additional sensor detail.',
    'Thermische Empfindlichkeit':'Thermal sensitivity', 'Aus':'Off', 'Ein':'On',
    'Kleinerer Wert = weniger Rauschen. Illustrativer Effekt ohne Temperaturkalibrierung; keine Vorhersage der Erkennungsleistung.':'Lower values mean less noise. Illustrative effect without temperature calibration; does not predict detection performance.',
    'Hintergrund':'Background', 'Thermal-Hintergrund auswählen':'Choose a thermal background',
    'Wald':'Forest', 'Feld':'Field', 'Baumdichte':'Tree density', 'Bewuchsdichte':'Vegetation density',
    'Hintergrund & Bewuchs erklärt':'About backgrounds & vegetation',
    'White Hot: warme Bereiche weiß, kalte Bereiche schwarz. Der entfernte Baumsaum ist auf 500 m abgestimmt. Zusätzlicher Bewuchs liegt zwischen 10 und 500 m: im Wald Baumgruppen mit Jungwuchs, im Feld flächige Rüben- und Rapsbestände mit Büschen am Rand. Dichte in 10er-Schritten; nahe Vegetation kann das Tier verdecken.':'White Hot: warm areas appear white, cold areas black. The distant tree line is scaled to 500 m. Additional vegetation spans 10–500 m: forest stands with young trees, or beet and rapeseed patches with bushes along field edges. Adjust density in steps of 10; nearby vegetation can obscure the animal.',
    'Brennweiten':'Focal lengths', '+ Hinzufügen':'+ Add', 'Brennweite schnell hinzufügen':'Quickly add a focal length',
    'Sichtfeld':'Field of view', 'Meter':'Metres', 'Menschliches Auge · grobe Annäherung':'Human vision · rough approximation',
    'Zentraler Sehausschnitt (39,6° × 27,0°)':'Central view (39.6° × 27.0°)',
    'Zentraler Sehausschnitt':'Central view',
    'Vergleich mit dem menschlichen Seheindruck zuschalten':'Enable the human vision comparison',
    'Vertikal':'Vertical', '39,6°':'39.6°', '27,0°':'27.0°', 'Kameravorschau':'Camera preview', 'So liest du die Vorschau':'How to read the preview',
    'Der gewählte Kamerarahmen zeigt das Sensorbild. Außerhalb liegt die geometrische Umgebung. Beobachterhöhe: 1,60 m ·':'The selected camera frame shows the sensor image. The surrounding area provides geometric context. Observer height: 1.60 m ·',
    'Kamera waagerecht':'Level camera', '· ebener Boden.':'· level ground.',
    'Verpixelte, mit der Maus verschiebbare Wildtier-Größenreferenz':'Pixelated wildlife size reference; drag to reposition',
    'Tier ziehen · Höhe ändert Entfernung':'Drag animal · height changes distance',
    'Tier ziehen · Bildausschnitt folgt':'Drag animal · view follows',
    'Entfernung entlang der Blickachse':'Distance along the viewing axis',
    'Entfernungsskala in 10-Meter-Schritten':'Distance scale in 10-metre steps',
    'Pixelwerte & Grenzen der Simulation':'Pixel values & simulation limits',
    'Winkel und Sichtfeld gelten für den gewählten Digitalzoom. „Anzeige m / px“ bezieht sich auf das simulierte Ausgaberaster in Sensorauflösung, „Nativ m / px“ auf die Objektebene pro Sensorpixel. IFOV ≈ Pixelabstand / Brennweite bleibt beim Digitalzoom gleich. Tierpixel sind projizierte Gesamtmaße; am Bildrand wird das Tier beschnitten. Die NETD-Darstellung simuliert relatives Sensorrauschen, ist aber keine radiometrische Messung.':'Angles and field of view include the selected digital zoom. “Display m / px” refers to the simulated output grid at sensor resolution; “Native m / px” is the object-plane distance per sensor pixel. IFOV ≈ pixel pitch / focal length is unchanged by digital zoom. Animal pixel counts describe the full projected silhouette; the image edges may crop it. The NETD preview illustrates relative sensor noise and is not a radiometric measurement.',
    'Seheindruck, Perspektive & Nachführung':'Human vision, perspective & tracking',
    'Der feste Ausschnitt von 39,6° × 27,0° dient als grobe Orientierung für einen zentralen Sehausschnitt des menschlichen Auges. Der tatsächliche Seheindruck hängt auch von Bildschirmgröße und Betrachtungsabstand ab; das gesamte menschliche Gesichtsfeld ist größer. Ausgeschaltet bildet das größte Kamerasichtfeld den äußeren Maßstab und der Bildausschnitt hält das Tier horizontal und vertikal in der Mitte. Die Umgebung folgt derselben Verschiebung. Alle Objekte teilen dieselbe Bodenperspektive; die waagerechten Bodenlinien liegen bei 10, 20, 50, 100, 200, 500 und 1000 m. Bei eingeschaltetem Vergleichsausschnitt bleibt die Kamera waagerecht. Tier und Vegetation im gewählten Kamerarahmen werden gemeinsam in Sensorauflösung gerastert; Digitalzoom vergrößert nur dieses Raster. Übergroße Tiere werden am Bildrand beschnitten.':'The fixed 39.6° × 27.0° crop provides a rough reference for a central human view. The perceived result also depends on screen size and viewing distance; the full human visual field is wider. When disabled, the widest camera field sets the outer scale and the view keeps the animal centred horizontally and vertically. The surroundings move with the same offset. All objects share one ground perspective; horizontal ground lines mark 10, 20, 50, 100, 200, 500 and 1000 m. With the comparison enabled, the camera stays level. Animals and vegetation within the selected camera frame share one sensor-resolution raster; digital zoom only enlarges that raster. Oversized animals are cropped at the image edges.',
    'GRÖSSENREFERENZ':'SIZE REFERENCE', 'Tier auswählen':'Choose an animal', 'Tiermaße & Wärmebild erklärt':'About animal sizes & thermal imagery',
    'Die Maße beschreiben die gesamte sichtbare Silhouette einschließlich Kopf, Ohren, Geweih und Schwanz, keine Schulterhöhe. Die Beispielbreite legt den Maßstab fest; die Höhe folgt aus den unverzerrten Grafikproportionen. Tiergrößen variieren in der Praxis. Die Graustufen sind illustrativ: Temperaturen, Fell, Wetter, Fokus, Beugung und Bildverarbeitung werden nicht physikalisch simuliert.':'Dimensions describe the full visible silhouette, including the head, ears, antlers and tail, rather than shoulder height. The example width sets the scale; height follows the original image proportions. Actual animal sizes vary. Grey levels are illustrative: temperature, fur, weather, focus, diffraction and image processing are not physically simulated.',
    'Berechnungsgrundlage & Formel':'Calculation model & formula',
    'Winkel = 2 × atan(Sensorgröße ÷ (2 × Brennweite)) · Sichtfeld = 2 × Distanz × tan(Winkel ÷ 2)':'Angle = 2 × atan(sensor size ÷ (2 × focal length)) · Field of view = 2 × distance × tan(angle ÷ 2)',
    'Idealisiertes, verzeichnungsfreies Objektiv mit quadratischen Sensorpixeln. Sensorgröße = Pixelzahl × Pixelabstand / 1000 (µm → mm). Digitalzoom beschneidet jede Bildachse um den Zoomfaktor. Reales Sichtfeld kann durch Verzeichnung, Fokus und Gerätebeschnitt abweichen.':'Ideal distortion-free lens with square sensor pixels. Sensor size = pixel count × pixel pitch / 1000 (µm → mm). Digital zoom crops each image axis by the zoom factor. Actual fields of view can vary with distortion, focus and device-specific cropping.',
    'Berechnungsgrundlage: Arducam':'Calculation reference: Arducam',
    'THERMALFOV · OPTISCHER FELDRECHNER':'THERMALFOV · OPTICAL FIELD CALCULATOR',
    'Tier-, Baum- und Feldpflanzengrafiken KI-generiert · Maßstab anhand hinterlegter Beispielmaße und Entfernungen':'AI-generated animal, tree and crop graphics · Scaled using example dimensions and distances',
    'Wildschwein':'Wild boar', 'Rothirsch':'Red deer', 'Rehwild':'Roe deer', 'Rotfuchs':'Red fox', 'AKTIV':'ACTIVE',
    'Brennweite {n}':'Focal length {n}', 'Brennweite entfernen':'Remove focal length',
    'Grafik nicht lesbar: {src}. {error}':'Cannot read image: {src}. {error}',
    'Grafik konnte nicht geladen werden: {src}':'Could not load image: {src}',
    'Bitte alle Zahlenfelder ausfüllen und die angegebenen Eingabegrenzen beachten.':'Fill in every numeric field and keep values within the specified limits.',
    'Kamerasichtfeld · Tier zentriert':'Camera field · animal centred',
    'Sichtfeldbreite':'Field of view width', 'Sichtfeldhöhe':'Field of view height', 'Pixel & Optik':'Pixels & optics',
    'Bildwinkel H / V / D':'View angle H / V / D', 'Anzeige m / px':'Display m / px', 'Nativ m / px':'Native m / px',
    '{animal} im Bild':'{animal} in the image', 'Nativ erfasst: {w} × {h} Sensorpixel':'Native capture: {w} × {h} sensor pixels',
    'NETD Aus':'NETD off', 'Bildausschnitt folgt dem Tier':'View follows the animal', ' (Vorschau)':' (preview)',
    'Wald mit {n} zusätzlichen Bäumen':'forest with {n} additional trees',
    'Feld mit {n} zusätzlichen Pflanzen':'field with {n} additional plant clumps', 'schwarzem Hintergrund':'black background',
    '{animal}: {size}. Ziehen zum Verschieben und Ändern der Entfernung.':'{animal}: {size}. Drag to reposition and change distance.',
    '{animal} vor {scene} im {frame}, White Hot. Mit der Maus verschiebbar; die Höhe bestimmt die Entfernung.':'{animal}, {scene}, {frame}, White Hot. Drag to reposition; vertical position controls distance.'
  };
  function chooseLanguage(preference,languages){
    if(preference==='de'||preference==='en')return preference;
    return /^de(?:-|$)/i.test(languages?.[0]||'')?'de':'en';
  }
  let preference='auto';
  try{const saved=globalThis.localStorage?.getItem('thermalFovLanguage');if(['auto','de','en'].includes(saved))preference=saved}catch{}
  const browserLanguages=()=>globalThis.navigator?.languages?.length?globalThis.navigator.languages:[globalThis.navigator?.language||'en'];
  let language=chooseLanguage(preference,browserLanguages());
  function t(message,values={}){
    const translated=language==='en'?(english[message]??message):message;
    return translated.replace(/\{(\w+)\}/g,(match,key)=>Object.hasOwn(values,key)?String(values[key]):match);
  }
  const textBindings=[],attributeBindings=[];
  function apply(){
    if(typeof document==='undefined')return;
    document.documentElement.lang=language;
    for(const [node,source,prefix,suffix] of textBindings)node.nodeValue=prefix+t(source)+suffix;
    for(const [element,attribute,source] of attributeBindings)element.setAttribute(attribute,t(source));
    const select=document.querySelector('#language');if(select)select.value=preference;
    document.querySelectorAll('[data-lens]').forEach(button=>{
      button.textContent=Number(button.dataset.lens).toLocaleString(api.locale,{maximumFractionDigits:1});
    });
  }
  function refresh(){
    language=chooseLanguage(preference,browserLanguages());apply();
    if(typeof document!=='undefined')document.dispatchEvent(new Event('thermal-language-change'));
  }
  const api={t,chooseLanguage,get language(){return language},get locale(){return language==='de'?'de-DE':'en-GB'},get preference(){return preference},
    setPreference(value){
      preference=['auto','de','en'].includes(value)?value:'auto';
      try{globalThis.localStorage?.setItem('thermalFovLanguage',preference)}catch{}
      refresh();
    }
  };
  globalThis.thermalI18n=api;
  if(typeof document!=='undefined'){
    // Bind original text nodes once: inputs, links and open disclosures stay intact.
    const walker=document.createTreeWalker(document.documentElement,4);
    while(walker.nextNode()){
      const node=walker.currentNode,source=node.nodeValue.trim();
      if(node.parentElement.closest('script,style')||!Object.hasOwn(english,source))continue;
      textBindings.push([node,source,node.nodeValue.match(/^\s*/)[0],node.nodeValue.match(/\s*$/)[0]]);
    }
    document.querySelectorAll('[aria-label],[title],meta[name="description"]').forEach(element=>{
      for(const attribute of ['aria-label','title','content']){
        const source=element.getAttribute(attribute);if(source&&Object.hasOwn(english,source))attributeBindings.push([element,attribute,source]);
      }
    });
    apply();
    document.querySelector('#language')?.addEventListener('change',event=>api.setPreference(event.target.value));
    globalThis.addEventListener('languagechange',()=>{if(preference==='auto')refresh()});
  }
})();
