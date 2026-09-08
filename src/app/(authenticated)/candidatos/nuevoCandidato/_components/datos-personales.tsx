import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectGroup , SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { paises } from "~/lib/countries";



export default function DatosPersonales() {


    const items = [
      { label: "Seleccionar país" , Value: "" },
      { label: "Argentina" , Value: "Argentina" },
      { label: "Uruguay" , Value: "Uruguay" },
    ]

    return (
      <Card>
      <CardHeader>
        <CardTitle>Datos personales</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombre"  >Nombre completo <span className="text-red-500">*</span> </Label> 
            <Input
              id="nombre"
              placeholder="Ej. Santiago González"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email"  >Correo electrónico <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="nombre@mail.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tel"  > Teléfono </Label> 
            <Input
              id="tel"
              placeholder="Ej. 099 999 999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country"  > País </Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar país" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {items.map((item) => (<SelectItem key={item.Value} value={item.Value}>{item.label}</SelectItem>))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="linkedin"  > LinkedIn </Label>
            <Input
              id="linkedin"
              placeholder="Ej. linkedin.com/in/..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
    )
  }