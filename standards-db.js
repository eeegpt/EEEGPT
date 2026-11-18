/* =========================================================
   EEEGPT STANDARDS DATABASE (BNBC 2020 • RSC • NFPA • IEC)
========================================================= */

const DEFAULT_STANDARDS_DB = [
  // ================= BNBC 2020 =================
  {
    id: 'bnbc_sub_area',
    standard: 'BNBC',
    topic: 'Substation',
    title: 'Substation & Transformer Room Minimum Area',
    clause: 'BNBC 2020 • Part VIII, Chapter 1, Table 8.1.23',
    limits: '1×150 kVA: 45 m² | 1×250/400 kVA: 48 m² | 2×250/400 kVA: 100 m² | 3×400 kVA: 135 m²',
    summary: 'ট্রান্সফরমার, HT প্যানেল এবং LT প্যানেলসহ সাবস্টেশন রুমের জন্য ক্যাপাসিটি অনুযায়ী ন্যূনতম ফ্লোর এরিয়া নির্ধারিত আছে (যেমন 1×400 kVA-এর জন্য ট্রান্সফরমার জোন 13 m² এবং মোট সাবস্টেশন 48 m²)।',
    auditCheck: 'সাবস্টেশনের মাপ Table 8.1.23 অনুযায়ী আছে কি না এবং ডাবল-লিফ/সরাসরি গেট আছে কি না যাচাই করুন।',
    keywords: 'substation transformer room area size space ht lt panel সাবস্টেশন ট্রান্সফরমার'
  },
  {
    id: 'bnbc_gen_area',
    standard: 'BNBC',
    topic: 'Generator',
    title: 'Standby Generator Room Minimum Area',
    clause: 'BNBC 2020 • Part VIII, Chapter 1, Table 8.1.24',
    limits: '25 kW: 20 m² | 48 kW: 24 m² | 100 kW: 30 m² | 150 kW: 36 m² | 300 kW: 48 m² | 500 kW: 56 m²',
    summary: 'স্ট্যান্ডবাই ডিজেল বা গ্যাস জেনারেটর রুমের জন্য ক্যাপাসিটি অনুসারে পর্যাপ্ত বাতাস চলাচল, এক্সহস্ট এবং মেইনটেন্যান্স স্পেসসহ ন্যূনতম রুম এরিয়া নিশ্চিত করতে হবে।',
    auditCheck: 'জেনারেটর রুমের ভেন্টিলেশন, অ্যাকোস্টিক ট্রিটমেন্ট এবং ডেইলি ফুয়েল ট্যাংকের নিরাপত্তা দেখুন।',
    keywords: 'generator standby room area ventilation exhaust জেনারেটর'
  },
  {
    id: 'bnbc_ecc_size',
    standard: 'BNBC',
    topic: 'Earthing',
    title: 'Minimum Cross-Sectional Area of Copper ECC',
    clause: 'BNBC 2020 • Part VIII, Chapter 1, Table 8.1.26',
    limits: 'Phase ≤ 16 mm² → ECC = Phase | 16 < Phase ≤ 35 mm² → 16 mm² | Phase > 35 mm² → Phase / 2',
    summary: 'সার্কিটের ফেজ কন্ডাক্টরের সাইজ অনুযায়ী কপার আর্থ কন্টিনিউটি কন্ডাক্টর (ECC)-এর ন্যূনতম সাইজ নির্ধারণ করতে হবে।',
    auditCheck: 'প্রতিটি প্যানেল, মেশিন ও DB-তে ফেজ ক্যাবলের তুলনায় ECC সাইজ Table 8.1.26 অনুযায়ী সঠিক আছে কি না মাপুন।',
    keywords: 'earthing ecc earth continuity conductor ground cable size আর্থিং'
  },
  {
    id: 'bnbc_earth_electrode',
    standard: 'BNBC',
    topic: 'Earthing',
    title: 'Earth Electrode Specifications & Pit Construction',
    clause: 'BNBC 2020 • Part VIII, Chapter 1, Sec 1.3.15 & Sec 1.3.32',
    limits: 'Cu Rod: ≥ 12.5 mm dia × 3.33 m | Cu Plate: ≥ 600×600×6 mm | GI Pipe: ≥ 38 mm dia × 6.5 m',
    summary: 'আর্থিং সিস্টেমে আর্থ ইলেকট্রোড, আর্থ লিড, আর্থ বাসবার এবং ক্লাম্প থাকতে হবে। একাধিক ইলেকট্রোড থাকলে আর্থ লিড দিয়ে ইন্টারকানেক্ট করতে হবে।',
    auditCheck: 'আর্থ পিট ইনস্পেকশন চেম্বার (600×600×600 mm), টেস্ট লিংক ও আর্থ রেজিস্ট্যান্স রেকর্ড দেখুন।',
    keywords: 'earthing electrode copper rod plate gi pipe pit আর্থিং পিট'
  },
  {
    id: 'bnbc_color_code',
    standard: 'BNBC',
    topic: 'Cable',
    title: 'Standard Wiring & Cable Color Code',
    clause: 'BNBC 2020 • Part VIII, Chapter 1 (Cable Color Identification)',
    limits: '3-Phase: L1 Red, L2 Yellow, L3 Blue | Neutral: Black | ECC/Earth: Green + Yellow Bi-colour',
    summary: 'সিঙ্গেল ফেজে লাল (Live), কালো (Neutral) এবং সবুজ-হলুদ (ECC); থ্রি-ফেজে লাল, হলুদ, নীল (L1, L2, L3), কালো (Neutral) ও সবুজ-হলুদ (ECC) ব্যবহার করতে হবে।',
    auditCheck: 'DB ও মেইন প্যানেলের ভেতর ইনকামিং ও আউটগোয়িং ফেজ, নিউট্রাল ও ECC কালার কোড বা স্লিভিং ঠিক আছে কি না দেখুন।',
    keywords: 'cable color code red yellow blue black green phase neutral panel ক্যাবল কালার'
  },
  {
    id: 'bnbc_cable_segregation',
    standard: 'BNBC',
    topic: 'Cable',
    title: 'Segregation of Power & Communication (ELV) Cables',
    clause: 'BNBC 2020 • Part VIII, Chapter 1, Sec 1.3.14 (f)',
    limits: 'Power & ELV/Communication cables must run in separate conduits/trays',
    summary: 'পাওয়ার ক্যাবল এবং কমিউনিকেশন/ডেটা/ফায়ার অ্যালার্ম (ELV) ক্যাবল একসাথে একই কনডুইট বা ট্রেতে নেওয়া যাবে না—আলাদাভাবে রাউটিং করতে হবে।',
    auditCheck: 'রাইজার, ট্রে বা ফলস সিলিংয়ে পাওয়ার ক্যাবলের সাথে ইন্টারনেট/সিসিটিভি/ফায়ার ক্যাবল মিশে আছে কি না দেখুন।',
    keywords: 'cable segregation power communication elv tray conduit ক্যাবল'
  },
  {
    id: 'bnbc_circuit_sep',
    standard: 'BNBC',
    topic: 'Panel',
    title: 'Separation of Light/Fan & Power Socket Circuits',
    clause: 'BNBC 2020 • Part VIII, Chapter 1, Sec 1.3.10 & 1.3.6',
    limits: 'Light/Fan circuits must NOT be mixed with Socket circuits • Load Schedule mandatory',
    summary: 'লাইট ও ফ্যানের ব্রাঞ্চ সার্কিট কখনোই পাওয়ার সকেট সার্কিটের সাথে মেশানো যাবে না। প্রতিটি প্যানেল/DB-তে লেআউট ও লোড শিডিউল থাকতে হবে।',
    auditCheck: 'SDB/DB-এর ভেতর লাইট এবং সকেটের জন্য আলাদা MCB আছে কি না এবং ডোরের ভেতর আপডেটেড লোড শিডিউল আছে কি না দেখুন।',
    keywords: 'panel db sdb mdb light fan socket circuit load schedule প্যানেল সার্কিট'
  },
  {
    id: 'bnbc_al_ban_diversity',
    standard: 'BNBC',
    topic: 'Cable',
    title: 'Aluminium Cable Restriction & Residential Diversity',
    clause: 'BNBC 2020 • Part VIII, Sec 2.6.2 & Sec 2.7.1.1',
    limits: 'Aluminium prohibited in internal branch wiring • Residential Max Demand Diversity: 75%',
    summary: 'ভবনের অভ্যন্তরীণ ফাইনাল ব্রাঞ্চ সার্কিটে অ্যালুমিনিয়াম তার ব্যবহার সম্পূর্ণ নিষিদ্ধ (কপার বাধ্যতামূলক)। আবাসিক ম্যাক্সিমাম ডিমান্ডে 75% ডাইভার্সিটি ফ্যাক্টর প্রযোজ্য।',
    auditCheck: 'অভ্যন্তরীণ সাব-সার্কিটে অ্যালুমিনিয়াম তার বা কপার-অ্যালুমিনিয়াম জয়েন্টে বাই-মেটালিক লাগ ছাড়া টার্মিনেশন আছে কি না দেখুন।',
    keywords: 'aluminium copper branch wiring diversity demand load অ্যালুমিনিয়াম'
  },

  // ================= RSC GUIDELINES =================
  {
    id: 'rsc_sub_loc',
    standard: 'RSC',
    topic: 'Substation',
    title: 'Substation Capacity (70% Load Factor) & Location',
    clause: 'RSC Technical Guidelines • Part 10, Sec 10.5.1 & 10.5.2',
    limits: 'Load Factor: 70% • Avoid Basement • Direct Street Access • Flood Protection',
    summary: 'নতুন ও অন্তর্বর্তী ভবনে সাবস্টেশনের ক্যাপাসিটি নির্ধারণে ৭০% লোড ফ্যাক্টর প্রযোজ্য। সাবস্টেশন বেজমেন্টে না রেখে নিচতলায় (রাস্তা থেকে সরাসরি প্রবেশযোগ্য) রাখতে হবে এবং বৃষ্টির পানি ঢোকা রোধের ব্যবস্থা থাকতে হবে।',
    auditCheck: 'সাবস্টেশন ফ্লোরের উচ্চতা (বন্যা লেভেলের উপরে), সরাসরি এক্সিট এবং অয়েল পিট/বাফেল ওয়াল পরীক্ষা করুন।',
    keywords: 'substation transformer basement flood access load factor সাবস্টেশন'
  },
  {
    id: 'rsc_sub_clearance',
    standard: 'RSC',
    topic: 'Substation',
    title: 'Substation Working Clearance & No-Storage Rule',
    clause: 'RSC Technical Guidelines • Part 10, Sec 10.5.3 & 10.5',
    limits: 'Minimum Working Clearance: 1.07 m (3 ft 6 in) • Zero Storage Inside Substation',
    summary: 'সাবস্টেশন ইকুইপমেন্টের চারপাশে নিরাপদ অপারেশন ও মেইনটেন্যান্সের জন্য কমপক্ষে 1.07 মিটার (3.5 ফিট) ফাঁকা জায়গা রাখতে হবে। সাবস্টেশন রুমে কোনো মালামাল বা ডাম্পিং রাখা যাবে না।',
    auditCheck: 'HT/LT প্যানেল ও ট্রান্সফরমারের সামনে কোনো কার্টন, তেলের ড্রাম বা ময়লা রাখা আছে কি না এবং ৩.৫ ফিট ক্লিয়ারেন্স আছে কি না মাপুন।',
    keywords: 'substation clearance storage working space lt ht panel সাবস্টেশন'
  },
  {
    id: 'rsc_panel_earthing',
    standard: 'RSC',
    topic: 'Panel',
    title: 'Panel Enclosure Earthing & Earth Bar Insulation',
    clause: 'RSC Technical Guidelines • Part 10, Sec 10.10.3 & Audit Finding E-14',
    limits: 'All metal panel bodies bonded to earth • Correct ECC per BNBC Table 8.1.26',
    summary: 'সকল মেটাল প্যানেল বডি, ডোর ও ইকুইপমেন্ট সঠিকভাবে আর্থিং-এর সাথে যুক্ত থাকতে হবে। আর্থিং বাসবার বডির সাথে বন্ডেড থাকবে (ইন্সুলেটরের ওপর আর্থ বার বসিয়ে মেটাল বডিকে আর্থহীন রাখা যাবে না)।',
    auditCheck: 'প্যানেলের ডোর আর্থিং স্ট্র্যাপ, বডি আর্থিং, এবং ইনকামিং/আউটগোয়িং ECC সাইজ চেক করুন।',
    keywords: 'panel earthing body insulator busbar db mdb প্যানেল আর্থিং'
  },
  {
    id: 'rsc_wiring_trench',
    standard: 'RSC',
    topic: 'Cable',
    title: 'Horizontal/Vertical Wiring & 600mm Trench Depth',
    clause: 'RSC Technical Guidelines • Part 10, Sec 10.3.2',
    limits: 'No diagonal wiring • Underground Trench Depth: 600 mm (24 in) • GI/PVC encasing',
    summary: 'সারফেস বা কনসিল্ড ওয়্যারিং কেবল অনুভূমিক বা উল্লম্বভাবে নিতে হবে—কোনাকুনি নয়। আন্ডারগ্রাউন্ড ক্যাবল GI বা PVC পাইপে 600 mm (24 ইঞ্চি) গভীর ট্রেঞ্চে বসাতে হবে।',
    auditCheck: 'ফ্লোর/সিলিং ও মেশিন কানেকশনে তার খোলা ঝুলছে কি না (স্টিল পাইপ বা ট্রে ছাড়া) এবং ট্রেঞ্চ কভার ঠিক আছে কি না দেখুন।',
    keywords: 'cable wiring trench depth 600mm conduit tray machine ক্যাবল ট্রেঞ্চ'
  },
  {
    id: 'rsc_fire_sealing',
    standard: 'RSC',
    topic: 'Panel',
    title: 'Fire Sealing of Electrical Shafts, Bus Ducts & Penetrations',
    clause: 'RSC Technical Guidelines • Part 10, Sec 10.4.3',
    limits: 'Non-combustible fire-rated sealing mandatory at all floor & wall penetrations',
    summary: 'ক্যাবল, বাস-বার ট্রাংকিং বা কনডুইট এক ফ্লোর থেকে অন্য ফ্লোরে বা ফায়ার-রেটেড ওয়াল ভেদ করে গেলে ফাঁকা অংশ অদাহ্য ফায়ার-স্টপ ম্যাটেরিয়াল দিয়ে সিল করতে হবে, যাতে আগুন বা গলিত PVC নিচে না পড়ে।',
    auditCheck: 'ইলেকট্রিক্যাল শ্যাফট/রাইজার ও বিবিটি (BBT) ফ্লোর ক্রসিংয়ে ফায়ার-স্টপ সিলিং আছে কি না দেখুন।',
    keywords: 'fire stop sealing shaft bus duct bbt riser penetration প্যানেল ফায়ার'
  },
  {
    id: 'rsc_circuit_50pct',
    standard: 'RSC',
    topic: 'Panel',
    title: '50% Multi-Outlet Circuit Limit & No Common Neutral',
    clause: 'RSC Technical Guidelines • Part 10, Sec 10.3.1',
    limits: 'Max 50% capacity on multi-outlet circuits • Common neutral strictly prohibited',
    summary: 'একাধিক আউটলেটযুক্ত সার্কিটকে তার ক্যাপাসিটির ৫০%-এর বেশি লোড দেওয়া যাবে না। একাধিক সার্কিটের জন্য কমন নিউট্রাল ব্যবহার সম্পূর্ণ নিষিদ্ধ।',
    auditCheck: 'প্যানেলের নিউট্রাল লিংকে দুটি ভিন্ন ব্রেকারের সার্কিট একই নিউট্রাল শেয়ার করছে কি না চেক করুন।',
    keywords: 'common neutral circuit load 50% outlet panel ব্রেকার নিউট্রাল'
  },
  {
    id: 'rsc_lps_bonding',
    standard: 'RSC',
    topic: 'LPS',
    title: 'Lightning Protection System (LPS) & Metalwork Bonding',
    clause: 'RSC Technical Guidelines • Part 10, Sec 10.11',
    limits: 'Per BNBC / NFPA 780 / IEC 62305 • Bond all rooftop/external metal • As-Built LPS Drawing',
    summary: 'বিল্ডিংয়ের ছাদের চিলেকোঠা, চিমনি, সোলার/চিলার মেটাল স্ট্রাকচারকে LPS কন্ডাক্টরের সাথে সমান সাইজের বন্ডিং তার দিয়ে যুক্ত করতে হবে এবং অনুমোদিত As-Built LPS ড্রয়িং থাকতে হবে।',
    auditCheck: 'ছাদের মেটাল ফ্রেম বন্ডিং, ডাউন কন্ডাক্টর টেস্ট জয়েন্ট এবং LPS রিস্ক অ্যাসেসমেন্ট রিপোর্ট দেখুন।',
    keywords: 'lps lightning protection bonding rooftop drawing বজ্রপাত'
  },
  {
    id: 'rsc_cpr_sld_doc',
    standard: 'RSC',
    topic: 'Panel',
    title: 'CPR Instruction Chart, SLD & Panel Labeling',
    clause: 'RSC Electrical Safety Audit Standard (Findings E-12 / Doc)',
    limits: 'CPR Chart at all LT/MDB/FDB/DB • Updated As-Built SLD • Legible Breaker Ratings',
    summary: 'সকল LT প্যানেল, MDB, FDB, DB ও SDB-এর পাশে দৃশ্যমান স্থানে CPR ও ইলেকট্রিক শক ট্রিটমেন্ট চার্ট টাঙানো থাকতে হবে। আপডেটেড SLD ও সার্কিট লেবেলিং বাধ্যতামূলক।',
    auditCheck: 'প্যানেলের সামনে ইনসুলেটিং রাবার ম্যাট, ডেঞ্জার সাইন, CPR চার্ট এবং থার্মোগ্রাফি রিপোর্ট আছে কি না দেখুন।',
    keywords: 'panel cpr sld rubber mat labeling thermography প্যানেল চার্ট'
  },

  // ================= NFPA =================
  {
    id: 'nfpa_110_26',
    standard: 'NFPA',
    topic: 'Panel',
    title: 'Working Clearance & Dedicated Electrical Space Around Panels',
    clause: 'NFPA 70 (NEC) • Article 110.26',
    limits: 'Min Depth: 3 ft to 4 ft (by voltage) • Width: ≥ 30 in • Height: 6.5 ft • Dedicated Space: 6 ft above',
    summary: 'প্যানেল বোর্ডের সামনে কমপক্ষে ৩–৪ ফিট ক্লিয়ার ওয়ার্কিং স্পেস রাখতে হবে (কোনো মালামাল রাখা যাবে না)। প্যানেলের ঠিক উপরে ৬ ফিট বা স্ট্রাকচারাল সিলিং পর্যন্ত পানির পাইপ বা এসি ডাক্ট নেওয়া নিষিদ্ধ। 1200 A+ রুমে ২টি এক্সিট বা ডাবল স্পেস লাগবে।',
    auditCheck: 'প্যানেলের ঠিক ওপরে ফায়ার স্প্রিংকলার বা পানির পাইপ আছে কি না (থাকলে ড্রিপ শিল্ড আছে কি না) এবং সামনে ৩ ফিট ফাঁকা আছে কি না দেখুন।',
    keywords: 'panel clearance working space dedicated 110.26 pipe exit প্যানেল ক্লিয়ারেন্স'
  },
  {
    id: 'nfpa_125_rule',
    standard: 'NFPA',
    topic: 'Cable',
    title: '125% Continuous Load & Motor Conductor Sizing Rule',
    clause: 'NFPA 70 (NEC) • Article 210.20 & Article 430.22',
    limits: 'Minimum Conductor & OCPD Rating ≥ 125% of Continuous Load / Motor FLC',
    summary: 'টানা ৩ ঘণ্টা বা তার বেশি সময় চলা কন্টিনিউয়াস লোড এবং সিঙ্গেল মোটরের জন্য ক্যাবল ও প্রোটেকশন ডিভাইস লোডের ফুল-লোড কারেন্টের (FLC) কমপক্ষে ১২৫% ধরে সাইজ করতে হবে।',
    auditCheck: 'মেশিন ও মোটর ফিডারের ক্যাবল কারেন্ট ক্যারিং ক্যাপাসিটি মোটরের 1.25×FLC-এর সমান বা বেশি কি না হিসাব করুন।',
    keywords: 'motor 125% continuous load cable breaker nec মোটর ক্যাবল'
  },
  {
    id: 'nfpa_70e_arcflash',
    standard: 'NFPA',
    topic: 'Substation',
    title: 'Arc Flash Hazard Categories, Boundary & PPE Labeling',
    clause: 'NFPA 70E • Electrical Safety in the Workplace',
    limits: 'Arc Flash Boundary: 1.2 cal/cm² • PPE Cat 1: 4 | Cat 2: 8 | Cat 3: 25 | Cat 4: 40 cal/cm²',
    summary: 'সাবস্টেশন, LT/HT প্যানেল ও MCC-তে আর্ক ফ্ল্যাশ অ্যানালাইসিস অনুযায়ী ইনসিডেন্ট এনার্জি, ওয়ার্কিং ডিস্ট্যান্স এবং প্রয়োজনীয় PPE ক্যাটাগরির লেবেল লাগাতে হবে।',
    auditCheck: 'মেইন প্যানেলে আর্ক-ফ্ল্যাশ ওয়ার্নিং স্টিকার এবং অপারেটরের জন্য রেটেড গ্লাভস/স্যুট ও ইনসুলেটিং টুলস আছে কি না দেখুন।',
    keywords: 'substation panel arc flash ppe boundary nfpa 70e সাবস্টেশন প্যানেল'
  },
  {
    id: 'nfpa_780_lps',
    standard: 'NFPA',
    topic: 'LPS',
    title: 'Lightning Down Conductors & Perimeter Spacing',
    clause: 'NFPA 780 • Standard for Installation of Lightning Protection Systems',
    limits: 'Minimum 2 Down Conductors • Average Perimeter Spacing ≤ 30 m (100 ft)',
    summary: 'যেকোনো ভবনে কমপক্ষে ২টি ডাউন কন্ডাক্টর থাকতে হবে এবং ভবনের চারপাশের পেরিমিটার বরাবর ডাউন কন্ডাক্টরগুলোর গড় দূরত্ব ৩০ মিটারের বেশি হওয়া যাবে না।',
    auditCheck: 'ডাউন কন্ডাক্টরের সংখ্যা, দূরত্ব এবং প্রতিটি ডাউন কন্ডাক্টরের নিচে ডেডিকেটেড আর্থ পিট আছে কি না দেখুন।',
    keywords: 'lps lightning down conductor spacing nfpa 780 বজ্রপাত'
  },

  // ================= IEC =================
  {
    id: 'iec_62305_lps',
    standard: 'IEC',
    topic: 'LPS',
    title: 'LPS Classes (I–IV), Rolling Sphere Radius & Mesh Size',
    clause: 'IEC 62305-2 & IEC 62305-3',
    limits: 'Rolling Sphere: I=20m, II=30m, III=45m, IV=60m | Mesh: I=5×5m, II=10×10m, III=15×15m, IV=20×20m',
    summary: 'রিস্ক অ্যাসেসমেন্ট (IEC 62305-2) করে বিল্ডিংয়ের LPS ক্লাস নির্ধারণ করতে হয়। রোলিং স্ফিয়ার ও মেশ সাইজ ক্লাস অনুযায়ী নির্ধারিত হয় (ফ্যাক্টরিতে সাধারণত Class I বা II)।',
    auditCheck: 'ছাদের এয়ার টার্মিনাল/মেশ গ্রিড নির্ধারিত রোলিং স্ফিয়ার ব্যাসার্ধ অনুযায়ী পুরো ভবন কভার করছে কি না দেখুন।',
    keywords: 'lps lightning rolling sphere mesh class iec 62305 বজ্রপাত'
  },
  {
    id: 'iec_rcd_30ma',
    standard: 'IEC',
    topic: 'Panel',
    title: 'RCD / RCCB / RCBO Protection (30 mA Life Safety)',
    clause: 'IEC 60364-4-41 & IEC 60755',
    limits: 'Rated Residual Operating Current IΔn ≤ 30 mA for Sockets & Wet/Portable Loads',
    summary: 'মানুষের প্রাণরক্ষার (Direct/Indirect Contact) জন্য সকেট আউটলেট, বাথরুম, পোর্টেবল মেশিন ও ভেজা পরিবেশের সার্কিটে সর্বোচ্চ ৩০ মিলি-অ্যাম্পিয়ার (30 mA) সংবেদনশীল RCD/RCCB/RCBO ব্যবহার বাধ্যতামূলক।',
    auditCheck: 'সকেট, ড্রিঙ্কিং ওয়াটার কুলার এবং পোর্টেবল ইকুইপমেন্টের DB-তে 30 mA RCCB আছে কি না এবং টেস্ট বাটনে কাজ করে কি না দেখুন।',
    keywords: 'rcd rccb rcbo elcb 30ma shock protection panel প্যানেল ব্রেকার'
  },
  {
    id: 'iec_coordination',
    standard: 'IEC',
    topic: 'Cable',
    title: 'Overcurrent & Cable Thermal Coordination Rule',
    clause: 'IEC 60364-4-43',
    limits: 'Coordination Formula: Ib ≤ In ≤ Iz (Load Current ≤ Breaker Rating ≤ Cable Ampacity)',
    summary: 'সার্কিটের নিরাপত্তা নিশ্চিত করতে ব্রেকারের নমিনাল রেটিং (In) অবশ্যই ডিজাইন লোড কারেন্ট (Ib)-এর চেয়ে বেশি বা সমান এবং ডিরেটেড ক্যাবলের কারেন্ট ক্যারিং ক্যাপাসিটি (Iz)-এর চেয়ে কম বা সমান হতে হবে।',
    auditCheck: 'প্যানেলের ভেতর বড় ব্রেকারের নিচে চিকন তার লাগানো আছে কি না (In > Iz ভায়োলেশন) তা পরীক্ষা করুন।',
    keywords: 'breaker cable coordination ib in iz overcurrent প্যানেল ক্যাবল ব্রেকার'
  },
  {
    id: 'iec_61439_panel',
    standard: 'IEC',
    topic: 'Panel',
    title: 'Low-Voltage Switchgear & Controlgear Assembly',
    clause: 'IEC 61439-1 & IEC 61439-2',
    limits: 'IP Protection • Short-Circuit Withstand • Busbar Clearance & Creepage • Neutral/Earth Terminals',
    summary: 'মেইন LT ও সাব-ডিস্ট্রিবিউশন প্যানেল টাইপ-টেস্টেড বা ডিজাইন ভেরিফায়েড হতে হবে। বাসবার ক্লিয়ারেন্স, IP রেটিং (ধুলো/পানি রোধ), শর্ট-সার্কিট ক্ষমতা (Icu) এবং অভ্যন্তরীণ কভারিং/শ্রাউডিং থাকতে হবে।',
    auditCheck: 'লাইভ বাসবারের সামনে পলিকার্্বনেট (Acrylic/Perspex) প্রোটেক্টিভ শিল্ড আছে কি না এবং অব্যবহৃত হোলগুলো ব্লাঙ্কিং প্লেট দিয়ে বন্ধ কি না দেখুন।',
   keywords: 'panel switchgear lt mdb busbar ip shroud iec 61439 substation প্যানেল সাবস্টেশন'
  }
];