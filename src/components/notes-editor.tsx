"use client";

import {
  Bold,
  ChevronDown,
  Italic,
  List,
  Underline,
} from "lucide-react";
import TimeAgo from "react-timeago";
import spanishStrings from "react-timeago/lib/language-strings/es";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import type { Editor } from "@tiptap/core";
import { Bold as BoldExtension } from "@tiptap/extension-bold";
import { BulletList } from "@tiptap/extension-bullet-list";
import { Document } from "@tiptap/extension-document";
import { Heading, type Level } from "@tiptap/extension-heading";
import { Italic as ItalicExtension } from "@tiptap/extension-italic";
import { Link as LinkExtension } from "@tiptap/extension-link";
import { ListItem } from "@tiptap/extension-list-item";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { Underline as UnderlineExtension } from "@tiptap/extension-underline";
import { Selection } from "@tiptap/extensions/selection";
import { UndoRedo } from "@tiptap/extensions/undo-redo";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type JSONContent,
} from "@tiptap/react";

import { Button } from "~/components/ui/button";
import { LinkPopover } from "~/components/link-popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import Loading from "~/components/ui/loading";

const STATUS_UI: Record<string, { label: string; dot: string; text: string }> = {
  idle: { label: "Listo para editar", dot: "bg-success", text: "text-tag-green-fg" },
  dirty: { label: "Editando", dot: "bg-success", text: "text-tag-green-fg" },
  saving: { label: "Guardando...", dot: "bg-warning", text: "text-warning" },
  saved: { label: "Guardado", dot: "bg-success", text: "text-tag-green-fg" },
  error: { label: "No se pudo guardar", dot: "bg-danger", text: "text-danger" },
};

const BTN_CLASS =
  "aria-pressed:bg-tag-green-bg aria-pressed:text-tag-green-fg aria-expanded:bg-tag-green-bg aria-expanded:text-tag-green-fg";

const HEADINGS = [
  { label: "Normal", level: 0 },
  { label: "Encabezado 1", level: 1 },
  { label: "Encabezado 2", level: 2 },
] as const;

const FORMATS = [
  { key: "bold", label: "Negrita", icon: Bold, action: (e: Editor) => e.chain().focus().toggleBold().run() },
  { key: "italic", label: "Cursiva", icon: Italic, action: (e: Editor) => e.chain().focus().toggleItalic().run() },
  { key: "underline", label: "Subrayado", icon: Underline, action: (e: Editor) => e.chain().focus().toggleUnderline().run() },
  { key: "bulletList", label: "Lista", icon: List, action: (e: Editor) => e.chain().focus().toggleBulletList().run() },
] as const;

const EXTENSIONS = [
  Document,
  Heading.configure({ levels: [1, 2] }),
  Paragraph,
  Text,
  BoldExtension,
  ItalicExtension,
  BulletList,
  ListItem,
  UndoRedo,
  UnderlineExtension,
  Selection.configure({ className: "selection" }),
  LinkExtension.configure({ autolink: false, openOnClick: true }),
];

const AUTOSAVE_DELAY_MS = 1000;
const SAVED_STATUS_DELAY_MS = 500;
const baseSpanishFormatter = buildFormatter(spanishStrings);

const spanishFormatter: typeof baseSpanishFormatter = (
  value,
  unit,
  suffix,
  epochMilliseconds,
  nextFormatter,
  now
) => {
  if (unit === "second") return "ahora mismo";
  return baseSpanishFormatter(value, unit, suffix === "from now" ? "ago" : suffix, epochMilliseconds, nextFormatter, now);
};

export type NotesEditorProps = {
  id: string;
  content: unknown;
  lastModifiedAt: string | null;
  title?: string;
  editorAriaLabel?: string;
  onSave: (content: JSONContent) => Promise<{ lastModified: string }>;
};

