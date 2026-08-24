import type { Node } from "@xyflow/react";

export type Kind = "person" | "bond";
export type Gender = "male" | "female" | "other";
export type MediaKind = "image" | "video" | "audio";
export type MediaItem = { id: string; kind: MediaKind; url: string; name: string };

export type FamilyNodeData = {
  label: string;
  kind: Kind;
  gender?: Gender;
  media?: MediaItem[];
  marriageDate?: string;
  address?: string;
  birthPlace?: string;
  dob?: string;
  deathDate?: string;
  otherDetails?: string;
  residingAt?: string;
  profileImage?: string;
  isCollapsed?: boolean;
};

export type FamilyNode = Node<FamilyNodeData>;

export type Actions = {
  addParent: (id: string, label: "Father" | "Mother") => void;
  addSpouse: (id: string) => void;
  addSibling: (id: string) => void;
  addChild: (id: string) => void;
  remove: (id: string) => void;
  rename: (id: string, label: string) => void;
  setGender: (id: string, g: Gender) => void;
  setProfileImage: (id: string, url: string | undefined) => void;
  setMarriageDate: (id: string, d: string) => void;
  addMedia: (id: string, files: FileList | null) => void;
  removeMedia: (id: string, mediaId: string) => void;
  hasPartner: (id: string) => boolean;
  hasParent: (id: string) => boolean;
  updateNodeData: (id: string, data: Partial<FamilyNodeData>) => void;
  toggleCollapse: (id: string) => void;
  canCollapse: (id: string) => boolean;
  getParentInfo: (id: string) => { hasBondParent: boolean; directParents: string[] };
  getNode: (id: string) => FamilyNode | undefined;
};
