"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createContext, useContext, useId } from "react";

type HandleProps = ReturnType<typeof useSortable>["listeners"] & ReturnType<typeof useSortable>["attributes"];
const HandleCtx = createContext<HandleProps | null>(null);

/** Vertical drag-and-drop list (mouse, touch and keyboard: Space to lift, arrows to move). */
export function SortableList<T>({
  items,
  getId,
  onReorder,
  children,
}: {
  items: T[];
  getId: (item: T) => string;
  onReorder: (next: T[]) => void;
  children: (item: T, index: number) => React.ReactNode;
}) {
  // Stable id keeps dnd-kit's aria-describedby identical on server and client (no hydration mismatch).
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => getId(i) === active.id);
    const to = items.findIndex((i) => getId(i) === over.id);
    onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map(getId)} strategy={verticalListSortingStrategy}>
        {items.map((item, i) => (
          <SortableItem key={getId(item)} id={getId(item)}>
            {children(item, i)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, transform, transition, isDragging, listeners, attributes } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative ${isDragging ? "z-10 bg-bg opacity-90 shadow-[0_0_0_1px_var(--fg)]" : ""}`}
    >
      <HandleCtx.Provider value={{ ...listeners, ...attributes } as HandleProps}>{children}</HandleCtx.Provider>
    </div>
  );
}

/** Put inside a sortable item to make it draggable from this handle only. */
export function DragHandle({ label = "Drag to reorder" }: { label?: string }) {
  const props = useContext(HandleCtx);
  return (
    <button
      type="button"
      aria-label={label}
      {...props}
      className="grid size-9 shrink-0 cursor-grab touch-none place-items-center rounded-full text-muted hover:bg-accent/15 hover:text-accent-text active:cursor-grabbing"
    >
      <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden fill="currentColor">
        {[0, 6, 12].map((y) => [0, 6].map((x) => <circle key={`${x}${y}`} cx={x + 2} cy={y + 2} r="1.5" />))}
      </svg>
    </button>
  );
}
