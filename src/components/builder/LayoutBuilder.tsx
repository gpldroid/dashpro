"use client";

import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
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
  { type: "Slider", title: "سلايدر" }
] as const;

function widgetId(widget: BloggerWidget) {
  return widget.id ?? widget.title ?? "widget";
}

function SortableWidget({ widget, index }: { widget: BloggerWidget; index: number }) {
  const id = widgetId(widget);
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex items-center gap-2 rounded-xl border p-3 ${snapshot.isDragging ? "border-indigo-500 bg-indigo-50 shadow-lg" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}
        >
          <button type="button" {...provided.dragHandleProps} className="cursor-grab text-slate-400" aria-label="سحب الويدجت">
            <GripVertical className="size-4" />
          </button>
          <Box className="size-4 text-slate-500" />
          <div>
            <p className="text-sm font-bold">{widget.title || id}</p>
            <p className="text-[11px] text-slate-400">{widget.type || "HTML"}</p>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function SectionDropZone({ section, onAddComponent }: { section: BloggerSection; onAddComponent: Props["onAddComponent"] }) {
  const sectionId = section.id ?? "section";
  return (
    <div className="mb-4 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black">{sectionId}</p>
          <p className="text-[11px] text-slate-400">{section.widgets.length} ويدجت</p>
        </div>
        <select
          defaultValue=""
          onChange={(event) => {
            const item = LIBRARY.find((entry) => entry.type === event.target.value);
            if (item) onAddComponent(sectionId, item);
            event.currentTarget.value = "";
          }}
          className="rounded-lg border px-2 py-1.5 text-xs"
        >
          <option value="">إضافة مكوّن…</option>
          {LIBRARY.map((item) => <option key={item.type} value={item.type}>{item.title}</option>)}
        </select>
      </div>

      <Droppable droppableId={`section:${sectionId}`} type="WIDGET">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-12 space-y-2 rounded-lg p-1 transition ${snapshot.isDraggingOver ? "bg-indigo-50/70 dark:bg-indigo-950/30" : ""}`}
          >
            {section.widgets.map((widget, index) => (
              <SortableWidget key={widgetId(widget)} widget={widget} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export function LayoutBuilder({ sections, onReorder, onAddComponent }: Props) {
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;

    if (type === "LIBRARY") {
      const item = LIBRARY.find((entry) => entry.type === draggableId.replace("library:", ""));
      const target = destination.droppableId.startsWith("section:") ? destination.droppableId.slice(8) : "";
      if (item && target) onAddComponent(target, item);
      return;
    }

    if (type !== "WIDGET") return;
    const sourceSection = source.droppableId.replace("section:", "");
    const destinationSection = destination.droppableId.replace("section:", "");
    if (sourceSection === destinationSection && source.index === destination.index) return;

    const sourceWidgets = sections.find((section) => (section.id ?? "") === sourceSection)?.widgets ?? [];
    const targetWidget = sections.find((section) => (section.id ?? "") === destinationSection)?.widgets[destination.index];
    const overId = targetWidget ? widgetId(targetWidget) : widgetId(sourceWidgets[source.index] ?? { id: draggableId });
    onReorder(destinationSection, draggableId, overId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <section className="space-y-4" dir="rtl">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Layers3 className="size-5 text-slate-500" />
            <h2 className="font-black">باني التخطيط</h2>
          </div>
          {sections.map((section) => <SectionDropZone key={section.id} section={section} onAddComponent={onAddComponent} />)}
          {sections.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">لا توجد أقسام قابلة للبناء.</p>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 font-black">مكتبة المكونات — اسحب وأفلت</h3>
          <Droppable droppableId="library" type="LIBRARY" direction="horizontal">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {LIBRARY.map((item, index) => (
                  <Draggable key={item.type} draggableId={`library:${item.type}`} index={index}>
                    {(dragProvided) => (
                      <button
                        ref={dragProvided.innerRef}
                        type="button"
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className="rounded-xl border border-slate-200 p-3 text-start text-xs font-bold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                      >
                        {item.title}
                      </button>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </section>
    </DragDropContext>
  );
}
