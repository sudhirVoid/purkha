import { useRef } from "react";
import { NodeToolbar, Position, type NodeProps } from "@xyflow/react";
import { Camera } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../../ui/sheet";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import type { FamilyNode, FamilyNodeData, Gender, ChildRelation } from "../types";
import { genderIcon, genderStyles } from "../constants";
import { useActions } from "../ActionsContext";
import { Handles } from "./Handles";
import { ToolbarBtn } from "./ToolbarBtn";
import { MediaStrip } from "./MediaStrip";
import { CollapseBtn } from "./CollapseBtn";
import { getLoveColor } from "../utils";

function PersonToolbar({ id, data }: { id: string; data: FamilyNodeData }) {
  const actions = useActions();
  const fileRef = useRef<HTMLInputElement>(null);

  const parentInfo = actions.getParentInfo(id);
  const canAddFather = !parentInfo.hasBondParent && !parentInfo.directParents.some(pid => actions.getNode(pid)?.data.gender === "male");
  const canAddMother = !parentInfo.hasBondParent && !parentInfo.directParents.some(pid => actions.getNode(pid)?.data.gender === "female");

  return (
    <div className="rounded-xl border bg-card shadow-lg p-2 space-y-2 w-[240px]">
      <input
        value={data.label}
        onChange={(event) => actions.rename(id, event.target.value)}
        className="w-full px-2 py-1 text-xs rounded-md border bg-background"
        placeholder="Name"
      />
      <div className="flex gap-1">
        {(["male", "female", "other"] as Gender[]).map((genderOption) => (
          <button
            key={genderOption}
            onClick={() => actions.setGender(id, genderOption)}
            className={`flex-1 px-2 py-1 text-xs rounded-md border capitalize transition ${
              (data.gender ?? "other") === genderOption ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"
            }`}
          >
            {genderIcon[genderOption]} {genderOption}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        <ToolbarBtn onClick={() => actions.addParent(id, "Father")} disabled={!canAddFather} title={!canAddFather ? "Father already exists" : ""}>+ Father</ToolbarBtn>
        <ToolbarBtn onClick={() => actions.addParent(id, "Mother")} disabled={!canAddMother} title={!canAddMother ? "Mother already exists" : ""}>+ Mother</ToolbarBtn>
        <ToolbarBtn
          onClick={() => actions.addSpouse(id)}
        >
          + Spouse
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => actions.addSibling(id)}
          disabled={!actions.hasParent(id)}
          title={!actions.hasParent(id) ? "Add a parent first" : ""}
        >
          + Sibling
        </ToolbarBtn>
        <ToolbarBtn onClick={() => actions.addChild(id)}>+ Child</ToolbarBtn>
        <ToolbarBtn onClick={() => fileRef.current?.click()}>+ Media</ToolbarBtn>
        <Sheet>
          <SheetTrigger asChild>
            <div className="col-span-2">
              <ToolbarBtn onClick={() => {}} title="Edit details">Edit Details</ToolbarBtn>
            </div>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Details</SheetTitle>
              <SheetDescription>Update personal information for {data.label || "this member"}.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor={`name-${id}`}>Name (Required)</Label>
                <Input id={`name-${id}`} value={data.label} onChange={(event) => actions.updateNodeData(id, { label: event.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`dob-${id}`}>Date of Birth</Label>
                <Input id={`dob-${id}`} type="date" value={data.dob || ""} onChange={(event) => actions.updateNodeData(id, { dob: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`birthPlace-${id}`}>Birth Place</Label>
                <Input id={`birthPlace-${id}`} value={data.birthPlace || ""} onChange={(event) => actions.updateNodeData(id, { birthPlace: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`deathDate-${id}`}>Death Date (if deceased)</Label>
                <Input id={`deathDate-${id}`} type="date" value={data.deathDate || ""} onChange={(event) => actions.updateNodeData(id, { deathDate: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`address-${id}`}>Address</Label>
                <Textarea id={`address-${id}`} value={data.address || ""} onChange={(event) => actions.updateNodeData(id, { address: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`residingAt-${id}`}>Currently Residing At</Label>
                <Input id={`residingAt-${id}`} value={data.residingAt || ""} onChange={(event) => actions.updateNodeData(id, { residingAt: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`otherDetails-${id}`}>Other Details</Label>
                <Textarea id={`otherDetails-${id}`} value={data.otherDetails || ""} onChange={(event) => actions.updateNodeData(id, { otherDetails: event.target.value })} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*,audio/*"
        multiple
        className="hidden"
        onChange={(event) => {
          actions.addMedia(id, event.target.files);
          event.target.value = "";
        }}
      />
      <button
        onClick={() => actions.remove(id)}
        className="w-full px-2 py-1 text-xs rounded-md border border-destructive text-destructive hover:bg-destructive/10"
      >
        Delete
      </button>
    </div>
  );
}

export function PersonNodeView({ id, data, selected }: NodeProps<FamilyNode>) {
  const gender = data.gender ?? "other";
  const actions = useActions();
  const fileRef = useRef<HTMLInputElement>(null);
  const spouses = actions.getSpouses(id);
  const parentBond = (data as any).parentBond;
  const childRelation: ChildRelation = (data as any).childRelation || "biological";
  const loveColor = parentBond ? getLoveColor(parentBond) : null;

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (fileEvent) => {
      actions.setProfileImage(id, fileEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const dobYear = data.dob ? new Date(data.dob).getFullYear() : "?";
  const deathYear = data.deathDate ? new Date(data.deathDate).getFullYear() : "Present";

  return (
    <div
      className={`rounded-2xl border-2 px-4 py-3 shadow-sm font-medium text-sm transition ${
        genderStyles[gender]
      } min-w-[200px] ${selected ? "ring-2 ring-offset-2 ring-offset-background" : ""}`}
      style={{ 
        fontFamily: "'Kalam', 'Comic Sans MS', cursive",
        borderColor: loveColor?.connector,
        "--tw-ring-color": loveColor?.connector || "hsl(var(--ring))"
      } as React.CSSProperties}
    >
      <NodeToolbar isVisible={selected} position={Position.Right}>
        <PersonToolbar id={id} data={data} />
      </NodeToolbar>
      <Handles />

      <div className="flex items-center gap-3 relative text-left">
        <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleProfileImageChange} />
        <div
          className="w-14 h-14 rounded-xl border-2 border-current/20 bg-white/50 flex items-center justify-center relative overflow-hidden shrink-0 group cursor-pointer"
          onClick={() => fileRef.current?.click()}
          title="Click to upload picture"
        >
          {data.profileImage ? (
            <img src={data.profileImage} alt={data.label} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl opacity-50">{genderIcon[gender]}</span>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-bold text-base truncate leading-tight">{data.label}</span>
          <span className="text-xs opacity-80 mt-0.5">{dobYear} — {deathYear}</span>
          {data.birthPlace && (
            <span className="text-[10px] opacity-70 truncate mt-0.5">{data.birthPlace}</span>
          )}
        </div>
      </div>

      {/* Child relation badge */}
      {childRelation !== "biological" && (
        <div className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
          childRelation === "adopted" ? "bg-blue-100 text-blue-700 border border-blue-200" :
          childRelation === "foster" ? "bg-green-100 text-green-700 border border-green-200" :
          "bg-purple-100 text-purple-700 border border-purple-200"
        }`}>
          <span>{childRelation === "adopted" ? "🤝" : childRelation === "foster" ? "🏠" : "👣"}</span>
          {childRelation}
        </div>
      )}
      
      {spouses.length > 1 && (
        <div className="mt-3 pt-2 border-t border-current/20 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Partners</span>
          <div className="flex flex-wrap gap-1">
            {spouses.map(s => {
              const isActive = actions.getActiveSpouse(id) === s.bondId;
              const bondNode = actions.getNode(s.bondId);
              const bondStatus = bondNode?.data.bondStatus ?? "married";
              const statusIcon = bondStatus === "divorced" ? "💔" : bondStatus === "separated" ? "⚡" : bondStatus === "widowed" ? "🕊️" : "";
              return (
                <button
                  key={s.bondId}
                  onClick={(e) => { e.stopPropagation(); actions.setActiveSpouse(id, s.bondId); }}
                  className={`px-2 py-0.5 text-[10px] rounded-full border transition-colors truncate max-w-[100px] ${isActive ? "bg-primary text-primary-foreground border-primary" : "bg-white/50 border-current/20 hover:bg-white/80"}`}
                  title={`${s.spouseNode.data.label} (${bondStatus})`}
                >
                  {statusIcon && <span className="mr-0.5">{statusIcon}</span>}
                  {s.spouseNode.data.label.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <MediaStrip nodeId={id} media={data.media ?? []} />
      <CollapseBtn id={id} isCollapsed={data.isCollapsed} />
    </div>
  );
}
