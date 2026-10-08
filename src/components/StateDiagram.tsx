import React from 'react';
import { TuringMachineDefinition, Transition } from '../engine/types';

interface StateDiagramProps {
  machine: TuringMachineDefinition;
  currentState: string;
  activeTransition: Transition | null;
}

interface ProcessedEdge {
  id: string;
  from: string;
  to: string;
  pathD: string;
  labelX: number;
  labelY: number;
  labelText: string;
  isActive: boolean;
  isSelfLoop: boolean;
}

export const StateDiagram: React.FC<StateDiagramProps> = ({
  machine,
  currentState,
  activeTransition,
}) => {
  const positions = machine.statePositions;
  const edgeLayouts = machine.edgeLayouts || {};

  // Group transitions by fromState and toState
  const groupMap = new Map<string, {
    from: string;
    to: string;
    labels: string[];
    isActive: boolean;
  }>();

  machine.transitions.forEach((t) => {
    const key = `${t.currentState}-->${t.nextState}`;
    const shortLabel = `${t.readSymbol} / ${t.writeSymbol}, ${t.moveDirection}`;
    const isThisActive =
      activeTransition !== null &&
      activeTransition.currentState === t.currentState &&
      activeTransition.readSymbol === t.readSymbol &&
      activeTransition.nextState === t.nextState;

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        from: t.currentState,
        to: t.nextState,
        labels: [shortLabel],
        isActive: isThisActive,
      });
    } else {
      const g = groupMap.get(key)!;
      if (!g.labels.includes(shortLabel)) {
        g.labels.push(shortLabel);
      }
      if (isThisActive) {
        g.isActive = true;
      }
    }
  });

  // Calculate clean, non-crossing SVG paths and non-colliding label coordinates
  const edges: ProcessedEdge[] = [];

  groupMap.forEach((group, key) => {
    const fromPos = positions[group.from];
    const toPos = positions[group.to];
    if (!fromPos || !toPos) return;

    const layout = edgeLayouts[key] || {};
    const isSelfLoop = group.from === group.to;

    // Self-loop rendering
    if (isSelfLoop) {
      const dir = layout.loopDirection || 'top';
      let pathD = '';
      let lx = fromPos.x;
      let ly = fromPos.y;

      if (dir === 'top') {
        const topY = fromPos.y - 30;
        pathD = `M ${fromPos.x - 14} ${fromPos.y - 24} C ${fromPos.x - 30} ${topY - 35}, ${fromPos.x + 30} ${topY - 35}, ${fromPos.x + 14} ${fromPos.y - 24}`;
        lx = fromPos.x;
        ly = topY - 38;
      } else if (dir === 'bottom') {
        const botY = fromPos.y + 30;
        pathD = `M ${fromPos.x - 14} ${fromPos.y + 24} C ${fromPos.x - 30} ${botY + 35}, ${fromPos.x + 30} ${botY + 35}, ${fromPos.x + 14} ${fromPos.y + 24}`;
        lx = fromPos.x;
        ly = botY + 45;
      } else if (dir === 'left') {
        const leftX = fromPos.x - 30;
        pathD = `M ${fromPos.x - 24} ${fromPos.y - 14} C ${leftX - 35} ${fromPos.y - 30}, ${leftX - 35} ${fromPos.y + 30}, ${fromPos.x - 24} ${fromPos.y + 14}`;
        lx = leftX - 42;
        ly = fromPos.y;
      } else {
        const rightX = fromPos.x + 30;
        pathD = `M ${fromPos.x + 24} ${fromPos.y - 14} C ${rightX + 35} ${fromPos.y - 30}, ${rightX + 35} ${fromPos.y + 30}, ${fromPos.x + 24} ${fromPos.y + 14}`;
        lx = rightX + 42;
        ly = fromPos.y;
      }

      edges.push({
        id: key,
        from: group.from,
        to: group.to,
        pathD,
        labelX: layout.labelX ?? lx,
        labelY: layout.labelY ?? ly,
        labelText: group.labels.join('  •  '),
        isActive: group.isActive,
        isSelfLoop: true,
      });
      return;
    }

    // Direct / Curved transition edges between distinct states
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));

    const curveOffset = layout.curveOffset ?? 0;
    const isToReject = machine.rejectStates.includes(group.to) || group.to.includes('reject');

    // Format label cleanly with compact syntax for reject edges to eliminate horizontal collision
    let displayLabel = group.labels.join('  •  ');
    if (isToReject && group.labels.length > 1) {
      const readSymbols = Array.from(
        new Set(
          group.labels.map((l) => {
            const parts = l.split('/');
            return parts[0].trim();
          })
        )
      );
      if (readSymbols.length <= 3) {
        displayLabel = `${readSymbols.join(', ')} / R`;
      } else {
        displayLabel = `${readSymbols.slice(0, 2).join(', ')}, … / R`;
      }
    }

    let lx: number;
    let ly: number;

    if (isToReject) {
      // Radial ray position from fromPos down towards q_reject
      // Positions pill in the open diagonal area between top state badges (y≈155) and bottom reject state (y≈295)
      const t = 0.58;
      lx = fromPos.x + dx * t;
      ly = fromPos.y + dy * t;
    } else if (curveOffset !== 0) {
      // Quadratic Bezier arc with perpendicular control point
      const midX = (fromPos.x + toPos.x) / 2 + (-dy / dist) * curveOffset;
      const midY = (fromPos.y + toPos.y) / 2 + (dx / dist) * curveOffset;
      lx = midX;
      ly = midY - 6;
    } else {
      // Clean forward straight horizontal edge - place label clearly above the line
      const midX = (fromPos.x + toPos.x) / 2;
      const midY = (fromPos.y + toPos.y) / 2;
      lx = midX;
      ly = midY - 26;
    }

    let pathD = '';
    if (curveOffset !== 0) {
      const midX = (fromPos.x + toPos.x) / 2 + (-dy / dist) * curveOffset;
      const midY = (fromPos.y + toPos.y) / 2 + (dx / dist) * curveOffset;
      pathD = `M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY} ${toPos.x} ${toPos.y}`;
    } else {
      pathD = `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`;
    }

    edges.push({
      id: key,
      from: group.from,
      to: group.to,
      pathD,
      labelX: layout.labelX ?? Math.round(lx),
      labelY: layout.labelY ?? Math.round(ly),
      labelText: displayLabel,
      isActive: group.isActive,
      isSelfLoop: false,
    });
  });

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900/80 flex flex-col transition-colors">
      {/* Header bar of State Diagram */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
            State Transition Diagram
          </h3>
          <span className="text-xs text-slate-500 font-sans hidden sm:inline">
            (Hierarchical Non-Overlapping Automaton Graph)
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Start
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Accept
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Reject
          </span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="w-full relative flex-1 min-h-[340px] sm:min-h-[400px] bg-slate-50 dark:bg-slate-950/90 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center p-2">
        <svg
          viewBox="0 0 940 380"
          className="w-full h-full max-h-[440px] select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Standard arrow marker for light & dark themes */}
            <marker
              id="clean-arrow"
              viewBox="0 0 10 10"
              refX="26"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
            </marker>

            {/* Glowing active arrow marker */}
            <marker
              id="clean-arrow-active"
              viewBox="0 0 10 10"
              refX="27"
              refY="5"
              markerWidth="7.5"
              markerHeight="7.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#2563eb" />
            </marker>

            {/* Neon active marker for dark mode */}
            <marker
              id="clean-arrow-active-dark"
              viewBox="0 0 10 10"
              refX="27"
              refY="5"
              markerWidth="7.5"
              markerHeight="7.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#22d3ee" />
            </marker>

            <filter id="diagram-active-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#2563eb" floodOpacity="0.6" />
            </filter>
            <filter id="diagram-active-glow-dark" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#06b6d4" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Start Indicator Arrow into Initial State */}
          {positions[machine.initialState] && (
            <g>
              <line
                x1={positions[machine.initialState].x - 65}
                y1={positions[machine.initialState].y}
                x2={positions[machine.initialState].x - 30}
                y2={positions[machine.initialState].y}
                stroke="#2563eb"
                strokeWidth="2.5"
                markerEnd="url(#clean-arrow)"
              />
              <text
                x={positions[machine.initialState].x - 70}
                y={positions[machine.initialState].y - 8}
                fill="#2563eb"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
                textAnchor="end"
              >
                start
              </text>
            </g>
          )}

          {/* 1. DRAW EDGES */}
          {edges.map((edge) => {
            const isAct = edge.isActive;
            const strokeColor = isAct
              ? '#2563eb' // Blue in light mode / cyan in dark mode
              : '#94a3b8'; // Calm neutral gray when idle
            const strokeWidth = isAct ? 3.5 : 1.8;
            const marker = isAct ? 'url(#clean-arrow-active)' : 'url(#clean-arrow)';

            return (
              <g key={edge.id} className="transition-all duration-300">
                <path
                  d={edge.pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={marker}
                  filter={isAct ? 'url(#diagram-active-glow)' : undefined}
                  strokeDasharray={isAct ? '6 3' : undefined}
                  className={isAct ? 'animate-pulse' : undefined}
                />
              </g>
            );
          })}

          {/* 2. DRAW LABELS OVER EDGES (Separate pass to guarantee no arrow lines cut through labels!) */}
          {edges.map((edge) => {
            const isAct = edge.isActive;
            const pillWidth = Math.max(76, edge.labelText.length * 7.5 + 16);
            const pillHeight = 20;

            return (
              <g key={`lbl-${edge.id}`} className="transition-all duration-300 pointer-events-none">
                {/* Clean background pill so text is 100% legible without line collision */}
                <rect
                  x={edge.labelX - pillWidth / 2}
                  y={edge.labelY - pillHeight / 2}
                  width={pillWidth}
                  height={pillHeight}
                  rx={6}
                  className={
                    isAct
                      ? 'fill-blue-50 stroke-blue-600 dark:fill-slate-900 dark:stroke-cyan-400'
                      : 'fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-700'
                  }
                  strokeWidth={isAct ? '2' : '1'}
                />
                <text
                  x={edge.labelX}
                  y={edge.labelY + 4}
                  textAnchor="middle"
                  className={
                    isAct
                      ? 'fill-blue-700 dark:fill-cyan-300 font-bold'
                      : 'fill-slate-700 dark:fill-slate-300 font-medium'
                  }
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {edge.labelText}
                </text>
              </g>
            );
          })}

          {/* 3. DRAW STATE NODES & TEACHING DESCRIPTIONS */}
          {machine.states.map((st) => {
            const pos = positions[st];
            if (!pos) return null;

            const isActive = currentState === st;
            const isAccept = machine.acceptStates.includes(st);
            const isReject = machine.rejectStates.includes(st);

            let nodeColor = pos.color || '#2563eb';
            if (isAccept) nodeColor = '#16a34a';
            if (isReject) nodeColor = '#dc2626';

            return (
              <g
                key={st}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-default"
              >
                {/* Active Outer Pulsing Aura (Only on the active state) */}
                {isActive && (
                  <circle
                    r="36"
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="animate-spin"
                    style={{ animationDuration: '6s' }}
                    opacity="0.8"
                  />
                )}

                {/* State Node Circle */}
                <circle
                  r="26"
                  className={
                    isActive
                      ? 'fill-blue-50 stroke-blue-600 dark:fill-slate-900 dark:stroke-cyan-400'
                      : 'fill-white stroke-slate-400 dark:fill-slate-900 dark:stroke-slate-600'
                  }
                  stroke={nodeColor}
                  strokeWidth={isActive ? '3.5' : '2'}
                  filter={isActive ? 'url(#diagram-active-glow)' : undefined}
                />

                {/* Double Ring for Halting Accept/Reject States */}
                {(isAccept || isReject) && (
                  <circle
                    r="21"
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth="1.5"
                    strokeDasharray={isReject ? '3 2' : undefined}
                  />
                )}

                {/* State Name */}
                <text
                  y={4}
                  textAnchor="middle"
                  className={
                    isActive
                      ? 'fill-blue-900 dark:fill-white font-extrabold'
                      : 'fill-slate-900 dark:fill-slate-100 font-bold'
                  }
                  fontSize="12"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {pos.label || st}
                </text>

                {/* SHORT TEACHING DESCRIPTION UNDERNEATH (Section 7) */}
                {pos.description && (
                  <g transform="translate(0, 42)">
                    <rect
                      x={-pos.description.length * 3.4 - 8}
                      y={-10}
                      width={pos.description.length * 6.8 + 16}
                      height={16}
                      rx={4}
                      className={
                        isActive
                          ? 'fill-blue-100/90 dark:fill-cyan-950/80 stroke-blue-400 dark:stroke-cyan-700'
                          : 'fill-slate-100 dark:fill-slate-950/80 stroke-slate-200 dark:stroke-slate-800'
                      }
                      strokeWidth="1"
                    />
                    <text
                      y={2}
                      textAnchor="middle"
                      className={
                        isActive
                          ? 'fill-blue-900 dark:fill-cyan-300 font-bold'
                          : 'fill-slate-600 dark:fill-slate-400 font-medium'
                      }
                      fontSize="9.5"
                      fontFamily="Inter, sans-serif"
                    >
                      {pos.description}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Diagram Footer Status */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
        <span className="text-slate-600 dark:text-slate-400">
          Current State: <strong className="text-blue-600 dark:text-cyan-400 font-bold">{currentState}</strong>
        </span>
        <span className="text-slate-600 dark:text-slate-400">
          Active Transition:{' '}
          <strong className="text-purple-600 dark:text-purple-300">
            {activeTransition
              ? `δ(${activeTransition.currentState}, '${activeTransition.readSymbol}') → (${activeTransition.nextState}, '${activeTransition.writeSymbol}', ${activeTransition.moveDirection})`
              : 'Idle'}
          </strong>
        </span>
      </div>
    </div>
  );
};
