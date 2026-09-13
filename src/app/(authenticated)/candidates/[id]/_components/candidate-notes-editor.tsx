"use client";

import BoldExtension from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Document from "@tiptap/extension-document";
import Heading, { type Level } from "@tiptap/extension-heading";
import History from "@tiptap/extension-history";
import ItalicExtension from "@tiptap/extension-italic";
import LinkExtension from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import UnderlineExtension from "@tiptap/extension-underline";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type JSONContent,
} from "@tiptap/react";
import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import { Bold, Italic, Link2, List, Underline } from "lucide-react";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import Loading from "~/components/ui/loading";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "~/components/ui/popover";
import { api } from "~/lib/trpc/react";

// --- Configuration Constants ---
const AUTOSAVE_DELAY_MS = 1000;
const MINIMUM_SAVING_DELAY_MS = 500;

const linkUrlSchema = z.string().trim().url({ message: "URL inválida" });

type EditorStatus = "idle" | "dirty" | "saving" | "saved" | "error";

const STATUS_CONFIG: Record<
  EditorStatus,
  { label: string; dot: string; text: string }
> = {
  idle: { label: "Listo para editar", dot: "bg-success", text: "text-tag-green-fg" },
  dirty: { label: "Editando", dot: "bg-success", text: "text-tag-green-fg" },
  saving: { label: "Guardando...", dot: "bg-warning", text: "text-warning" },
  saved: { label: "Guardado", dot: "bg-success", text: "text-tag-green-fg" },
  error: { label: "No se pudo guardar", dot: "bg-danger", text: "text-danger" },
};

const activeButtonClassName =
  "aria-pressed:bg-tag-green-bg aria-pressed:text-tag-green-fg aria-expanded:bg-tag-green-bg aria-expanded:text-tag-green-fg";

const HEADING_OPTIONS = [
  { label: "Normal", level: 0 },
  { label: "Encabezado 1", level: 1 },
  { label: "Encabezado 2", level: 2 },
] as const;

const FORMAT_BUTTONS = [
  { key: "bold", label: "Negrita", icon: Bold, command: "toggleBold" },
  { key: "italic", label: "Cursiva", icon: Italic, command: "toggleItalic" },
  { key: "underline", label: "Subrayado", icon: Underline, command: "toggleUnderline" },
  { key: "bulletList", label: "Lista", icon: List, command: "toggleBulletList" },
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
  History,
  UnderlineExtension,
  LinkExtension.configure({ autolink: false, openOnClick: false }),
];

// --- Component ---
type CandidateNotesEditorProps = {
  candidateId: string;
  content: unknown;
  lastModifiedAt: string | null;
};

