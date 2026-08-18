export type Warehouse = {
  code: string;
  short: string;
  city: string;
};

export const WAREHOUSES: Warehouse[] = [
  { code: "2", short: "MUM", city: "Mumbai" },
  { code: "4", short: "GGN", city: "Gurugram" },
  { code: "10", short: "BLR", city: "Bengaluru" },
  { code: "12", short: "CCU", city: "Kolkata" },
  { code: "16", short: "GAU", city: "Guwahati" },
  { code: "21", short: "LOK", city: "Lucknow" },
  { code: "25", short: "MAA", city: "Chennai" },
  { code: "28", short: "HYD", city: "Hyderabad" },
  { code: "29", short: "COK", city: "Kochi" },
  { code: "40", short: "VGA", city: "Vijayawada" },
  { code: "42", short: "CJB", city: "Coimbatore" },
  { code: "45", short: "PAT", city: "Patna" },
  { code: "47", short: "BBI", city: "Bhubaneswar" },
];

export const warehouseByCode = (code: string) =>
  WAREHOUSES.find((w) => w.code === code);

export type SopSection = {
  title: string;
  points: string[];
};

export const SOP_SECTIONS: SopSection[] = [
  {
    title: "1. Pre-pack checks (before packing)",
    points: [
      "Verify the correct SKU and quantity against the order.",
      "Check the product for damage, cracks, leakage or missing parts.",
      "Ensure cap, lid and pump are tight; tape pump nozzles and check the inner stopper where applicable.",
      "Every product must be cleaned, dry and within the approved remaining shelf life.",
      "Reject any leaking, damaged or near-expiry product.",
    ],
  },
  {
    title: "2. Product-specific packaging guide",
    points: [
      "Glass bottles: 2-3 layers Hexa Roll + void fill, wrapped completely and kept away from box edges.",
      "Pump bottles: tape the pump nozzle + 2 layers Hexa Roll + void fill so the pump cannot move.",
      "Serums / oils: tape the cap + 2 layers Hexa Roll, always placed upright.",
      "Perfumes: 3 layers Hexa Roll + extra void fill, placed in the centre of the box.",
      "Compacts / palettes: Hexa Roll and never place heavy items on top.",
      "Lipstick / mascara / small items: standard wrap + void fill, kept organised inside the box.",
    ],
  },
  {
    title: "3. Wrap with care & void fill",
    points: [
      "Identify fragile items (glass bottles, perfumes, serums, compacts, palettes) and non-fragile items (tubes, plastic bottles, sachets, cartons) before wrapping.",
      "Wrap each product with minimum 2-3 layers of Hexa Roll — more for fragile items; non-fragile items get standard wrapping.",
      "Cover all sides completely and secure the wrap with tape.",
      "Fill shredded paper at both the bottom and the top of the box so products are cushioned on all sides.",
      "Fill all empty spaces with shredded paper or air cushions.",
      "The product must not move when the box is shaken.",
      "Maintain minimum 2-3 cm cushioning from the box walls.",
    ],
  },
  {
    title: "4. Arrange, seal & close",
    points: [
      "Heavy items at the bottom; fragile and glass items in the centre or top.",
      "Keep products upright wherever possible and maintain a gap from box edges.",
      "Close the box with strong packaging tape and seal all flaps in the H-pattern.",
      "Retailer / B2B boxes: seal with H-type taping on all seams and flaps; normal B2C boxes: standard single-strip seal with Purplle tape.",
      "The box must be intact — not bulging or over-packed.",
      "Never use old, torn or weak boxes.",
    ],
  },
  {
    title: "5. Final quality check & special guidelines",
    points: [
      "Confirm SKU and quantity, no leakage or damage, pump taped, product cleaned, void fill added, box sealed and label correct and visible.",
      "High damage / high risk SKUs: 2-3 layers Hexa Roll + extra void fill is mandatory.",
      "Pack liquid products upright to avoid leakage; do not expose products to extreme heat or moisture.",
      "Use good quality packaging material — Hexa Roll, shredded paper, air cushions, corrugated box, packaging tape.",
      "Golden rule: SEAL -> WRAP -> CUSHION -> VERIFY -> DISPATCH.",
    ],
  },
];

