import type { TrainingContent } from "./types";

const en: TrainingContent = {
  label: "English",
  ui: {
    heroKicker: "Warehouse Operations",
    heroTitle: "Packer SOP Training & Assessment",
    heroSubtitle:
      "Read the packing SOP, then answer the questions. A 100% score is required to pass and you get only 3 attempts.",
    sopSections: "SOP sections",
    passMark: "Pass mark",
    warehouses: "warehouses",
    stepDetails: "Details",
    stepSop: "SOP",
    stepQuiz: "Assessment",
    stepResult: "Score",
    detailsTitle: "Packer details",
    detailsSubtitle: "Fill this once before starting the SOP training.",
    packerName: "Packer name",
    employeeCode: "Employee code",
    warehouse: "Warehouse",
    selectWarehouse: "Select warehouse",
    shift: "Shift",
    firstShift: "First Shift",
    secondShift: "Second Shift",
    nightShift: "Night Shift",
    language: "Training language",
    startTraining: "Start SOP training",
    readSopStart: "I have read the SOP — start assessment",
    back: "Back",
    answered: "answered",
    of: "of",
    answerAll: "Answer all questions",
    submit: "Submit assessment",
    submitting: "Submitting…",
    passed: "Training passed",
    failed: "Needs retraining",
    correctCount: "correct",
    correctAnswer: "Correct answer",
    tryAgain: "Try again",
    attemptsLeft: "attempts left",
    noAttemptsLeft: "You have used all 3 attempts. Your trainer has been notified.",
    flaggedNotice:
      "This employee is flagged for retraining — all 3 attempts are over without a 100% score.",
    attemptLabel: "Attempt",
    checkingAttempts: "Checking your attempts…",
    newPacker: "Train next packer",
    saveError: "Could not save your assessment. Please try again.",
    perfectRequired: "All answers must be correct (100%) to pass.",
  },
  sop: [
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
        "Wrap each product with minimum 2-3 layers of Hexa Roll — more for fragile items.",
        "Cover all sides completely and secure the wrap with tape.",
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
  ],
  questions: [
    {
      q: "During pre-pack checks you find a product that is leaking. What do you do?",
      options: [
        "Wipe it and pack it with extra wrap",
        "Reject the product and do not pack it",
        "Pack it upright so it stops leaking",
        "Pack it and mention it on the label",
      ],
    },
    {
      q: "Before packing a pump bottle, what is mandatory?",
      options: [
        "Remove the pump and pack it separately",
        "Tape the pump nozzle and wrap with 2 layers of Hexa Roll + void fill",
        "Only place a fragile sticker on the box",
        "Wrap the bottle in shredded paper only",
      ],
    },
    {
      q: "How must perfumes, serums and oils be packed?",
      options: [
        "Perfume with 1 layer near the box edge; serum without wrap if the cap is tight",
        "Perfume: 3 layers Hexa Roll + extra void fill in the centre of the box; serum/oil: cap taped, 2 layers Hexa Roll, packed upright",
        "Both lying flat in the same wrap without void fill",
        "Both only in a poly bag",
      ],
    },
    {
      q: "What is the minimum wrapping standard for each product?",
      options: [
        "1 layer of Hexa Roll",
        "2-3 layers of Hexa Roll covering all sides, secured with tape",
        "A single sheet of shredded paper",
        "Wrapping is needed only for glass",
      ],
    },
    {
      q: "You shake the packed box and the products move. What does it mean?",
      options: [
        "It is normal, seal the box",
        "Void fill is insufficient — add shredded paper or air cushions",
        "Use a bigger box without void fill",
        "Add more tape outside",
      ],
    },
    {
      q: "What should you use to fill the empty spaces inside the box?",
      options: ["Leave the spaces empty", "Shredded paper or air cushions", "Water", "Nothing, only extra tape outside"],
    },
    {
      q: "Correct arrangement of products inside the box is:",
      options: [
        "Heavy items at the bottom, fragile and glass in the centre or top",
        "Glass at the bottom, heavy items on top",
        "Glass bottles pressed against the box edges",
        "Any order as long as the box closes",
      ],
    },
    {
      q: "How should shredded paper be filled inside the box?",
      options: [
        "Only at the bottom of the box",
        "Only on top of the products",
        "At both the bottom and the top, so products are cushioned on all sides",
        "Only in the corners if space is left",
      ],
    },
    {
      q: "What is the correct packaging standard for retailer vs non-retailer (normal B2C) orders?",
      options: [
        "Retailer boxes: H-type taping on all seams and flaps; B2C boxes: standard single-strip tape seal with Purplle tape",
        "Both are sealed the same way with one strip of tape",
        "Retailer: single strip of tape; B2C: H-type taping",
        "Retailer boxes need no tape if the flaps are stapled",
      ],
    },
    {
      q: "How do you identify and bifurcate fragile and non-fragile items?",
      options: [
        "Treat every item as non-fragile",
        "Fragile: glass bottles, perfumes, serums, compacts and palettes — minimum 2 layers of wrap; Non-fragile: tubes, plastic bottles, sachets and cartons — standard wrapping",
        "Only boxes with a fragile sticker are fragile",
        "Fragile items are packed together with heavy items without wrap",
      ],
    },
    {
      q: "What is the correct packing golden rule sequence?",
      options: [
        "Wrap -> Seal -> Dispatch -> Verify -> Cushion",
        "Seal -> Wrap -> Cushion -> Verify -> Dispatch",
        "Cushion -> Verify -> Wrap -> Seal -> Dispatch",
        "Verify -> Dispatch -> Wrap -> Cushion -> Seal",
      ],
    },
  ],
};

export default en;
