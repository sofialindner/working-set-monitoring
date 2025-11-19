use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub index: u32,
    pub name: String,
    pub working_set_size: usize,
    pub private_usage: usize,
    pub peak_working_set_size: usize,
    pub pages: usize,
    pub page_fault_count: u32,
    pub page_file_usage: usize,
}

#[derive(Serialize, Deserialize)]
pub struct ProcessList {
    pub total: usize,
    pub processes: Vec<ProcessInfo>,
}