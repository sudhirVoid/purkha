import { useRef, useMemo } from "react";
import { NodeToolbar, Position, type NodeProps } from "@xyflow/react";
import { Camera, MapPin, Calendar, User, Heart, Plus, Trash2, Edit3, Image as ImageIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../../ui/sheet";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import type { FamilyNode, FamilyNodeData, Gender, ChildRelation } from "../types";
import { genderIcon, genderLabel, genderStyles } from "../constants";
import { useActions } from "../ActionsContext";
import { Handles } from "./Handles";
import { ToolbarBtn } from "./ToolbarBtn";
import { MediaStrip } from "./MediaStrip";
import { CollapseBtn } from "./CollapseBtn";
import { toneFor, generationLabel } from "../generations";

function PersonToolbar({ id, data }: { id: string; data: FamilyNodeData }) {
  const actions = useActions();
  const fileRef = useRef<HTMLInputElement>(null);

  const parentInfo = actions.getParentInfo(id);
  const canAddFather = !parentInfo.hasBondParent && !parentInfo.directParents.some(pid => actions.getNode(pid)?.data.gender === "male");
  const canAddMother = !parentInfo.hasBondParent && !parentInfo.directParents.some(pid => actions.getNode(pid)?.data.gender === "female");

  return (
    <div className="rounded-2xl border border-lokta-border bg-surface-bright/95 backdrop-blur-md shadow-2xl p-3 space-y-2.5 w-[260px] text-on-surface">
      <div className="flex items-center gap-2">
        <input
          value={data.label}
          onChange={(event) => actions.rename(id, event.target.value)}
          className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface-container-low font-medium focus:outline-none focus:border-sindoor"
          placeholder="Ancestor name"
        />
      </div>

      <div className="flex gap-1 p-0.5 bg-surface-container-low rounded-lg border border-outline-variant">
        {(["male", "female", "other"] as Gender[]).map((genderOption) => {
          const isSelected = (data.gender ?? "other") === genderOption;
          return (
            <button
              key={genderOption}
              type="button"
              onClick={() => actions.setGender(id, genderOption)}
              className={`flex-1 py-1 text-[11px] rounded-md font-medium transition-colors ${
                isSelected
                  ? "bg-himal text-lokta-light shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {genderIcon[genderOption]} {genderLabel[genderOption]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-outline-variant/50">
        <ToolbarBtn onClick={() => actions.addParent(id, "Father")} disabled={!canAddFather} title={!canAddFather ? "Father already exists" : ""}>
          + Father (बुवा)
        </ToolbarBtn>
        <ToolbarBtn onClick={() => actions.addParent(id, "Mother")} disabled={!canAddMother} title={!canAddMother ? "Mother already exists" : ""}>
          + Mother (आमा)
        </ToolbarBtn>
        <ToolbarBtn onClick={() => actions.addSpouse(id)}>
          + Spouse (दम्पती)
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => actions.addSibling(id)}
          disabled={!actions.hasParent(id)}
          title={!actions.hasParent(id) ? "Add a parent first" : ""}
        >
          + Sibling (दाजुभाइ/दिदीबहिनी)
        </ToolbarBtn>
        <ToolbarBtn onClick={() => actions.addChild(id)}>
          + Child (सन्तान)
        </ToolbarBtn>
        <ToolbarBtn onClick={() => fileRef.current?.click()}>
          <span className="inline-flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> Media
          </span>
        </ToolbarBtn>

        <Sheet>
          <SheetTrigger asChild>
            <div className="col-span-2">
              <button
                type="button"
                className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-himal/10 hover:bg-himal/20 text-himal border border-himal/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3 h-3" /> Full Profile (विस्तृत विवरण)
              </button>
            </div>
          </SheetTrigger>
          <SheetContent className="w-[420px] sm:w-[560px] overflow-y-auto bg-surface-bright border-l border-lokta-border">
            <SheetHeader>
              <div className="flex items-center gap-2">
                <span className="font-devanagari text-sindoor font-bold text-sm">वंशावली अभिलेख</span>
              </div>
              <SheetTitle className="font-headline text-2xl text-himal">{data.label || "Ancestor Profile"}</SheetTitle>
              <SheetDescription className="font-body text-xs text-on-surface-variant">
                Record vital life milestones, locations, and lineage details for future generations.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-5 text-sm">
              <div className="grid gap-1.5">
                <Label htmlFor={`name-${id}`} className="font-label-sm text-xs uppercase tracking-wider text-himal">Full Name (शुभनाम)</Label>
                <Input id={`name-${id}`} value={data.label} onChange={(event) => actions.updateNodeData(id, { label: event.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor={`dob-${id}`} className="font-label-sm text-xs uppercase tracking-wider text-himal">Birth Date (जन्म मिति)</Label>
                  <Input id={`dob-${id}`} type="date" value={data.dob || ""} onChange={(event) => actions.updateNodeData(id, { dob: event.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor={`deathDate-${id}`} className="font-label-sm text-xs uppercase tracking-wider text-himal">Death Date (स्वर्गारोहण)</Label>
                  <Input id={`deathDate-${id}`} type="date" value={data.deathDate || ""} onChange={(event) => actions.updateNodeData(id, { deathDate: event.target.value })} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`birthPlace-${id}`} className="font-label-sm text-xs uppercase tracking-wider text-himal">Birth Place (जन्मस्थान / थातथलो)</Label>
                <Input id={`birthPlace-${id}`} placeholder="e.g. Gorkha, Lamjung, Kathmandu" value={data.birthPlace || ""} onChange={(event) => actions.updateNodeData(id, { birthPlace: event.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`residingAt-${id}`} className="font-label-sm text-xs uppercase tracking-wider text-himal">Current / Last Residing (बसोबास)</Label>
                <Input id={`residingAt-${id}`} placeholder="e.g. Kathmandu, Jhapa, Abroad" value={data.residingAt || ""} onChange={(event) => actions.updateNodeData(id, { residingAt: event.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`address-${id}`} className="font-label-sm text-xs uppercase tracking-wider text-himal">Address (ठेगाना)</Label>
                <Textarea id={`address-${id}`} rows={2} value={data.address || ""} onChange={(event) => actions.updateNodeData(id, { address: event.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`otherDetails-${id}`} className="font-label-sm text-xs uppercase tracking-wider text-himal">Gotra, Pravara & Clan Notes (गोत्र, पदवी, वृत्तान्त)</Label>
                <Textarea id={`otherDetails-${id}`} rows={3} placeholder="Ancestral titles, gotra, historical records..." value={data.otherDetails || ""} onChange={(event) => actions.updateNodeData(id, { otherDetails: event.target.value })} />
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
        type="button"
        onClick={() => actions.remove(id)}
        className="w-full py-1 text-xs rounded-lg border border-error/30 text-error hover:bg-error/10 transition-colors flex items-center justify-center gap-1 font-medium"
      >
        <Trash2 className="w-3 h-3" /> Remove Ancestor
      </button>
    </div>
  );
}

export function PersonNodeView({ id, data, selected }: NodeProps<FamilyNode>) {
  const gender = data.gender ?? "other";
  const actions = useActions();
  const fileRef = useRef<HTMLInputElement>(null);
  const spouses = actions.getSpouses(id);
  const childRelation: ChildRelation = (data as any).childRelation || "biological";
  const generation = data.generation ?? 0;
  const tone = toneFor(generation);

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

  const dobYear = data.dob ? new Date(data.dob).getFullYear() : null;
  const deathYear = data.deathDate ? new Date(data.deathDate).getFullYear() : null;

  const vitalsText = useMemo(() => {
    if (dobYear && deathYear) return `${dobYear} — ${deathYear}`;
    if (dobYear && !deathYear) return `b. ${dobYear}`;
    if (!dobYear && deathYear) return `d. ${deathYear}`;
    return null;
  }, [dobYear, deathYear]);

  const cardHeight = data.cardHeight;

  return (
    <div
      className={`relative rounded-2xl border-2 transition-all duration-200 select-none ${genderStyles[gender]} ${
        selected ? "ring-3 ring-sindoor shadow-xl scale-[1.02]" : "shadow-md hover:shadow-lg"
      } w-[260px] pb-3 flex flex-col justify-between`}
      style={{
        borderColor: selected ? "#B3173A" : tone.base,
        minHeight: cardHeight ? `${cardHeight}px` : undefined,
      }}
    >
      <NodeToolbar isVisible={selected} position={Position.Right}>
        <PersonToolbar id={id} data={data} />
      </NodeToolbar>
      <Handles />

      {/* Generation Header Ribbon */}
      <div
        className="flex items-center justify-between px-3 py-1 rounded-t-[14px] text-[10px] font-bold tracking-wider uppercase shrink-0"
        style={{
          backgroundColor: tone.base,
          color: tone.ink,
        }}
      >
        <span className="font-devanagari font-semibold">{generationLabel(generation)}</span>
        <span className="opacity-90 font-mono flex items-center gap-1">
          <span>{genderIcon[gender]}</span>
          <span className="text-[9px] uppercase tracking-normal">{tone.name}</span>
        </span>
      </div>

      {/* Main Person Content */}
      <div className="p-3 pt-2.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start gap-3 text-left">
            <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleProfileImageChange} />
            
            {/* Avatar / Portrait */}
            <div
              className="w-13 h-13 rounded-xl border border-outline-variant/60 flex items-center justify-center relative overflow-hidden shrink-0 group cursor-pointer shadow-xs"
              style={{ backgroundColor: tone.soft }}
              onClick={() => fileRef.current?.click()}
              title="Click to upload portrait"
            >
              {data.profileImage ? (
                <img src={data.profileImage} alt={data.label} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-serif font-bold text-lg" style={{ color: tone.deep }}>
                    {data.label ? data.label.charAt(0).toUpperCase() : genderIcon[gender]}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col flex-1 min-w-0">
              <h4 className="font-serif font-bold text-[15px] leading-snug text-himal truncate" title={data.label}>
                {data.label || "Unnamed Purkha"}
              </h4>

              {vitalsText && (
                <div className="flex items-center gap-1 text-[11px] font-mono text-on-surface-variant/90 mt-0.5">
                  <Calendar className="w-3 h-3 shrink-0 opacity-70" />
                  <span>{vitalsText}</span>
                </div>
              )}

              {data.birthPlace && (
                <div className="flex items-center gap-1 text-[10px] text-on-surface-variant/80 mt-0.5 truncate" title={data.birthPlace}>
                  <MapPin className="w-3 h-3 shrink-0 opacity-70 text-sindoor" />
                  <span className="truncate">{data.birthPlace}</span>
                </div>
              )}
            </div>
          </div>

          {/* Adopted / Non-biological relation pill */}
          {childRelation !== "biological" && (
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-sayapatri/20 text-sayapatri-deep border border-sayapatri/40">
              <span>{childRelation === "adopted" ? "🤝 धर्मपुत्र/पुत्री" : childRelation === "foster" ? "🏠" : "👣"}</span>
              <span>{childRelation}</span>
            </div>
          )}
        </div>

        {/* Bottom Section (Spouses & Media) */}
        {(spouses.length > 1 || (data.media && data.media.length > 0)) && (
          <div className="mt-2">
            {/* Multiple Spouses Selector */}
            {spouses.length > 1 && (
              <div className="pt-2 border-t border-outline-variant/40 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                  <span>Partners (जीवनसाथी)</span>
                  <span className="font-mono">{spouses.length}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {spouses.map((s) => {
                    const isActive = actions.getActiveSpouse(id) === s.bondId;
                    const bondNode = actions.getNode(s.bondId);
                    const bondStatus = bondNode?.data.bondStatus ?? "married";
                    const statusIcon = bondStatus === "divorced" ? "💔" : bondStatus === "separated" ? "⚡" : bondStatus === "widowed" ? "🕊️" : "";
                    return (
                      <button
                        key={s.bondId}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.setActiveSpouse(id, s.bondId);
                        }}
                        className={`px-2 py-0.5 text-[10px] rounded-full border transition-colors truncate max-w-[110px] ${
                          isActive
                            ? "bg-himal text-white border-himal font-medium shadow-xs"
                            : "bg-surface-container-low border-outline-variant hover:bg-surface-container text-on-surface"
                        }`}
                        title={`${s.spouseNode?.data.label ?? "Spouse"} (${bondStatus})`}
                      >
                        {statusIcon && <span className="mr-0.5">{statusIcon}</span>}
                        {s.spouseNode?.data.label?.split(" ")[0] ?? "Spouse"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Media Strip */}
            <MediaStrip nodeId={id} media={data.media ?? []} />
          </div>
        )}
      </div>

      {/* Descendant Expand/Collapse Button */}
      <CollapseBtn
        id={id}
        isCollapsed={data.isCollapsed}
        childrenCount={data.childrenCount}
        tone={tone}
      />
    </div>
  );
}
