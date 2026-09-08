import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectGroup , SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";


export default function DatosPersonales() {


    const source = [
      { label: "Source" , Value: "" },
      { label: "LinkedIn" , Value: "LinkedIn" },
      { label: "referido" , Value: "referido" },
    ]
    return (
      <Card>
      <CardHeader>
        <CardTitle>Datos personales</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="source"  > Source <span className="text-red-500">*</span> </Label> 
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {source.map((item) => (<SelectItem key={item.Value} value={item.Value}>{item.label}</SelectItem>))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comoEscucho"  > ¿Cómo escuchó de nosotros? </Label>
            <Input
              id="comoEscucho"
              type="text"
              placeholder="Ej. A travez de LinkedIn"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags"  > Etiquetas </Label>
            <Input
              id="tags"
              type="text"
              placeholder="Ej. Node, Postgres"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area"  > Área </Label>
            <Input
              id="area"
              type="text"
              placeholder="Ej. Desarrollo, Diseño"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary"  > Salario deseado </Label>
            <Input
              id="salary"
              type="text"
              placeholder="Ej. USD 3.000 - 3.500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="englishLevel"  > Nivel de inglés </Label>
            <Input
              id="englishLevel"
              type="text"
              placeholder="Ej. B1, B2, C1, C2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
    )
  }