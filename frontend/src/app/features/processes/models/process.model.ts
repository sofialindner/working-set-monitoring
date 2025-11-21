export interface Process {
    pid: number;
    name: string;
    workingSet: number;
    hardFaults: number;
}

export type ProcessOrderBy = keyof Process;