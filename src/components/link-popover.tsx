"use client";

import { CornerDownLeft, Link2, Trash2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import type { Editor } from "@tiptap/core";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

const linkSchema = z
  .string()
  .trim()
  .min(1, "La URL no puede estar vacía")
  .transform((val) => (/^https?:\/\//i.test(val) ? val : `https://${val}`))
  .refine((val) => {
    try {
      const url = new URL(val);
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  }, "URL inválida");

const BTN_CLASS =
  "aria-pressed:bg-tag-green-bg aria-pressed:text-tag-green-fg aria-expanded:bg-tag-green-bg aria-expanded:text-tag-green-fg";

export function LinkPopover({
  editor,
  isActive,
}: {
  editor: Editor | null;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    setError(null);

    if (nextOpen && editor) {
      setLinkUrl(editor.getAttributes("link").href || "");
    } else if (!nextOpen && editor) {
      editor.commands.focus();
    }
  };

  const applyLink = () => {
    if (!editor) return;

    const result = linkSchema.safeParse(linkUrl);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "URL inválida");
      return;
    }

    const { empty } = editor.state.selection;

    if (empty) {
      const text = linkUrl.trim();
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text,
          marks: [{ type: "link", attrs: { href: result.data } }],
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: result.data })
        .run();
    }

    setOpen(false);
  };

  const removeLink = () => {
    if (!editor) return;

    editor.chain().focus().extendMarkRange("link").unsetLink().run();

    setLinkUrl("");
    setError(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        onMouseDown={(event) => event.preventDefault()}
        aria-pressed={isActive || open}
        aria-label="Insertar enlace"
        title="Insertar enlace"
        className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${BTN_CLASS}`}
      >
        <Link2 className="size-3.5" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-80 rounded-lg border border-border-default bg-popover p-2 shadow-lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyLink();
          }}
          className="flex flex-col gap-1.5"
        >
          <div className="flex items-center gap-1.5">
            <Input
              value={linkUrl}
              type="text"
              aria-label="URL del enlace"
              className="h-8 flex-1 border-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
              onChange={(e) => {
                setLinkUrl(e.target.value);
                setError(null);
              }}
              placeholder="Pega un enlace..."
            />

            <Button
              type="submit"
              variant="ghost"
              size="icon-xs"
              title="Aplicar enlace"
              aria-label="Aplicar enlace"
              disabled={!linkUrl && !isActive}
            >
              <CornerDownLeft className="size-3.5" />
            </Button>

            <span className="h-4 w-px bg-border-default" aria-hidden="true" />

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              title="Quitar enlace"
              aria-label="Quitar enlace"
              disabled={!linkUrl}
              onClick={removeLink}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>

          {error && (
            <p
              className="px-1 text-xs text-destructive font-medium"
              role="alert"
            >
              {error}
            </p>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
}
