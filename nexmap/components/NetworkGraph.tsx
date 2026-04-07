"use client";

import { useMemo } from "react";
import { Contact, Interaction } from "@/context/AppContext";

type NetworkGraphProps = {
  contacts: Contact[];
  interactions: Interaction[];
  groupBy: "tags" | "company";
};

type Node = {
  id: string;
  label: string;
  group: string;
  x: number;
  y: number;
  radius: number;
};

const groupColors: Record<string, string> = {
  // Tag colors
  mentor: "#4f46e5",
  tech: "#0891b2",
  classmate: "#16a34a",
  recruiter: "#dc2626",
  finance: "#ca8a04",
  research: "#7c3aed",
  AI: "#ec4899",
  consulting: "#ea580c",
  // Company colors (fallbacks)
  TechCorp: "#4f46e5",
  Stripe: "#635bff",
  "Capital Group": "#ca8a04",
  UChicago: "#800000",
  OpenAI: "#10a37f",
  McKinsey: "#003d6b",
};

const defaultColor = "#6b7280";

export default function NetworkGraph({
  contacts,
  interactions,
  groupBy,
}: NetworkGraphProps) {
  const width = 700;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;

  const nodes = useMemo(() => {
    // Group contacts
    const groups = new Map<string, Contact[]>();
    for (const c of contacts) {
      const keys =
        groupBy === "tags"
          ? c.tags.length > 0
            ? [c.tags[0]]
            : ["other"]
          : [c.company || "other"];
      for (const key of keys) {
        const existing = groups.get(key) || [];
        existing.push(c);
        groups.set(key, existing);
      }
    }

    // Count interactions per contact for node sizing
    const interactionCounts = new Map<string, number>();
    for (const i of interactions) {
      interactionCounts.set(
        i.contactId,
        (interactionCounts.get(i.contactId) || 0) + 1
      );
    }

    const result: Node[] = [];
    const groupKeys = Array.from(groups.keys());
    const groupCount = groupKeys.length;

    groupKeys.forEach((groupKey, groupIndex) => {
      const members = groups.get(groupKey)!;
      // Place each group in a cluster around the center
      const groupAngle = (2 * Math.PI * groupIndex) / groupCount - Math.PI / 2;
      const groupRadius = 150;
      const groupCenterX = centerX + Math.cos(groupAngle) * groupRadius;
      const groupCenterY = centerY + Math.sin(groupAngle) * groupRadius;

      members.forEach((contact, memberIndex) => {
        const count = interactionCounts.get(contact.id) || 0;
        const radius = Math.max(20, Math.min(40, 15 + count * 5));

        // Spread members within the cluster
        const memberAngle =
          (2 * Math.PI * memberIndex) / members.length - Math.PI / 2;
        const spread = members.length > 1 ? 60 : 0;

        result.push({
          id: contact.id,
          label: contact.name,
          group: groupKey,
          x: groupCenterX + Math.cos(memberAngle) * spread,
          y: groupCenterY + Math.sin(memberAngle) * spread,
          radius,
        });
      });
    });

    return result;
  }, [contacts, interactions, groupBy, centerX, centerY]);

  // Build edges between contacts that share a group
  const edges = useMemo(() => {
    const result: { from: Node; to: Node; group: string }[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].group === nodes[j].group) {
          const key = `${nodes[i].id}-${nodes[j].id}`;
          if (!seen.has(key)) {
            seen.add(key);
            result.push({
              from: nodes[i],
              to: nodes[j],
              group: nodes[i].group,
            });
          }
        }
      }
    }
    return result;
  }, [nodes]);

  // Also draw lines from center "You" node to each contact
  const uniqueGroups = Array.from(new Set(nodes.map((n) => n.group)));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
    >
      {/* Edges within groups */}
      {edges.map((edge, i) => (
        <line
          key={`edge-${i}`}
          x1={edge.from.x}
          y1={edge.from.y}
          x2={edge.to.x}
          y2={edge.to.y}
          stroke={groupColors[edge.group] || defaultColor}
          strokeWidth={1}
          strokeOpacity={0.2}
        />
      ))}

      {/* Lines from center to each node */}
      {nodes.map((node) => (
        <line
          key={`center-${node.id}`}
          x1={centerX}
          y1={centerY}
          x2={node.x}
          y2={node.y}
          stroke="#e2e8f0"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      ))}

      {/* Contact nodes */}
      {nodes.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={node.radius}
            fill={groupColors[node.group] || defaultColor}
            fillOpacity={0.15}
            stroke={groupColors[node.group] || defaultColor}
            strokeWidth={2}
          />
          <text
            x={node.x}
            y={node.y - node.radius - 6}
            textAnchor="middle"
            className="text-xs fill-slate-700 font-medium"
            fontSize={11}
          >
            {node.label.split(" ")[0]}
          </text>
        </g>
      ))}

      {/* Center "You" node */}
      <circle
        cx={centerX}
        cy={centerY}
        r={24}
        fill="#4f46e5"
        fillOpacity={0.1}
        stroke="#4f46e5"
        strokeWidth={2}
      />
      <text
        x={centerX}
        y={centerY + 4}
        textAnchor="middle"
        className="text-xs fill-indigo-600 font-semibold"
        fontSize={12}
      >
        You
      </text>

      {/* Legend */}
      {uniqueGroups.map((group, i) => (
        <g key={group} transform={`translate(16, ${16 + i * 22})`}>
          <circle
            r={5}
            cx={5}
            cy={5}
            fill={groupColors[group] || defaultColor}
          />
          <text x={16} y={9} fontSize={11} className="fill-slate-500">
            {group}
          </text>
        </g>
      ))}
    </svg>
  );
}
