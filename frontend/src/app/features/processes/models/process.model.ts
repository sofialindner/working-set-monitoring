export interface Process {
    pid: number;
    name: String;
    working_set_size: number;
    private_usage?: number;
    peak_working_set_size?: number;
    pages?: number;
    page_fault_count: number;
    page_file_usage?: number;
}

export type ProcessOrderBy = keyof Process;