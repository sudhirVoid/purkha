import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { useActions } from "../ActionsContext";
import type { MediaItem } from "../types";

export function MediaStrip({ nodeId, media }: { nodeId: string; media: MediaItem[] }) {
  const actions = useActions();
  if (!media.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5 justify-center max-w-[220px]">
      {media.map((mediaItem) => (
        <Dialog key={mediaItem.id}>
          <div className="relative group">
            <DialogTrigger asChild>
              <div className="cursor-pointer">
                {mediaItem.kind === "image" && (
                  <img src={mediaItem.url} alt={mediaItem.name} className="h-10 w-10 rounded-md object-cover border" />
                )}
                {mediaItem.kind === "video" && (
                  <video src={mediaItem.url} className="h-10 w-10 rounded-md object-cover border" muted controls={false} />
                )}
                {mediaItem.kind === "audio" && (
                  <div className="h-10 w-10 rounded-md border grid place-items-center text-base bg-muted">♪</div>
                )}
              </div>
            </DialogTrigger>
            <button
              onClick={(event) => {
                event.stopPropagation();
                actions.removeMedia(nodeId, mediaItem.id);
              }}
              className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] leading-none opacity-0 group-hover:opacity-100 transition z-10"
              title="Remove"
            >
              ×
            </button>
          </div>
          <DialogContent className="max-w-3xl w-full max-h-[90vh] flex flex-col items-center justify-center bg-black/95 border-none p-4 sm:p-10">
            <DialogTitle className="sr-only">{mediaItem.name}</DialogTitle>
            <DialogDescription className="sr-only">Media viewer</DialogDescription>
            {mediaItem.kind === "image" && (
              <img src={mediaItem.url} alt={mediaItem.name} className="max-w-full max-h-[80vh] object-contain rounded-md" />
            )}
            {mediaItem.kind === "video" && (
              <video src={mediaItem.url} className="max-w-full max-h-[80vh] rounded-md" controls autoPlay />
            )}
            {mediaItem.kind === "audio" && (
              <audio src={mediaItem.url} controls className="w-full max-w-md mt-8" autoPlay />
            )}
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
