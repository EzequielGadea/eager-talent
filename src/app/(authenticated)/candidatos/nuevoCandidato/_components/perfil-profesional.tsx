import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectGroup , SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";


export default function DatosPersonales() {


    const roles = [
      { label: "Seleccionar rol" , Value: "" },
      { label: "Backend Developer" , Value: "Backend Developer" },
      { label: "Frontend Developer" , Value: "Frontend Developer" },
      { label: "Fullstack Developer" , Value: "Fullstack Developer" },
      { label: "QA Engineer" , Value: "QA Engineer" },
    ]
    return (
      <Card>
      <CardHeader>
        <CardTitle>Datos personales</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombre"  > Rol <span className="text-red-500">*</span> </Label> 
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {roles.map((item) => (<SelectItem key={item.Value} value={item.Value}>{item.label}</SelectItem>))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacante"  > Vacante <span className="text-slate-400">(Opcional)</span></Label>
            <Input
              id="vacante"
              type="text"
              placeholder="Ej. Desarrollador Backend"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seniority"  > Seniority </Label>
            <Input
              id="seniority"
              type="text"
              placeholder="Ej. Senior, Junior"
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