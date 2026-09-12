"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { api } from "~/lib/trpc/react";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";

import { Badge } from "~/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

type Tag = {
  id: string;
  name: string;
  color: string;
};

type Props = {
  tags: Tag[];
  value: string[];
  onChange: (tags: string[]) => void;
};

export function TagSelector({
  tags,
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newTagColor, setNewTagColor] = useState("");
  const [newTagIsSkill, setNewTagIsSkill] = useState(false);
  const getDefaultTagColor = () =>
  getComputedStyle(document.documentElement)
    .getPropertyValue("--tag-default-color")
    .trim();
  const utils = api.useUtils();

  const createTag = api.tag.createTag.useMutation({
    onSuccess: async () => {
      await utils.tag.getAllTags.invalidate();
    },
  });

  const handleCreateTag = async () => {
    const newTag = await createTag.mutateAsync({
      name: search.trim(),
      color: newTagColor,
      isSkill: newTagIsSkill,
    });

    onChange([...value, newTag.id]);

    setSearch("");
   
    closeCreateForm();
  };

  const addTag = (tagId: string) => {
    if (!value.includes(tagId)) {
      onChange([...value, tagId]);
    }

    setSearch("");
     closeCreateForm();
  };

  const removeTag = (tagId: string) => {
    onChange(value.filter((id) => id !== tagId));
  };

  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase()) &&
      !value.includes(tag.id),
  );



  const tagAlreadyExists = tags.some(
    (tag) => tag.name.toLowerCase() === search.trim().toLowerCase(),
  );
  const closeCreateForm = () => {
    setCreating(false);
    setNewTagColor(getDefaultTagColor());
    setNewTagIsSkill(false);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-border-default px-3 py-2">
        {value.map((tagId) => {
          const tag = tags.find((tag) => tag.id === tagId);

          if (!tag) {
            return null;
          }

          return (
            <Badge
              key={tag.id}
              variant="outline"
              style={{
                backgroundColor: `${tag.color}20`,
                borderColor: `${tag.color}60`,
                color: tag.color,
              }}
            >
              {tag.name}

              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-1 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}

        <Popover
          open={open}
          onOpenChange={setOpen}
        >
          <PopoverTrigger
            type="button"
            className="text-sm text-text-secondary"
          >
            Agregar etiqueta
          </PopoverTrigger>

          <PopoverContent className="w-64 p-0">
            <Command>
              <CommandInput
                placeholder="Buscar etiqueta..."
                value={search}
                onValueChange={setSearch}
              />

             <CommandList>
  {filteredTags.length > 0 && (
    <CommandGroup>
      {filteredTags.map((tag) => (
        <CommandItem
          key={tag.id}
          value={tag.name}
          onSelect={() => addTag(tag.id)}
        >
          <Badge
            variant="outline"
            style={{
              backgroundColor: `${tag.color}20`,
              borderColor: `${tag.color}60`,
              color: tag.color,
            }}
          >
            {tag.name}
          </Badge>
        </CommandItem>
      ))}
    </CommandGroup>
  )}

  {search.trim() !== "" && !tagAlreadyExists && !creating && (
    <CommandGroup>
      <CommandItem
        value={search}
        onSelect={() => {
          setNewTagColor(getDefaultTagColor());
          setCreating(true);
        }}
      >
        <Badge
          className="border-tag-green-fg bg-tag-green-bg text-tag-green-fg hover:bg-tag-green-bg"
          variant="outline"
        >
          + Crear
        </Badge>
      </CommandItem>
    </CommandGroup>
  )}

{creating && (
  <div className="space-y-3 border-t p-3">
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium">
        Color
      </label>

      <input
        type="color"
        value={newTagColor}
        onChange={(e) => setNewTagColor(e.target.value)}
        className="h-7 w-9 cursor-pointer"
      />
    </div>

    <div className="flex items-center justify-between">
      <label className="text-xs font-medium">
        Skill
      </label>

      <Switch
        checked={newTagIsSkill}
        onCheckedChange={setNewTagIsSkill}
      />
    </div>
    <Button
      className="w-full rounded-md bg-accent-green-strong px-3 py-1.5 text-xs text-text-on-dark"
      type="button"
      variant="outline"
      size="sm"
      onClick={closeCreateForm}
    >
      Cancelar
    </Button>

    <Button
      type="button"
      variant="outline"
      onClick={handleCreateTag}
      className="w-full rounded-md bg-accent-green-strong px-3 py-1.5 text-xs text-text-on-dark"
    >
      Crear etiqueta
    </Button>
  </div>
)}


</CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}