export type Question = {
  id: string;
  q: string;
  options: string[];
  answer: number;
  section: string;
};

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    section: "Pre-pack checks",
    q: "During pre-pack checks you find a product that is leaking. What do you do?",
    options: [
      "Wipe it and pack it with extra wrap",
      "Reject the product and do not pack it",
      "Pack it upright so it stops leaking",
      "Pack it and mention it on the label",
    ],
    answer: 1,
  },
  {
    id: "q2",
    section: "Pre-pack checks",
    q: "Before packing a pump bottle, what is mandatory?",
    options: [
      "Remove the pump and pack it separately",
      "Tape the pump nozzle and wrap with 2 layers of Hexa Roll + void fill",
      "Only place a fragile sticker on the box",
      "Wrap the bottle in shredded paper only",
    ],
    answer: 1,
  },
  {
    id: "q3",
    section: "Product-specific packaging",
    q: "How must perfumes, serums and oils be packed?",
    options: [
      "Perfume with 1 layer near the box edge; serum without wrap if the cap is tight",
      "Perfume: 3 layers Hexa Roll + extra void fill in the centre of the box; serum/oil: cap taped, 2 layers Hexa Roll, packed upright",
      "Both lying flat in the same wrap without void fill",
      "Both only in a poly bag",
    ],
    answer: 1,
  },
  {
    id: "q4",
    section: "Wrapping",
    q: "What is the minimum wrapping standard for each product?",
    options: [
      "1 layer of Hexa Roll",
      "2-3 layers of Hexa Roll covering all sides, secured with tape",
      "A single sheet of shredded paper",
      "Wrapping is needed only for glass",
    ],
    answer: 1,
  },
  {
    id: "q5",
    section: "Void fill",
    q: "You shake the packed box and the products move. What does it mean?",
    options: [
      "It is normal, seal the box",
      "Void fill is insufficient — add shredded paper or air cushions",
      "Use a bigger box without void fill",
      "Add more tape outside",
    ],
    answer: 1,
  },
  {
    id: "q6",
    section: "Void fill",
    q: "What should you use to fill the empty spaces inside the box?",
    options: [
      "Leave the spaces empty",
      "Shredded paper or air cushions",
      "Water",
      "Nothing, only extra tape outside",
    ],
    answer: 1,
  },
  {
    id: "q7",
    section: "Arrangement",
    q: "Correct arrangement of products inside the box is:",
    options: [
      "Heavy items at the bottom, fragile and glass in the centre or top",
      "Glass at the bottom, heavy items on top",
      "Glass bottles pressed against the box edges",
      "Any order as long as the box closes",
    ],
    answer: 0,
  },
  {
    id: "q8",
    section: "Void fill",
    q: "How should shredded paper be filled inside the box?",
    options: [
      "Only at the bottom of the box",
      "Only on top of the products",
      "At both the bottom and the top, so products are cushioned on all sides",
      "Only in the corners if space is left",
    ],
    answer: 2,
  },
  {
    id: "q9",
    section: "Sealing",
    q: "What is the correct packaging standard for retailer vs non-retailer (normal B2C) orders?",
    options: [
      "Retailer boxes: H-type taping on all seams and flaps; B2C boxes: standard single-strip tape seal with Purplle tape",
      "Both are sealed the same way with one strip of tape",
      "Retailer: single strip of tape; B2C: H-type taping",
      "Retailer boxes need no tape if the flaps are stapled",
    ],
    answer: 0,
  },
  {
    id: "q10",
    section: "Fragile identification",
    q: "How do you identify and bifurcate fragile and non-fragile items?",
    options: [
      "Treat every item as non-fragile",
      "Fragile: glass bottles, perfumes, serums, compacts and palettes — minimum 2 layers of wrap; Non-fragile: tubes, plastic bottles, sachets and cartons — standard wrapping",
      "Only boxes with a fragile sticker are fragile",
      "Fragile items are packed together with heavy items without wrap",
    ],
    answer: 1,
  },
  {
    id: "q11",
    section: "Golden rule",
    q: "What is the correct packing golden rule sequence?",
    options: [
      "Wrap -> Seal -> Dispatch -> Verify -> Cushion",
      "Seal -> Wrap -> Cushion -> Verify -> Dispatch",
      "Cushion -> Verify -> Wrap -> Seal -> Dispatch",
      "Verify -> Dispatch -> Wrap -> Cushion -> Seal",
    ],
    answer: 1,
  },
];

/** A perfect score is mandatory to pass. */
export const PASS_MARK = 100;

/** Maximum assessment attempts allowed per employee code. */
export const MAX_ATTEMPTS = 3;

export const SHIFTS = ["First Shift", "Second Shift", "Night Shift"] as const;
