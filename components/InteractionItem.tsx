import { Interaction } from "@/context/AppContext";

type InteractionItemProps = {
  interaction: Interaction;
};

const typeIcons: Record<string, string> = {
  coffee: "\u2615",
  email: "\u2709\uFE0F",
  linkedin: "\uD83D\uDD17",
  event: "\uD83C\uDF9F\uFE0F",
  call: "\uD83D\uDCDE",
  other: "\uD83D\uDCCC",
};

const typeLabels: Record<string, string> = {
  coffee: "Coffee Chat",
  email: "Email",
  linkedin: "LinkedIn",
  event: "Event",
  call: "Phone Call",
  other: "Other",
};

export default function InteractionItem({ interaction }: InteractionItemProps) {
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="text-xl mt-0.5">{typeIcons[interaction.type]}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-slate-900">
            {typeLabels[interaction.type]}
          </p>
          <p className="text-xs text-slate-400">{formatDate(interaction.date)}</p>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          {interaction.notes}
        </p>
        {interaction.nextSteps && (
          <div className="mt-2 flex items-start gap-2 bg-indigo-50 rounded-lg px-3 py-2">
            <span className="text-xs text-indigo-600 font-medium whitespace-nowrap mt-0.5">
              Next steps:
            </span>
            <span className="text-xs text-indigo-600">
              {interaction.nextSteps}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
