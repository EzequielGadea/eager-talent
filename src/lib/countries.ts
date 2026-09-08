import countries from "i18n-iso-countries";
import es from "i18n-iso-countries/langs/es.json";

countries.registerLocale(es);

export const paises = Object.entries(
  countries.getNames("es", { select: "official" })
)
  .map(([codigo, nombre]) => ({
    codigo,
    nombre,
  }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));