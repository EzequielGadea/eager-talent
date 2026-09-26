export type Stages = Stage[]

export type Stage = {
    key: string;
    name: string;
    type: string;
    label: string;
}

export type Template = {id:string, stages:Stages}