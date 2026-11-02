type PublicAttributeProps = {
  label: string;
  value?: string | null;
};

export function PublicAttribute({ label, value }: PublicAttributeProps) {
  return (
    <div className="min-w-0 wrap-anywhere">
      <p className="text-label font-bold tracking-wider uppercase text-text-tertiary">
        {label}
      </p>
      {value?.trim() ? (
        <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">Sin información</p>
      )}
    </div>
  );
}