export function NotesEditor({
  id,
  content,
  lastModifiedAt: initialLastModified,
  title = "Notas / Comentarios",
  editorAriaLabel = "Notas",
  onSave,
}: NotesEditorProps) {
  const [status, setStatus] = useState<keyof typeof STATUS_UI>("idle");
  const [lastModified, setLastModified] = useState(initialLastModified);
  const statusRef = useRef(status);

  const debouncedSave = useDebouncedCallback(async (jsonContent: JSONContent) => {
    setStatus("saving");
    try {
      const result = await onSave(jsonContent);
      setLastModified(result.lastModified);
      await new Promise((resolve) => setTimeout(resolve, SAVED_STATUS_DELAY_MS));
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, AUTOSAVE_DELAY_MS);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const editor = useEditor({
    immediatelyRender: false,
    content: (content as JSONContent | string | null) ?? "",
    extensions: EXTENSIONS,
    editorProps: {
      attributes: {
        "aria-label": editorAriaLabel,
        class:
          "h-130 overflow-y-auto text-base leading-relaxed text-text-primary caret-success selection:bg-tag-green-bg selection:text-tag-green-fg [&_.selection]:bg-slate-200 outline-none [&_a]:cursor-pointer [&_a]:text-text-link [&_a]:underline [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_h1]:text-2xl [&_h1]:font-normal [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-normal [&_h2]:mb-2",
      },
    },
    onUpdate: ({ editor }) => {
      setStatus("dirty");
      
      const latestJson = structuredClone(editor.getJSON());
      
      debouncedSave(latestJson);
    },
  });

  // Flush on unmount. Prompt the user if there is unsaved content.
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (statusRef.current !== "dirty") return;

      debouncedSave.flush();
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      debouncedSave.flush();
    };
  }, [debouncedSave]);

  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive("bold") ?? false,
      italic: e?.isActive("italic") ?? false,
      underline: e?.isActive("underline") ?? false,
      bulletList: e?.isActive("bulletList") ?? false,
      headingLevel: HEADINGS.find((h) => e?.isActive("heading", { level: h.level }))?.level ?? 0,
    }),
  });

  return (
    <section
      id={id}
      className="overflow-hidden rounded-xl border border-border-default bg-card shadow-sm"
    >
      <header
        className="flex items-center justify-between border-b border-border-default px-4 py-3.5"
      >
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        <span className={`inline-flex items-center gap-2 text-xs font-medium ${STATUS_UI[status].text}`}>
          <span className={`size-1.5 rounded-full ${STATUS_UI[status].dot}`} />
          {STATUS_UI[status].label}
        </span>
      </header>

      <div
        data-editor-toolbar
        onMouseDown={(event) => event.preventDefault()}
        className="flex flex-wrap items-center gap-1 border-b border-border-default px-3 py-2 text-text-secondary"
      >
        <DropdownMenu
          onOpenChange={(open) => {
            if (!open) editor?.commands.focus();
          }}
        >
          <DropdownMenuTrigger render={
            <Button
              variant="ghost"
              size="xs"
              title="Formato de texto"
              className={`w-32 justify-between rounded-md px-2 text-sm font-medium hover:bg-muted hover:text-text-primary ${BTN_CLASS}`}
            >
              {HEADINGS.find((h) => h.level === active?.headingLevel)?.label ?? "Normal"}
              <ChevronDown className="size-3.5" aria-hidden="true" />
            </Button>
          } />
          <DropdownMenuContent
            align="start"
            className="min-w-28"
          >
            {HEADINGS.map(({ label, level }) => (
              <DropdownMenuItem
                key={level}
                onClick={() =>
                  level === 0 ? editor?.chain().focus().setParagraph().run() : editor?.chain().focus().setHeading({ level: level as Level }).run()
                }
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="mx-1 h-4 w-px bg-border-default" aria-hidden="true" />

        {FORMATS.map(({ key, label, icon: Icon, action }) => (
          <Button
            key={key}
            variant="ghost"
            size="icon-xs"
            onClick={() => editor && action(editor)}
            aria-pressed={active?.[key as keyof typeof active] as boolean}
            aria-label={label}
            title={label}
            className={`rounded-md hover:bg-muted hover:text-text-primary ${BTN_CLASS}`}
          >
            <Icon className="size-3.5" />
          </Button>
        ))}

        <span className="mx-1 h-4 w-px bg-border-default" aria-hidden="true" />

        <LinkPopover editor={editor} />
      </div>

      <div className="relative px-4 py-4">
        {editor ? <EditorContent editor={editor} /> : <Loading />}
      </div>

      <footer className="border-t border-border-default px-4 py-3 text-[11px] text-text-tertiary">
        Última edición: <LastModifiedText dateStr={lastModified} />
      </footer>
    </section>
  );
}

function LastModifiedText({ dateStr }: { dateStr: string | null }) {
  if (!dateStr) return <span>--:--</span>;

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return <span>--:--</span>;

  const fullDateLabel = date.toLocaleString("es", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <span suppressHydrationWarning>
      <TimeAgo
        date={date}
        formatter={spanishFormatter}
        title={fullDateLabel}
        minPeriod={10}
      />
    </span>
  );
}