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
export const nepalNodes: FamilyNode[] = [
  // Generation 1: King Tribhuvan
  personNode("tribhuvan", 0, 0, "King Tribhuvan", "male"),
  personNode("kanti", 300, 0, "Kanti Rajya Lakshmi", "female"),
  bondNode("bond-tk", 150, 100, "1919-02-27"),

  // Generation 2: King Mahendra + siblings
  personNode("mahendra", 0, 250, "King Mahendra", "male"),
  personNode("indra", 300, 250, "Indra Rajya Lakshmi", "female"),
  bondNode("bond-mi", 150, 350, "1940-05-01"),
  personNode("himalaya", 600, 250, "Prince Himalaya", "male"),

  // Generation 3: King Birendra, Prince Gyanendra, and siblings
  personNode("birendra", 0, 500, "King Birendra", "male"),
  personNode("aishwarya", 300, 500, "Queen Aishwarya", "female"),
  bondNode("bond-ba", 150, 600, "1970-02-27"),

  personNode("gyanendra", 600, 500, "King Gyanendra", "male"),
  personNode("komal", 900, 500, "Queen Komal", "female"),
  bondNode("bond-gk", 750, 600, "1970-05-01"),

  personNode("dhirendra", 1100, 500, "Prince Dhirendra", "male"),

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

  // Generation 5: Paras's children
  personNode("hridayendra", 650, 1000, "Prince Hridayendra", "male"),
  personNode("purnika", 850, 1000, "Princess Purnika", "female"),
  personNode("kritika", 1050, 1000, "Princess Kritika", "female"),

  // Generation 5: Shruti's children
  personNode("girvani", 200, 1000, "Girvani Rajya Lakshmi", "female"),
  personNode("surangana", 400, 1000, "Surangana Rajya Lakshmi", "female"),
];

export const nepalEdges: Edge[] = [
  // Gen 1 → Bond
  mkEdge("tribhuvan", "bond-tk"),
  mkEdge("kanti", "bond-tk"),

  // Bond → Gen 2
  mkEdge("bond-tk", "mahendra"),
  mkEdge("bond-tk", "himalaya"),

  // Gen 2 → Bond
  mkEdge("mahendra", "bond-mi"),
  mkEdge("indra", "bond-mi"),

  // Bond → Gen 3
  mkEdge("bond-mi", "birendra"),
  mkEdge("bond-mi", "gyanendra"),
  mkEdge("bond-mi", "dhirendra"),

  // Gen 3 → Bonds
  mkEdge("birendra", "bond-ba"),
  mkEdge("aishwarya", "bond-ba"),
  mkEdge("gyanendra", "bond-gk"),
  mkEdge("komal", "bond-gk"),

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
