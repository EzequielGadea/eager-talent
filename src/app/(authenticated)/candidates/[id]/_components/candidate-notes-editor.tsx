"use client";

import BoldExtension from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Document from "@tiptap/extension-document";
import History from "@tiptap/extension-history";
import ItalicExtension from "@tiptap/extension-italic";
import LinkExtension from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { TextStyle } from "@tiptap/extension-text-style";
import UnderlineExtension from "@tiptap/extension-underline";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type JSONContent,
} from "@tiptap/react";
import { Menu } from "@base-ui/react/menu";
import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import { Bold, Italic, Link2, List, Underline } from "lucide-react";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";

import { Button } from "~/components/ui/button";
import Loading from "~/components/ui/loading";
import { api } from "~/lib/trpc/react";

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

const fontSizes = ["16px", "18px", "20px", "26px"] as const;

const TextStyleWithFontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (el: HTMLElement) => el.style.fontSize || null,
        renderHTML: (attrs) =>
          attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
      },
    };
  },
});

const extensions = [
  Document,
  Paragraph,
  Text,
  BoldExtension,
  ItalicExtension,
  BulletList,
  ListItem,
  History,
  UnderlineExtension,
  TextStyleWithFontSize,
  LinkExtension.configure({ autolink: false }),
  Placeholder.configure({ placeholder: "Empezar a escribir nota" }),
];

const formatButtons = [
  { key: "bold", label: "Negrita", icon: Bold, command: "toggleBold" },
  { key: "italic", label: "Cursiva", icon: Italic, command: "toggleItalic" },
  { key: "underline", label: "Subrayado", icon: Underline, command: "toggleUnderline" },
  { key: "bulletList", label: "Lista", icon: List, command: "toggleBulletList" },
] as const;

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
    extensions,
    editorProps: {
      attributes: {
        class:
          "h-130 overflow-y-auto text-base leading-7 text-text-primary caret-success outline-none [&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-text-tertiary [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_a]:cursor-pointer [&_a]:text-text-link [&_a]:underline [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const editVersion = ++editVersionRef.current;
      setStatus("dirty");
      
      const updatedContent = currentEditor.getJSON();
      latestContentRef.current = updatedContent; 
      
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        setStatus("saving");
        
        Promise.all([
          saveNote.mutateAsync({ candidateId, content: updatedContent }),
          new Promise((resolve) => setTimeout(resolve, MINIMUM_SAVING_DELAY_MS)),
        ])
          .then(() => {
            if (editVersion === editVersionRef.current) setStatus("saved");
          })
          .catch(() => {
            if (editVersion === editVersionRef.current) setStatus("error");
          });
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

    const handleVisChange = () =>
      document.visibilityState === "hidden" && flushNow();

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
      fontSize: (e?.getAttributes("textStyle").fontSize as string) || "16px",
    }),
  });

  const setLink = () => {
    if (!editor) return;
    if (editor.isActive("link")) {
      return editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
      
    const result = linkUrlSchema.safeParse(
      window.prompt("URL del enlace", "https://") ?? "",
    );
    
    if (!result.success) return;
    const url = result.data;
    
    if (editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: url,
          marks: [{ type: "link", attrs: { href: url } }],
        })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  return (
    <section
      id={`candidate-notes-${candidateId}`}
      className="overflow-hidden rounded-xl border border-border-default bg-(--surface-card) shadow-sm"
    >
      <header className="flex items-center justify-between border-b border-border-default px-4 py-3.5">
        <h2 className="text-sm font-semibold text-text-primary">
          Notas / Comentarios
        </h2>
        <span
          className={`inline-flex items-center gap-2 text-xs font-medium ${STATUS_CONFIG[status].text}`}
        >
          <span className={`size-1.5 rounded-full ${STATUS_CONFIG[status].dot}`} />
          {STATUS_CONFIG[status].label}
        </span>
      </header>

      <div className="flex flex-wrap items-center gap-1 border-b border-border-default px-3 py-2 text-text-secondary">
        <Menu.Root>
          <Menu.Trigger
            render={
              <Button
                variant="ghost"
                size="xs"
                onMouseDown={(e) => e.preventDefault()}
                className={`rounded-md px-2 text-sm font-medium text-text-secondary hover:bg-(--surface-hover) hover:text-text-primary ${activeButtonClassName}`}
              >
                {activeFormats?.fontSize.replace("px", "") ?? "16"}{" "}
                <span className="text-xs">▾</span>
              </Button>
            }
          />
          <Menu.Portal>
            <Menu.Positioner sideOffset={4} align="start">
              <Menu.Popup className="min-w-20 rounded-md border border-border-default bg-(--surface-card) p-1 text-sm shadow-md outline-none">
                {fontSizes.map((size) => (
                  <Menu.Item
                    key={size}
                    onClick={() =>
                      editor?.chain().focus().setMark("textStyle", { fontSize: size }).run()
                    }
                    className="cursor-pointer rounded px-2 py-1.5 text-text-secondary outline-none data-highlighted:bg-tag-green-bg data-highlighted:text-tag-green-fg"
                  >
                    {size.replace("px", "")}
                  </Menu.Item>
                ))}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>

        <span className="mx-1 h-4 w-px bg-border-default" aria-hidden="true" />

        {formatButtons.map(({ key, label, icon: Icon, command }) => (
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

        <Button
          variant="ghost"
          size="icon-xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={setLink}
          aria-pressed={activeFormats?.link}
          aria-label="Compartir enlace"
          className={`rounded-md text-text-secondary hover:bg-(--surface-hover) hover:text-text-primary ${activeButtonClassName}`}
        >
          <Link2 className="size-3.5" />
        </Button>
      </div>

      <div className="px-4 py-4">
        {editor ? (
          <EditorContent editor={editor} aria-label="Notas del candidato" />
        ) : (
          <Loading />
        )}
      </div>

      <footer className="border-t border-border-default px-4 py-3 text-[11px] text-text-tertiary">
        Ultima edicion:{" "}
        <span suppressHydrationWarning>
          {formatLastEditedAt(lastModifiedAt)}
        </span>
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