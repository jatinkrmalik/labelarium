// Phomemo M110 — reference data for Labelarium.
// App-first pack. No official PDF is published. Sources (only these two pages):
//   https://phomemo.com/pages/m110-support-center
//   https://phomemo.com/blogs/guides/m110-setup-guide-from-unboxing-to-printing-in-5-minutes
// Images: crops of on-page official photos (M110 product render + Print Master screenshot
// on the Support Center). Number badges on the crop match the legend below.
// Notation in steps: [Control] = a control on the printer or in Print Master, {Text} = on-screen copy, → = then.
// Phomemo has not published numbered symbol, frame, font or template catalogs — those lists
// are empty on purpose. Do not treat the one Print Master stand-in font as a device catalog.
export default {
  id: 'phomemo-m110',
  brand: 'Phomemo',
  model: 'M110',
  name: 'M110',
  tagline: 'Bluetooth Portable Thermal Business Label Maker',
  links: [
    ['M110 Support Center (drivers, FAQs, videos)', 'https://phomemo.com/pages/m110-support-center'],
    ['M110 setup guide: unboxing to printing', 'https://phomemo.com/blogs/guides/m110-setup-guide-from-unboxing-to-printing-in-5-minutes'],
    ['Print Master app, drivers & Quick Start hub', 'https://phomemo.com/pages/drivers'],
    ['Video: connect with Print Master (iOS / Android)', 'https://www.youtube.com/watch?v=UHeO00bpFN0'],
    ['Video: Windows driver (Labelife, Win10)', 'https://www.youtube.com/watch?v=9LDwWfc6yw0'],
    ['Video: Mac driver (Labelife)', 'https://www.youtube.com/watch?v=WdTarFpR-v0'],
    ['Video: Chrome extension (Labelife)', 'https://www.youtube.com/watch?v=3IRQa1I31Eg'],
    ['Shop M110', 'https://phomemo.com/products/m110-label-maker'],
  ],
  specs: [
    ['Kind', 'Portable inkless direct-thermal label printer. Design and print from a phone; no ink cartridges.'],
    ['Print', '203 dpi. Setup guide: barcodes, logos, QR codes and text from a mobile device.'],
    ['Labels', 'Width 20–50 mm. In-box sample: 40 × 30 mm (1½" × 1⅛"), 100 labels. Support-page app screenshot shows 25 × 75 mm. Phomemo has not published a full size catalog here.'],
    ['App', 'Print Master for iOS and Android. Pair inside the app (Connect Device → M110), not in the phone’s Bluetooth settings.'],
    ['Computer', 'Support Center lists Windows 7 / 8 / 10 (32- and 64-bit), Windows 11 (64-bit), macOS 10.14 / 10.15 / 10.11 / 12, and Chrome OS, with Setup Utilities and video tutorials. Setup guide FAQ: primarily mobile-focused; USB + driver for Windows.'],
    ['Battery', 'Built-in rechargeable 1200 mAh lithium; not user-replaceable. Support Center: about 4 hours continuous printing, about 1.5 hours to recharge. Setup guide: up to 4–5 hours; charge about 2–3 hours. Charge LED: red = charging, green = charged.'],
    ['In the box', 'Support Center: printer, 40 × 30 mm 100-label roll (pre-loaded), USB cable, user manual. Setup guide also lists a warranty card and calls the roll a sample. Product registration is no longer necessary; keep proof of purchase for warranty.'],
    ['Barcode', 'Print Master can create barcodes and QR codes, including Code128, Code39, Codabar, EAN-8 and EAN-13.'],
    ['Thermal life', 'Support Center: paper stores up to 10 years if kept from light, dark and at normal temperature; avoid high heat and sun in use. Setup guide FAQ: printed labels last 1–2 years depending on the environment.'],
    ['Manual', 'No official PDF. Support Center “M110 Manual” and “Quick Start Guide” both link to the drivers page.'],
    ['Support', 'vip@phomemo.com · phomemo.com/support · +1 855 957 5321, Mon–Fri 9:00–5:00 EDT (US).'],
  ],
  tapes: [
    { mm: 20, in: '0.79"', lines: 1, note: 'Minimum width Phomemo lists (20–50 mm). Line count and layout are set in Print Master, not by the printer.' },
    { mm: 25, in: '0.98"', lines: 1, note: '25 × 75 mm appears on Phomemo’s Support Center Print Master screenshot as {(25X75)earrings}. Not a full size list.' },
    { mm: 40, in: '1.57"', lines: 1, note: 'In-box roll: 40 × 30 mm (1½" × 1⅛"), 100 labels, already inside. Open the cover, pull the end out so the sensor sees it. Load with the adhesive side facing out.' },
    { mm: 50, in: '1.97"', lines: 1, note: 'Maximum width Phomemo lists (20–50 mm).' },
  ],
  keyboard: {
    image: 'img/keyboard.jpg',
    legend: [
      [1, 'LCD', 'Status screen on the front. Official product render shows {Label Printer}, a battery icon and a device id.'],
      [2, 'Battery icon', 'On the LCD. Separate from the charge LED (red = charging, green = charged) described in the setup guide.'],
      [3, 'Cover / lid', 'Top cover with the Phomemo mark. Setup guide: press the side button to open it, then close the lid securely after loading.'],
      [4, 'Label exit', 'Printed labels come out of the slot under the cover. Feed the roll through the paper guide so the sensor can see the paper.'],
      [5, 'USB charging port', 'Right side of the printer (official product render). Setup guide: charge with the included USB cable before first use (~2–3 hours there; Support Center says ~1.5 hours).'],
      [6, 'Charge LED', 'Setup guide: a red light means charging; green means fully charged. Not a numbered callout on the photo.'],
      [7, 'Label sensor / paper guide', 'Setup guide: feed the label through the paper guide and keep it aligned with the sensor. Support Center: pull the pre-loaded roll out a little so the printer senses it.'],
      [8, 'Power key', 'Left front key on the official product render (power symbol). The two pages do not name the key; the icon is on the photo.'],
      [9, 'Printer-symbol key', 'Right front key on the official product render (printer icon). The two pages do not name the key. Printing is started from Print Master.'],
      [10, 'Side button (open cover)', 'Setup guide: press the side button to open the top cover. Not a separate callout on the photo.'],
      [11, 'Label size in Print Master', 'Official screenshot shows {(25X75)earrings} in the top bar — size plus template name. Set size in the app to match the roll.'],
      [12, 'Text', 'Print Master tool on the Support Center screenshot. Add and edit text on the canvas.'],
      [13, 'Code', 'Print Master tool on the screenshot. Barcodes and QR codes; Support Center also lists Code128, Code39, Codabar, EAN-8 and EAN-13.'],
      [14, 'Icon', 'Print Master tool on the screenshot. Phomemo has not published an icon/symbol sheet for the M110.'],
      [15, 'Frames', 'Print Master tool on the screenshot. Phomemo has not published a numbered frame catalog for the M110.'],
      [16, 'Form', 'Print Master tool on the screenshot (globe icon, labelled Form).'],
      [17, 'Picture', 'Print Master tool on the screenshot. Logos and images; setup guide says the printer can print logos.'],
      [18, 'Copy', 'Print Master tool on the screenshot.'],
      [19, 'Scan', 'Print Master tool on the screenshot.'],
      [20, 'Time', 'Print Master tool on the screenshot.'],
      [21, 'Print', 'Blue circular [Print] button on the screenshot. Setup guide: tap Print; the label prints in seconds.'],
    ],
  },
  shortcuts: [
    { keys: 'Phone [Bluetooth] on → open Print Master → [Connect Device] → {M110}', action: 'Pair the printer. Do not pair from the phone’s Bluetooth settings — that fails.', kw: 'bluetooth pair connect device app print master wireless' },
    { keys: 'Print Master → template → [Print]', action: 'Print a label from the app', kw: 'print first label template' },
    { keys: '[Text] / [Code] / [Icon] / [Frames] / [Picture]', action: 'Tools shown on Phomemo’s Support Center screenshot of Print Master', kw: 'text barcode qr icon frames picture logo' },
    { keys: '[Side button] → open cover', action: 'Open the top cover to load labels', kw: 'cover lid open load tape' },
    { keys: 'USB cable → charge until green', action: 'Charge. Red = charging, green = charged.', kw: 'charge battery usb red green led' },
    { keys: 'Pull label end out a little', action: 'Let the pre-loaded roll reach the sensor', kw: 'sensor sense paper load first use' },
    { keys: 'Support Center → Print Master for iOS / Android', action: 'Download the app from the official drivers hub', kw: 'download app ios android play store app store' },
    { keys: 'Support Center → Setup Utilities for Windows / Mac', action: 'Computer drivers (also Chrome OS on that page)', kw: 'windows mac chrome driver labelife computer usb' },
  ],
  fonts: [
    ['Print Master', 'print-master.png', 'Stand-in only. Typeface is chosen in Print Master (or Labelife on a computer). Phomemo has not published a named font list for the M110.', 'system-ui, -apple-system, "Segoe UI", sans-serif', 400, 'normal'],
  ],
  sizes: [['App', 'size-app.png', 1]],
  widths: [['App', 'width-app.png', 1]],
  styles: [['App', 'style-app.png']],
  alignments: [['App', 'align-app.png']],
  fontNote: 'The M110 has no on-printer font menu. Size, width, style and alignment live in Print Master. Phomemo has not published a font/glyph sheet, so this pack does not invent one. The preview uses a generic system sans as a stand-in. Label-preview key recipes in this app still use P-touch wording (shared shell) — on the M110 you tap Print in the app instead.',

  symbols: {
    howto: [
      'The M110 has no [Symbol] key. Icons are inserted in Print Master with the [Icon] tool (visible on Phomemo’s Support Center screenshot).',
      'Phomemo has not published a numbered symbol or pictograph catalog for the M110, so this pack does not invent one.',
      'Accented letters are typed on your phone in the app, not on the printer.',
    ],
    categories: [],
    accented: {
      image: 'img/symbols/accented.png',
      howto: [
        'Type the letter in Print Master on your phone (the iOS/Android keyboard, including accents).',
        'Phomemo has not published an accent table for the M110.',
      ],
      table: {},
    },
  },

  frames: {
    howto: [
      'There is no [Frame] key on the printer. The Support Center screenshot of Print Master shows a [Frames] tool on the canvas.',
      'Phomemo has not published a numbered frame list, so this pack does not invent one.',
    ],
    notes: [
      'Layout, including any frame, is set in Print Master (or Labelife on a computer).',
      'Official pages do not say which frames need which label width.',
    ],
    items: [
      ['off', 'No frame (layout is in Print Master)', 'none off plain app'],
    ],
  },

  templates: {
    notes: [
      'Print Master: choose or create a template. Setup guide examples: price tag, barcode, name label. Then customise text, icons and layout and tap Print.',
      'Phomemo has not published a numbered text/pattern template catalog for the M110, so those lists are empty on purpose.',
      'The Support Center screenshot shows a hang-tag layout named {earrings} at 25 × 75 mm — an example, not item 01 of a catalog.',
    ],
    textHowto: [
      'Open Print Master and connect {M110}.',
      'Choose or create a template (setup guide examples: price tag, barcode, name label).',
      'Customise text, icons and layout.',
      'Tap [Print].',
    ],
    patternHowto: [
      'Phomemo has not published a separate pattern-template list for the M110.',
      'Decorative layout is done in Print Master, not from an on-printer template library.',
    ],
    text: [],
    pattern: [],
  },

  howto: [
    { id: 'unbox', title: 'What is in the box', kw: 'unbox package contents roll manual cable warranty',
      steps: [
        'Support Center: Phomemo M110 printer × 1; 1½" × 1⅛" (40 × 30 mm) 100-label roll × 1 (already inside — open the cover and pull it out a little so the printer senses it); USB cable × 1; user manual × 1.',
        'Setup guide also lists a warranty card and calls the roll a sample of 40 mm × 30 mm labels.',
      ],
      notes: ['Product registration is no longer necessary. Keep proof of purchase for warranty.'] },
    { id: 'charge', title: 'Charge the printer', kw: 'charge battery usb red green led first use 1200mah',
      steps: [
        'Before first use, connect the included USB cable to a power source.',
        'Wait until the indicator is green. Red = charging; green = charged.',
      ],
      notes: [
        'Setup guide: about 2–3 hours to charge; 1200 mAh battery, up to 4–5 hours of continuous printing.',
        'Support Center: about 1.5 hours to refill; about 4 hours continuous. The battery is built-in and not user-replaceable.',
      ] },
    { id: 'load', title: 'Load thermal labels', kw: 'load roll tape paper cover side button sensor adhesive guide jam',
      steps: [
        'Press the side button to open the top cover.',
        'Insert the label roll with the adhesive side facing out.',
        'Feed the label through the paper guide.',
        'Close the lid securely.',
        'Keep the paper aligned with the sensor. If the roll was pre-loaded, pull the end out a little so the printer senses it.',
      ],
      notes: ['Width support listed by Phomemo: 20–50 mm. In-box sample is 40 × 30 mm.'] },
    { id: 'app', title: 'Install Print Master and connect', kw: 'print master app bluetooth pair connect ios android download',
      steps: [
        'Install Print Master: iOS App Store or Android Google Play, or the Support Center / drivers hub.',
        'Turn on Bluetooth on the phone.',
        'Open Print Master and allow permissions.',
        'Tap [Connect Device] → select {M110}.',
      ],
      notes: [
        'MUST connect from Print Master, NOT from the phone’s Bluetooth settings — otherwise pairing fails.',
        'The app remembers the device for later sessions.',
      ] },
    { id: 'print', title: 'Print the first label', kw: 'print first label template text barcode',
      steps: [
        'Open Print Master (printer already connected).',
        'Choose or create a template (setup guide examples: price tag, barcode, name label).',
        'Customise text, icons and layout. Tools on the official screenshot include [Text], [Code], [Icon], [Frames], [Form], [Picture], [Copy], [Scan], [Time].',
        'Tap [Print]. The label prints in seconds.',
      ],
      notes: ['203 dpi. Good for retail, logistics, food packaging and similar uses, per the setup guide.'] },
    { id: 'barcode', title: 'Barcodes and QR codes', kw: 'barcode qr code128 code39 codabar ean8 ean13',
      steps: [
        'In Print Master, use [Code] (and related barcode/QR tools in the app).',
        'Support Center: the software can create Code128, Code39, Codabar, EAN-8, EAN-13 and similar codes, plus QR codes.',
      ],
      notes: ['Setup guide FAQ: generate and print barcodes and QR codes directly from the app.'] },
    { id: 'computer', title: 'Windows, Mac and Chrome OS', kw: 'windows mac chrome os driver usb labelife computer pc',
      steps: [
        'Support Center: download Phomemo Setup Utilities for Windows or Mac from the drivers hub. Chrome OS is listed on the same page.',
        'Watch the official videos on that page: Print Master on phones; Labelife driver on Windows 10; Labelife on Mac; Labelife Chrome extension.',
        'Setup guide FAQ: the M110 is primarily mobile-focused; you can connect via USB for Windows with driver support.',
      ],
      notes: [
        'Listed OS: Windows 7 / 8 / 10 (32- and 64-bit), Windows 11 (64-bit); macOS 10.14, 10.15, 10.11, 12; Chrome OS.',
        'This pack does not document Labelife menus — Phomemo has not published that catalog on these two pages.',
      ] },
    { id: 'paper', title: 'How long thermal labels last', kw: 'fade thermal paper storage sun heat lifespan years',
      steps: [
        'Support Center: store paper up to 10 years away from light, in the dark, at normal temperature. In use, avoid high temperature and sun.',
        'Setup guide FAQ: with proper storage, printed thermal labels last 1–2 years depending on the environment.',
      ],
      notes: ['The two official pages give different figures (storage vs printed life). This pack keeps both.'] },
    { id: 'support', title: 'Contact Phomemo', kw: 'support email phone warranty repair replace vip',
      steps: [
        'E-mail: vip@phomemo.com',
        'Web: phomemo.com/support',
        'Phone: +1 855 957 5321, Mon–Fri 9:00–5:00 EDT (US).',
      ],
      notes: ['Support Center: they will help, or repair or replace. Keep proof of purchase.'] },
  ],

  errors: [],
  problems: [
    ['Bluetooth connection fails / cannot pair', 'Turn Bluetooth on, open Print Master, tap Connect Device, select M110. Do not pair from the phone’s Bluetooth settings — the Support Center says that fails.'],
    ['App won’t connect', 'Setup guide: restart Bluetooth or re-pair in app settings.'],
    ['Paper jam', 'Setup guide: check alignment and make sure the sensor reads the label. Reload with the adhesive side out, paper in the guide, lid closed.'],
    ['Faded print', 'Setup guide: replace the roll; expired thermal paper can affect quality. Keep paper away from heat and sun.'],
    ['Printer does not sense the in-box roll', 'Support Center: the 40 × 30 mm roll is already inside. Open the cover and pull it out a little so the M110 can sense it.'],
    ['Misaligned print', 'Setup guide: keep the paper aligned with the sensor when loading.'],
    ['Need Windows or Mac', 'Use the Support Center Setup Utilities and the Labelife videos on that page. Setup guide: USB + driver for Windows; the product is primarily mobile.'],
    ['Want a PDF manual', 'Phomemo has not published an M110 PDF. Support Center “M110 Manual” and “Quick Start Guide” both go to the drivers page. Use that page plus the setup guide.'],
    ['Battery questions', 'The 1200 mAh pack is built-in and not user-replaceable. Charge with the included USB cable (red → green).'],
  ],
  tips: [
    'Pair in Print Master ([Connect Device] → {M110}), never in the phone’s Bluetooth list.',
    'The in-box 40 × 30 mm roll is already loaded — open the cover and pull the end out so the sensor sees it.',
    'Load later rolls with the adhesive side facing out, through the paper guide, lid closed.',
    'Charge before first use. Red LED = charging, green = ready.',
    'Keep thermal labels away from sun and heat. Official pages disagree on life: up to 10 years stored, or 1–2 years printed.',
    'Barcodes and QR codes are created in the app ([Code]), not on a printer keyboard.',
    'This printer has no symbol/frame/font catalog on the device. Empty sections in this pack are intentional — Phomemo did not publish those lists on the official pages.',
  ],
};
