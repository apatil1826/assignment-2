"use client";

import { useAppContext } from "@/context/AppContext";
import StatCard from "@/components/StatCard";
import Link from "next/link";

export default function Dashboard() {
  const { contacts, interactions } = useAppContext();

  const recentInteractions = [...interactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const interactionsThisMonth = interactions.filter(
    (i) => new Date(i.date) >= thirtyDaysAgo
  );

  // Contacts with no interaction in 30+ days
  const contactsLastInteraction = new Map<string, Date>();
  for (const i of interactions) {
    const d = new Date(i.date);
    const prev = contactsLastInteraction.get(i.contactId);
    if (!prev || d > prev) {
      contactsLastInteraction.set(i.contactId, d);
    }
  }
  const dueForFollowUp = contacts.filter((c) => {
    const last = contactsLastInteraction.get(c.id);
    return !last || last < thirtyDaysAgo;
  });

  const uniqueTags = new Set(contacts.flatMap((c) => c.tags));

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getContactName(contactId: string) {
    return contacts.find((c) => c.id === contactId)?.name ?? "Unknown";
  }

  const typeLabels: Record<string, string> = {
    coffee: "Coffee",
    email: "Email",
    linkedin: "LinkedIn",
    event: "Event",
    call: "Call",
    other: "Other",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h2>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Contacts" value={contacts.length} />
        <StatCard label="Total Interactions" value={interactions.length} />
        <StatCard
          label="This Month"
          value={interactionsThisMonth.length}
          sub="interactions in last 30 days"
        />
        <StatCard
          label="Tags"
          value={uniqueTags.size}
          sub="unique categories"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent interactions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Interactions
          </h3>
          <div className="flex flex-col gap-3">
            {recentInteractions.map((i) => (
              <Link
                key={i.id}
                href={`/contacts/${i.contactId}`}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {getContactName(i.contactId)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {typeLabels[i.type]} &middot; {formatDate(i.date)}
                  </p>
                </div>
                {i.nextSteps && (
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                    Has next steps
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Due for follow-up */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Due for Follow-up
          </h3>
          {dueForFollowUp.length === 0 ? (
            <p className="text-sm text-slate-400">
              You&apos;re all caught up!
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {dueForFollowUp.map((c) => {
                const last = contactsLastInteraction.get(c.id);
                return (
                  <Link
                    key={c.id}
                    href={`/contacts/${c.id}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {c.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {c.company}
                        {c.role ? ` · ${c.role}` : ""}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {last ? `Last: ${formatDate(last.toISOString())}` : "Never contacted"}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
