/* eslint-disable react-hooks/refs */
"use client";

import { DndContext, PointerSensor, closestCenter, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, GripVertical, Layers3 } from "lucide-react";

import type { BloggerSection, BloggerWidget } from "@/utils/bloggerParser";

interface Props {
  sections: BloggerSection[];
  onReorder: (sectionId: string, activeId: string, overId: string) => void;
  onAddComponent: (sectionId: string, component: { type: string; title: string }) => void;
}

const LIBRARY = [
  { type: "HTML", title: "HTML مخصص" },
  { type: "Image", title: "صورة" },
  { type: "Text", title: "نص" },
  { type: "PopularPosts", title: "أشهر المشاركات" },
  { type: "Label", title: "التصنيفات" },
  { type: "Slider", title: "سلايدر" },
];

function SortableWidget({ widget }: { widget: BloggerWidget }) {
  const id = widget.id ?? widget.title ?? "widget";
  const sortable = useSortable({ id });

  return (
    <div
      ref={sortable.setNodeRef}
      style={{ transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition }}
      {...sortable.attributes}
      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
    >
      <button type="button" {...sortable.listeners} className="cursor-grab text-slate-400" aria-label="سحب الويدجت">
        <GripVertical className="size-4" />
      </button>
      <Box className="size-4 text-slate-500" />
      <div>
        <p className="text-sm font-bold">{widget.title || id}</p>
        <p className="text-[11px] text-slate-400">{widget.type || "HTML"}</p>
      </div>
    </div>
  );
}

function LibraryItem({ item }: { item: (typeof LIBRARY)[number] }) {
  const draggable = useDraggable({ id: `library:${item.type}` });

  return (
    <button
      ref={draggable.setNodeRef}
      type="button"
      {...draggable.attributes}
      {...draggable.listeners}
      className="rounded-xl border border-slate-200 p-3 text-start text-xs font-bold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
      style={{ transform: CSS.Translate.toString(draggable.transform) }}
    >
      {item.title}
    </button>
  );
}

function SectionDropZone({ section, onAddComponent }: { section: BloggerSection; onAddComponent: Props["onAddComponent"] }) {
  const droppable = useDroppable({ id: `section:${section.id ?? "unknown"}` });

  return (
    <div
      ref={droppable.setNodeRef}
      className={`mb-4 rounded-xl border border-dashed p-3 transition ${droppable.isOver ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20" : "border-slate-300 dark:border-slate-700"}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black">{section.id || "قسم"}</p>
          <p className="text-[11px] text-slate-400">{section.widgets.length} ويدجت</p>
        </div>
        <select
          defaultValue=""
          onChange={(event) => {
            const item = LIBRARY.find((entry) => entry.type === event.target.value);
            if (item) onAddComponent(section.id ?? "", item);
            event.currentTarget.value = "";
          }}
          className="rounded-lg border px-2 py-1.5 text-xs"
        >
          <option value="">إضافة مكوّن…</option>
          {LIBRARY.map((item) => <option key={item.type} value={item.type}>{item.title}</option>)}
        </select>
      </div>

      <SortableContext items={section.widgets.map((widget) => widget.id ?? widget.title ?? "widget")} strategy={verticalListSortingStrategy}>
        <div className="min-h-12 space-y-2">
          {section.widgets.map((widget) => <SortableWidget key={widget.id ?? widget.title} widget={widget} />)}
        </div>
      </SortableContext>
    </div>
  );
}

export function LayoutBuilder({ sections, onReorder, onAddComponent }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over) return;

    const active = String(event.active.id);
    const over = String(event.over.id);

    if (active.startsWith("library:")) {
      const type = active.slice("library:".length);
      const item = LIBRARY.find((entry) => entry.type === type);
      if (!item) return;

      const targetSectionId = over.startsWith("section:")
        ? over.slice("section:".length)
        : sections.find((section) => section.widgets.some((widget) => (widget.id ?? widget.title) === over))?.id;

      if (item && targetSectionId) onAddComponent(targetSectionId, item);
      return;
    }

    if (active === over) return;

    const section = sections.find((item) => item.widgets.some((widget) => (widget.id ?? item.id) === active));
    if (section) onReorder(section.id ?? "", active, over);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <section className="space-y-4" dir="rtl">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Layers3 className="size-5 text-slate-500" />
            <h2 className="font-black">باني التخطيط</h2>
          </div>

          {sections.map((section) => <SectionDropZone key={section.id} section={section} onAddComponent={onAddComponent} />)}
          {sections.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">لا توجد أقسام قابلة للبناء.</p> : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 font-black">مكتبة المكونات — اسحب وأفلت</h3>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {LIBRARY.map((item) => <LibraryItem key={item.type} item={item} />)}
          </div>
        </div>
      </section>
    </DndContext>
  );
}
