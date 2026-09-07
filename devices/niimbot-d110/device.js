// NIIMBOT D110. Reference data for Labelarium.
// Source: official Product Manual, D110_M English V1.1 (PDF title D110_M英文版说明书, 13 pages, 2024).
// US SKU D110_M. App-first thermal printer. This guide has no on-device symbol, frame, template or font catalog.
// Notation in steps: [Key] = a control on the printer, {Text} = app / status wording, → = then.
// Symbol items: [name, keywords, unicode approximation]. These are diagrams printed in this guide, not printer glyphs.
export default {
  id: 'niimbot-d110',
  brand: 'NIIMBOT',
  model: 'D110',
  name: 'D110',
  tagline: 'Smart Label Printer (US SKU D110_M)',
  links: [
    ['Official product manual (D110_M)', 'https://www.niimbot.com/us/productInstruction?productCode=HPC250801095736000004'],
    ['NIIMBOT website', 'https://www.niimbot.com'],
    ['Support email', 'mailto:service@niimbot.com'],
  ],
  specs: [
    ['Tape', 'Thermal label paper. Printing width 12 mm. This guide does not list other widths or TZe tape.'],
    ['Print', '203 dpi thermal printing'],
    ['Text', 'Designed in the NIIM or NIIMBOT app Drawing Board. This guide does not list a character limit.'],
    ['Fonts', 'Chosen in the app. This getting-started guide does not print a font catalog.'],
    ['Decorations', 'Icons and templates live in the NIIM / NIIMBOT apps. This guide does not print those catalogs.'],
    ['Memory', 'Not specified. Quick press can be set in the app to {Print history}.'],
    ['Power', '1500 mAh battery; USB Type-C charge, 5 V DC 1 A; 3–4 hours to charge'],
    ['Auto power off', 'Not specified in this guide'],
    ['Size / weight', '98 × 76 × 30 mm, 149 g'],
    ['Cutter', 'Manual cutting blade on the paper compartment lid'],
    ['Model', 'NIIMBOT D110_M (cover title: NIIMBOT D110)'],
    ['Connectivity', 'Bluetooth 2402–2480 MHz, BLE 2402–2480 MHz, transmit power 4 dBm maximum'],
    ['NFC', '13.56 MHz'],
    ['Operating temperature', '5°C – 40°C'],
  ],
  tapes: [
    { mm: 12, in: '0.47"', lines: 1, note: 'Printing width 12 mm (thermal labels). Line count is set in the app; this guide does not specify a 2-line hardware limit.' },
  ],
  keyboard: {
    image: 'img/keyboard.png',
    legend: [
      [1, 'Indicator light', 'Ring around the power button. Blue / green / red show power, Bluetooth, printing and faults (see Troubleshooting).'],
      [2, 'Power button', 'The circle on the front. Hold to power on or off; short press and double-press are app-assigned or print a test page.'],
      [3, 'Cutting blade', 'On the paper compartment lid. Tear labels against it after printing. Shown on the load-paper diagram.'],
      [4, 'Printing surface', 'The coated face of the label roll. Insert print-side down, first label protruding from the outlet.'],
      [5, 'Door-open button', 'Top slider marked OPEN. Slide to the left to open the paper compartment.'],
      [6, 'Power Indicator light', 'Small LED on the top next to the Type-C port. White: charging, full, or low battery.'],
      [7, 'Paper compartment', 'Hinge-open bay for the label roll. Close the lid after the first label sits in the outlet.'],
      [8, 'Hold 2–3 seconds', 'On or off. The installation page says hold for three seconds to power on.'],
      [9, 'Quick press', 'Set in the app to {Don\'t feed paper}, {Print current time} or {Print history}.'],
      [10, 'Press twice', 'Print testing page.'],
    ],
  },
  shortcuts: [
    { keys: 'hold [Power] 2–3 seconds', action: 'Power on or off', kw: 'on off power hold start shutdown' },
    { keys: 'quick press [Power]', action: 'Don\'t feed paper, print current time, or print history (set in the app)', kw: 'feed time history short press click' },
    { keys: 'press [Power] twice', action: 'Print testing page', kw: 'test page self test double click' },
    { keys: 'Bluetooth PIN {0000} or {1234}', action: 'If the phone asks for a PIN while pairing', kw: 'pin pairing bluetooth pair code' },
    { keys: 'Android location permission', action: 'Turn on location so the app can search for Bluetooth devices', kw: 'android location gps permission bluetooth scan' },
  ],
  fonts: [
    ['App typeface', 'niimbot.png', 'Type is chosen in the NIIM or NIIMBOT app. This getting-started guide does not print a font catalog; the sample is the NIIMBOT wordmark from the cover.', '"Helvetica Neue", Helvetica, Arial, sans-serif', 700, 'normal'],
  ],
  sizes: [['App-chosen', 'niimbot.png', 1]],
  widths: [['App-chosen', 'niimbot.png', 1]],
  styles: [
    ['Normal', 'niimbot.png'],
  ],
  alignments: [['App-chosen', 'niimbot.png']],
  fontNote: 'The D110 has no [Font] key. Size, width, style and alignment are set in the NIIM or NIIMBOT app. This Product Manual does not print those catalogs.',

  symbols: {
    howto: [
      'The D110 has no [Symbol] key and no on-printer symbol catalog. Add icons on the Drawing Board in the NIIM or NIIMBOT app.',
      'The pictures below are the diagrams printed in the D110_M Product Manual (package contents, installation, apps, parts and warnings). Not glyphs stored on the printer.',
      'Open a picture to see its caption from the guide.',
    ],
    categories: [
      { id: 'package', name: 'Package contents', group: 'Pictograph', key: '1', kw: 'box contents unbox accessories cable roll manual', items: [
        ['Smart Label Printer', 'printer unit body d110', '🖨️'],
        ['Label Paper Roll', 'tape labels thermal roll consumable', '🏷️'],
        ['USB Type-C Cable', 'charge cable usb-c type-c cord', '🔌'],
        ['Product Manual', 'guide booklet instructions', '📄'],
      ]},
      { id: 'install', name: 'Installation', group: 'Pictograph', key: '2', kw: 'setup load paper power open compartment', items: [
        ['Power button', 'hold three seconds power on front', '⏻'],
        ['Button to open compartment', 'OPEN slider door lid left', '📂'],
        ['Load label paper', 'print side down cutting blade outlet roll', '📥'],
      ]},
      { id: 'apps', name: 'Printer software', group: 'Pictograph', key: '3', kw: 'app download niimbot niim google play app store', items: [
        ['NIIMBOT Design & Print APP', 'commercial industrial templates batch import', '📱'],
        ['NIIM Design & Print APP', 'home storage creative household icons', '🏠'],
      ]},
      { id: 'connect', name: 'Connecting to print', group: 'Pictograph', key: '4', kw: 'bluetooth pair phone drawing board', items: [
        ['Turn on Bluetooth', 'phone niim app pairing', '📶'],
      ]},
      { id: 'parts', name: 'Product description', group: 'Pictograph', key: '5', kw: 'parts indicator light power button led badge', items: [
        ['Printer (cover view)', 'body 3/4 isometric', '🖨️'],
        ['Indicator light and power button', 'front controls ring', '🔘'],
        ['Power Indicator light', 'charge led type-c top', '💡'],
        ['NIIMBOT D110 badge', 'model name plate sku', '📛'],
      ]},
      { id: 'warnings', name: 'Safety warnings', group: 'Pictograph', key: '7', kw: 'safety warning disassemble chemical flammable', items: [
        ['Do not disassemble the product yourself', 'screwdriver no returns exchanges', '🪛'],
        ['Do not use corrosive chemical products or cleaners', 'wipe cloth bottle solvent', '🧴'],
        ['Do not use near flammable substances', 'gas station fuel depot fire', '🔥'],
      ]},
    ],
    accented: {
      image: 'img/symbols/accented.png',
      howto: [
        'This printer has no [Accent] key and this getting-started guide does not print an accent table.',
        'Type accented letters in the NIIM or NIIMBOT app on the Drawing Board.',
        'The picture is the guide\'s own note: illustrations of products, accessories and software interfaces are for reference only.',
      ],
      table: {},
    },
  },

  frames: {
    howto: [
      'The D110 has no [Frame] key.',
      'Add borders and decorations on the Drawing Board in the NIIM or NIIMBOT app.',
    ],
    notes: [
      'This Product Manual does not print a frame catalog. Off is the only slot. There are no numbered Brother-style frames on this printer.',
    ],
    items: [
      ['off', 'No frame', 'none off plain drawing board'],
    ],
  },

  templates: {
    notes: [
      'Templates live in the phone apps, not on the printer. This getting-started guide does not print a template catalog.',
      'NIIMBOT app: industry-specific templates, data import, batch printing (commercial / industrial).',
      'NIIM app: creative icons and household label templates (home storage / personal projects).',
    ],
    textHowto: [
      'Download the NIIMBOT or NIIM app from the App Store or Google Play.',
      'Connect the printer over Bluetooth.',
      'Open the Drawing Board (or a template in the app) and type your text.',
    ],
    patternHowto: [
      'Pattern / decorative designs, if any, are in the NIIM or NIIMBOT app. Not listed in this guide.',
    ],
    text: [],
    pattern: [],
  },

  howto: [
    { id: 'power', title: 'Power on and off', kw: 'power on off hold button start shutdown three seconds',
      steps: ['Press and hold the [Power] button for three seconds to power on (the button-functions table also lists hold 2–3 seconds for on or off).', 'Hold [Power] 2–3 seconds again to power off.'],
      notes: ['If the device cannot be turned on, charge for one hour.'] },
    { id: 'load-paper', title: 'Load the label paper', kw: 'install tape roll compartment open print side down cutter outlet',
      steps: ['Slide the door-open button (OPEN) to the left to open the paper compartment.', 'Place the label roll in the compartment with the printing surface face down and the first label protruding from the paper outlet.', 'Close the paper compartment.'],
      notes: ['The cutting blade is on the lid. Tear against it after printing.', '※ The label paper should be inserted with the printing side face down in the paper compartment.'] },
    { id: 'apps', title: 'Download NIIMBOT or NIIM', kw: 'app software download store google play commercial home',
      steps: ['For commercial or industrial work, download the NIIMBOT app (industry templates, data import, batch printing).', 'For home storage or personal projects, download the NIIM app (creative icons and household templates).', 'Get either app from the Apple App Store or Google Play.'],
      notes: ['The guide calls both “Design & Print APP, easy to download and use”.'] },
    { id: 'connect', title: 'Connect over Bluetooth and print', kw: 'bluetooth pair pin 0000 1234 drawing board android location',
      steps: ['Once the app is downloaded, turn on the phone\'s Bluetooth.', 'Open the app and search for Bluetooth devices to connect to.', 'If it asks for a PIN, enter {0000} or {1234}, then press OK.', 'Once connected, go to the Drawing Board.'],
      notes: ['Location permissions may need to be enabled on Android phones.', 'Illustrations of software interfaces in this guide are for reference only.'] },
    { id: 'button', title: 'Power-button actions', kw: 'quick press double press test page feed time history',
      steps: ['Hold 2–3 seconds: on or off.', 'Quick press: set in the app to {Don\'t feed paper}, {Print current time} or {Print history}.', 'Press twice: print a testing page.'] },
    { id: 'charge', title: 'Charge the printer', kw: 'battery usb type-c charge low power 1500mah',
      steps: ['Plug the USB Type-C cable into the port on the top (next to the Power Indicator light).', 'Input is 5 V DC, 1 A. Charging time is 3–4 hours.', 'Watch the Power Indicator light: white blinking slowly = charging; white solid = fully charged and connected to power; white flashing quickly = low battery.'],
      notes: ['If you use a power adapter, it must be safe, compliant, and meet the standards.', 'If the device cannot be turned on, charge for one hour.'] },
    { id: 'indicators', title: 'Read the indicator lights', kw: 'led blue green red white bluetooth firmware printing fault',
      steps: ['Front Indicator light (around the power button): blue solid = powered on but not connected; blue flashing quickly = upgrading firmware; green solid = Bluetooth connected; green flashing quickly = printing; red solid = device fault.', 'Top Power Indicator light: white blinking slowly = charging; white solid = fully charged and connected to power; white flashing quickly = low battery.'] },
    { id: 'safety', title: 'Safety precautions', kw: 'warning children water battery adapter smoke disassemble flammable',
      steps: ['Do not disassemble the product yourself (no returns or exchanges for disassembled products).', 'Do not use corrosive chemical products or cleaners to wipe the product.', 'Do not use the product near flammable substances (gas stations, fuel depots, etc.).', 'Keep the product and accessories away from children, or use only under a guardian.', 'If the product enters water, or malfunctions, disconnect it from power immediately.', 'Do not replace the battery yourself. Incorrect replacement can explode.', 'If you notice smoke or a smell from the product or adapter, disconnect immediately and avoid burns.'],
      notes: ['Buy the version that matches your region from the NIIMBOT official store or an authorized sales agent.'] },
  ],

  errors: [
    ['Blue · solid', 'Powered on but not connected.', 'Open the NIIM or NIIMBOT app and connect over Bluetooth.'],
    ['Blue · flashing quickly', 'Upgrading firmware.', 'Wait until the light stops flashing quickly.'],
    ['Green · solid', 'Bluetooth connected.', 'Go to the Drawing Board and print.'],
    ['Green · flashing quickly', 'Printing.', 'Wait for the job to finish, then tear against the cutting blade.'],
    ['Red · solid', 'Device fault.', 'Disconnect power. Do not keep using a malfunctioning device. Contact NIIMBOT support if it persists.'],
    ['White · blinking slowly', 'Charging.', 'Leave it plugged in (3–4 hours from empty).'],
    ['White · solid', 'Fully charged and connected to power.', 'You can unplug or keep it on the adapter.'],
    ['White · flashing quickly', 'Low battery.', 'Charge via USB Type-C (5 V DC, 1 A).'],
  ],
  problems: [
    ['Device cannot be turned on', 'Charge for one hour, then hold [Power] for three seconds.'],
    ['Phone cannot find the printer', 'Turn the printer on, enable Bluetooth, and on Android enable location permission. If a PIN is requested, try 0000 or 1234.'],
    ['Labels print blank or very faint', 'Reload the roll with the printing surface face down and the first label in the outlet. Direct thermal paper only.'],
    ['Red indicator stays on', 'Device fault. Disconnect from power. Do not disassemble. Contact service@niimbot.com.'],
    ['White light flashes quickly', 'Low battery. Charge with the USB Type-C cable.'],
    ['Product entered water', 'Immediately disconnect from the power source.'],
    ['Smoke or a smell from the printer or adapter', 'Disconnect the power adapter immediately, taking care to avoid burns.'],
    ['Considering opening the case or replacing the battery', 'Do not. Disassembled units are not accepted for return or exchange; incorrect battery replacement can explode.'],
  ],
  tips: [
    'Commercial or industrial jobs: NIIMBOT app. Home storage and crafts: NIIM app. Both are on the App Store and Google Play.',
    'After pairing, the guide\'s next step is the Drawing Board. That is where you design the label.',
    'Print side face down, first label sticking out of the outlet, then close the lid.',
    'Quick press is not fixed: set it in the app to skip feeding, print the time, or reprint history.',
    'Double-press [Power] prints a testing page. Useful before you blame the app.',
    'If it will not power on, charge for a full hour before trying again.',
    'Illustrations in this getting-started guide are for reference; the physical printer may differ slightly after updates.',
  ],
};
