"use client";

import { useState } from "react";
import { X } from "lucide-react";

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

  const addTag = (tagId: string) => {
    if (!value.includes(tagId)) {
      onChange([...value, tagId]);
    }

    setSearch("");
  };

  const removeTag = (tagId: string) => {
    onChange(value.filter((id) => id !== tagId));
  };

  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase()) &&
      !value.includes(tag.id),
  );

  return (
    <div className="space-y-2">
      <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border px-3 py-2">
        {value.map((tagId) => {
          const tag = tags.find((tag) => tag.id === tagId);

          if (!tag) {
            return null;
          }

          return (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag.name}

              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="cursor-pointer"
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
            className="text-sm text-muted-foreground"
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
                <CommandEmpty>
                  No se encontraron etiquetas.
                </CommandEmpty>

                <CommandGroup>
                  {filteredTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => addTag(tag.id)}
                    >
                      {tag.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}