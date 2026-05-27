import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { textareaClassName } from "@/components/ui/field";
import { useMessages } from "@/features/i18n/use-messages";

export type SkipReasonCode =
  | "tired"
  | "injury"
  | "time"
  | "no_motivation"
  | "soreness"
  | "other";

type SkipWorkoutDialogProps = {
  open: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: { skipReasonCode: SkipReasonCode; note?: string }) => void;
};

export function SkipWorkoutDialog({
  open,
  loading,
  onOpenChange,
  onConfirm,
}: SkipWorkoutDialogProps) {
  const t = useMessages();
  const [reason, setReason] = useState<SkipReasonCode>("tired");
  const [note, setNote] = useState("");

  const reasons: Array<{ code: SkipReasonCode; label: string }> = [
    { code: "tired", label: t.training.skipReasons.tired },
    { code: "injury", label: t.training.skipReasons.injury },
    { code: "time", label: t.training.skipReasons.time },
    { code: "no_motivation", label: t.training.skipReasons.noMotivation },
    { code: "soreness", label: t.training.skipReasons.soreness },
    { code: "other", label: t.training.skipReasons.other },
  ];

  return (
    <Dialog
      description={t.training.skipDialogHint}
      onOpenChange={(next) => {
        if (!loading) {
          onOpenChange(next);
        }
      }}
      open={open}
      title={t.training.skipDialogTitle}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {reasons.map((item) => (
            <button
              key={item.code}
              className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition ${
                reason === item.code
                  ? "border-violet-500 bg-violet-950/50 text-violet-100"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              }`}
              disabled={loading}
              onClick={() => setReason(item.code)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <textarea
          className={textareaClassName}
          disabled={loading}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t.training.skipNotePlaceholder}
          rows={3}
          value={note}
        />
        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            {t.training.cancelSkip}
          </Button>
          <Button
            className="flex-1"
            loading={loading}
            loadingLabel={t.common.saving}
            onClick={() =>
              onConfirm({
                skipReasonCode: reason,
                note: note.trim() || undefined,
              })
            }
            variant="outline"
          >
            {t.training.confirmSkip}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