export function CandidateNotesEditor({
  candidateId,
  content,
  lastModifiedAt: initialLastModifiedAt,
}: CandidateNotesEditorProps) {
  const [status, setStatus] = useState<EditorStatus>("idle");
  const [lastModifiedAt, setLastModifiedAt] = useState(initialLastModifiedAt);

  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkError, setLinkError] = useState<string | null>(null);
  
  const linkSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const isEditingLinkRef = useRef(isEditingLink);
  
  useEffect(() => {
    isEditingLinkRef.current = isEditingLink;
  }, [isEditingLink]);

  const initialContent = (content as JSONContent) || "";
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editVersionRef = useRef(0);
  const latestContentRef = useRef<JSONContent | string>(initialContent);

  const saveNote = api.candidateNote.save.useMutation({
    onSuccess: (data) => setLastModifiedAt(data.lastModified),
  });

  const editor = useEditor({
    immediatelyRender: false,
    content: initialContent,
    extensions: EXTENSIONS,
    editorProps: {
      attributes: {
        class:
          "h-130 overflow-y-auto text-base leading-relaxed text-text-primary caret-success outline-none " +
          "[&_a]:cursor-pointer [&_a]:text-text-link [&_a]:underline [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 " +
          "[&_h1]:text-2xl [&_h1]:font-normal [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-normal [&_h2]:mb-2",
      },
    },
    onSelectionUpdate: ({ editor: currentEditor, transaction }) => {
      if (currentEditor.isActive("link")) {
        setLinkUrl(currentEditor.getAttributes("link").href);
      }
      if (transaction.selectionSet && isEditingLinkRef.current) setIsEditingLink(false);
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (isEditingLinkRef.current) setIsEditingLink(false);

      const editVersion = ++editVersionRef.current;
      setStatus("dirty");
      latestContentRef.current = currentEditor.getJSON();

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        setStatus("saving");

        Promise.all([
          saveNote.mutateAsync({ candidateId, content: latestContentRef.current }),
          new Promise((resolve) => setTimeout(resolve, MINIMUM_SAVING_DELAY_MS)),
        ])
          .then(() => editVersion === editVersionRef.current && setStatus("saved"))
          .catch(() => editVersion === editVersionRef.current && setStatus("error"));
      }, AUTOSAVE_DELAY_MS);
    },
  });

  useEffect(() => {
    const flushNow = () => {
      if (!saveTimeoutRef.current) return;
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
      saveNote.mutate({ candidateId, content: latestContentRef.current });
    };

    const handleVisChange = () => document.visibilityState === "hidden" && flushNow();

    document.addEventListener("visibilitychange", handleVisChange);
    window.addEventListener("pagehide", flushNow);
    window.addEventListener("beforeunload", flushNow);

    return () => {
      flushNow();
      document.removeEventListener("visibilitychange", handleVisChange);
      window.removeEventListener("pagehide", flushNow);
      window.removeEventListener("beforeunload", flushNow);
    };
  }, [candidateId, saveNote]);

  const activeFormats = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive("bold") ?? false,
      italic: e?.isActive("italic") ?? false,
      underline: e?.isActive("underline") ?? false,
      bulletList: e?.isActive("bulletList") ?? false,
      link: e?.isActive("link") ?? false,
      headingLevel: [1, 2].find((l) => e?.isActive("heading", { level: l })) ?? 0,
    }),
  });

  const handleToggleLinkMenu = () => {
    if (isEditingLink) return setIsEditingLink(false);
    if (!editor) return;

    linkSelectionRef.current = {
      from: editor.state.selection.from,
      to: editor.state.selection.to,
    };
    setLinkUrl(editor.getAttributes("link").href || "https://");
    setLinkError(null);
    setIsEditingLink(true);
  };

  const applyLink = () => {
    if (!editor) return;
    const result = linkUrlSchema.safeParse(linkUrl);
    if (!result.success) return setLinkError(result.error.issues[0]?.message ?? "URL inválida");

    if (linkSelectionRef.current) editor.commands.setTextSelection(linkSelectionRef.current);

    if (editor.state.selection.empty && !editor.isActive("link")) {
      editor.chain().focus().insertContent({
        type: "text",
        text: result.data,
        marks: [{ type: "link", attrs: { href: result.data } }],
      }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: result.data }).run();
    }
    
    setIsEditingLink(false);
  };

  const removeLink = () => {
    if (editor && linkSelectionRef.current) editor.commands.setTextSelection(linkSelectionRef.current);
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsEditingLink(false);
  };

  return (
    <section
      id={`candidate-notes-${candidateId}`}
      className="overflow-hidden rounded-xl border border-border-default bg-(--surface-card) shadow-sm"
    >
      <header className="flex items-center justify-between border-b border-border-default px-4 py-3.5">
        <h2 className="text-sm font-semibold text-text-primary">Notas / Comentarios</h2>
        <span className={`inline-flex items-center gap-2 text-xs font-medium ${STATUS_CONFIG[status].text}`}>
          <span className={`size-1.5 rounded-full ${STATUS_CONFIG[status].dot}`} />
          {STATUS_CONFIG[status].label}
        </span>
      </header>

      <div className="flex flex-wrap items-center gap-1 border-b border-border-default px-3 py-2 text-text-secondary">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="xs"
                onMouseDown={(e) => e.preventDefault()}
                aria-label="Formato de encabezado"
                className={`w-32 justify-between rounded-md px-2 text-sm font-medium text-text-secondary hover:bg-(--surface-hover) hover:text-text-primary ${activeButtonClassName}`}
              >
                {HEADING_OPTIONS.find(({ level }) => level === activeFormats?.headingLevel)?.label ?? "Normal"}
                <span className="text-xs">▾</span>
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="min-w-28">
            {HEADING_OPTIONS.map(({ label, level }) => (
              <DropdownMenuItem
                key={level}
                onClick={() => {
                  if (!editor) return;
                  if (level === 0) editor.chain().focus().setParagraph().run();
                  else editor.chain().focus().setHeading({ level: level as Level }).run();
                }}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="mx-1 h-4 w-px bg-border-default" aria-hidden="true" />

        {FORMAT_BUTTONS.map(({ key, label, icon: Icon, command }) => (
          <Button
            key={key}
            variant="ghost"
            size="icon-xs"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus()[command]().run()}
            aria-pressed={activeFormats?.[key]}
            aria-label={label}
            className={`rounded-md text-text-secondary hover:bg-(--surface-hover) hover:text-text-primary ${activeButtonClassName}`}
          >
            <Icon className="size-3.5" />
          </Button>
        ))}

        <span className="mx-1 h-4 w-px bg-border-default" aria-hidden="true" />

        <Popover
          open={isEditingLink}
          onOpenChange={(open) => {
            if (open) {
              handleToggleLinkMenu();
            } else {
              setIsEditingLink(false);
              setLinkError(null);
            }
          }}
        >
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onMouseDown={(e) => e.preventDefault()}
                aria-pressed={activeFormats?.link || isEditingLink}
                aria-label="Insertar enlace"
                className={`rounded-md text-text-secondary hover:bg-(--surface-hover) hover:text-text-primary ${activeButtonClassName}`}
              >
                <Link2 className="size-3.5" />
              </Button>
            }
          />
          <PopoverContent align="end" className="w-80">
            <PopoverHeader>
              <PopoverTitle>Insertar enlace</PopoverTitle>
              <PopoverDescription>Añade o edita un enlace en la nota.</PopoverDescription>
            </PopoverHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                applyLink();
              }}
              className="flex flex-col gap-3"
            >
              <Input
                autoFocus
                label="URL"
                value={linkUrl}
                onChange={(e) => {
                  setLinkUrl(e.target.value);
                  setLinkError(null);
                }}
                errorMessage={linkError ?? undefined}
                placeholder="https://ejemplo.com"
              />
              <div className="flex justify-end gap-2 pt-1">
                {activeFormats?.link && (
                  <Button type="button" variant="ghost" size="sm" onClick={removeLink}>
                    Quitar
                  </Button>
                )}
                <Button type="submit" size="sm">
                  Aplicar
                </Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>
      </div>

      <div className="relative px-4 py-4">
        {editor ? <EditorContent editor={editor} aria-label="Notas del candidato" /> : <Loading />}
      </div>

      <footer className="border-t border-border-default px-4 py-3 text-[11px] text-text-tertiary">
        Última edición: <span suppressHydrationWarning>{formatLastEditedAt(lastModifiedAt)}</span>
      </footer>
    </section>
  );
}

// ---------------- Helpers ---------------- //

function formatLastEditedAt(lastModifiedAt: string | null) {
  if (!lastModifiedAt) return "--:--";
  const date = new Date(lastModifiedAt);
  if (Number.isNaN(date.getTime())) return "--:--";
  return Date.now() - date.getTime() < 60_000
    ? "ahora mismo"
    : formatDistanceToNowStrict(date, { addSuffix: true, locale: es });
}