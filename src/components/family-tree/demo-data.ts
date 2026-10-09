import type { Edge } from "@xyflow/react";
import type { FamilyNode } from "./types";
import { personNode, bondNode, mkEdge } from "./factories";

// ── Default initial tree ──────────────────────────────────────────────
export const initialNodes: FamilyNode[] = [
  personNode("husband", 40, 40, "Husband", "male"),
  personNode("wife", 460, 40, "Wife", "female"),
  bondNode("love", 270, 200, "2005-06-12"),
  personNode("c1", 60, 380, "Child 1", "male"),
  personNode("c2", 260, 380, "Child 2", "female"),
  personNode("c3", 460, 380, "Child 3", "other"),
];

export const initialEdges: Edge[] = [
  mkEdge("husband", "love"),
  mkEdge("wife", "love"),
  mkEdge("love", "c1"),
  mkEdge("love", "c2"),
  mkEdge("love", "c3"),
];

// ── Nepal Shah Dynasty (hardcoded demo) ───────────────────────────────
// Demonstrates: multiple wives, divorce, widowing, adopted children
export const nepalNodes: FamilyNode[] = [
  // Generation 1: King Tribhuvan (Multiple Wives)
  personNode("tribhuvan", 0, 0, "King Tribhuvan", "male"),
  personNode("kanti", 300, 0, "Kanti Rajya Lakshmi", "female"),
  bondNode("bond-tk", 150, 100, "1919-02-27"),
  personNode("ishwari", -300, 0, "Ishwari Rajya Lakshmi", "female"),
  bondNode("bond-ti", -150, 100, "1919-02-27"), // Second wife

  // Generation 2: King Mahendra + wives
  personNode("mahendra", 0, 250, "King Mahendra", "male"),
  personNode("indra", 300, 250, "Indra Rajya Lakshmi", "female"),
  // Indra died in 1950 → widowed
  bondNode("bond-mi", 150, 350, "1940-05-01", "widowed"),
  personNode("ratna", -300, 250, "Queen Ratna", "female"),
  // Second marriage after Indra's death
  bondNode("bond-mr", -150, 350, "1952-12-10"),
  personNode("himalaya", 600, 250, "Prince Himalaya", "male"),

  // Generation 3: King Birendra, Prince Gyanendra, and siblings
  personNode("birendra", 0, 500, "King Birendra", "male"),
  personNode("aishwarya", 300, 500, "Queen Aishwarya", "female"),
  bondNode("bond-ba", 150, 600, "1970-02-27"),

  personNode("gyanendra", 600, 500, "King Gyanendra", "male"),
  personNode("komal", 900, 500, "Queen Komal", "female"),
  bondNode("bond-gk", 750, 600, "1970-05-01"),

  // Prince Dhirendra — divorced from his wife
  personNode("dhirendra", 1100, 500, "Prince Dhirendra", "male"),
  personNode("prekshya", 1400, 500, "Prekshya Rajya Lakshmi", "female"),
  bondNode("bond-dp", 1250, 600, "1982-01-01", "divorced"),

  // Generation 4: Birendra's children
  personNode("dipendra", 0, 750, "Crown Prince Dipendra", "male"),
  personNode("shruti", 300, 750, "Princess Shruti", "female"),
  personNode("nirajan", 500, 750, "Prince Nirajan", "male"),

  // Kumar Khadga (Shruti's husband)
  personNode("kumar", 300, 750, "Kumar Khadga", "male"),
  bondNode("bond-sk", 300, 850, "2000-01-25"),

  // Generation 4: Gyanendra's children
  personNode("paras", 700, 750, "Prince Paras", "male"),
  personNode("himani", 900, 750, "Himani Rajya Lakshmi", "female"),
  bondNode("bond-ph", 800, 850, "2000-01-01"),
  personNode("prerana", 1100, 750, "Princess Prerana", "female"),

  // An adopted child of Gyanendra & Komal (for demo)
  personNode("anish", 1300, 750, "Anish (Adopted)", "male"),

  // Generation 5: Paras's children
  personNode("hridayendra", 650, 1000, "Prince Hridayendra", "male"),
  personNode("purnika", 850, 1000, "Princess Purnika", "female"),
  personNode("kritika", 1050, 1000, "Princess Kritika", "female"),

  // Generation 5: Shruti's children
  personNode("girvani", 200, 1000, "Girvani Rajya Lakshmi", "female"),
  personNode("surangana", 400, 1000, "Surangana Rajya Lakshmi", "female"),
];

export const nepalEdges: Edge[] = [
  // Gen 1 → Bond (First Wife)
  mkEdge("tribhuvan", "bond-tk"),
  mkEdge("kanti", "bond-tk"),
  // Gen 1 → Bond (Second Wife)
  mkEdge("tribhuvan", "bond-ti"),
  mkEdge("ishwari", "bond-ti"),

  // Bond → Gen 2
  mkEdge("bond-tk", "mahendra"),
  mkEdge("bond-tk", "himalaya"),

  // Gen 2 → Bond (First Wife — widowed)
  mkEdge("mahendra", "bond-mi"),
  mkEdge("indra", "bond-mi"),
  // Gen 2 → Bond (Second Wife)
  mkEdge("mahendra", "bond-mr"),
  mkEdge("ratna", "bond-mr"),

  // Bond → Gen 3
  mkEdge("bond-mi", "birendra"),
  mkEdge("bond-mi", "gyanendra"),
  mkEdge("bond-mi", "dhirendra"),

  // Gen 3 → Bonds
  mkEdge("birendra", "bond-ba"),
  mkEdge("aishwarya", "bond-ba"),
  mkEdge("gyanendra", "bond-gk"),
  mkEdge("komal", "bond-gk"),

  // Dhirendra's divorced bond
  mkEdge("dhirendra", "bond-dp"),
  mkEdge("prekshya", "bond-dp"),

  // Bond → Gen 4 (Birendra's children)
  mkEdge("bond-ba", "dipendra"),
  mkEdge("bond-ba", "shruti"),
  mkEdge("bond-ba", "nirajan"),

  // Shruti + Kumar bond
  mkEdge("shruti", "bond-sk"),
  mkEdge("kumar", "bond-sk"),

  // Bond → Gen 4 (Gyanendra's children)
  mkEdge("bond-gk", "paras"),
  mkEdge("bond-gk", "prerana"),

  // Adopted child of Gyanendra & Komal
  mkEdge("bond-gk", "anish", "adopted"),

  // Paras + Himani bond
  mkEdge("paras", "bond-ph"),
  mkEdge("himani", "bond-ph"),

  // Bond → Gen 5 (Paras's children)
  mkEdge("bond-ph", "hridayendra"),
  mkEdge("bond-ph", "purnika"),
  mkEdge("bond-ph", "kritika"),

  // Bond → Gen 5 (Shruti's children)
  mkEdge("bond-sk", "girvani"),
  mkEdge("bond-sk", "surangana"),
];
