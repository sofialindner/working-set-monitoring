use crate::ProcessInfo;
use crate::ProcessList;
use std::{
    ffi::CStr,
    mem::{size_of, zeroed, MaybeUninit},
    os::raw::c_char,
};
use windows_sys::Win32::{
    Foundation::{CloseHandle, HANDLE},
    System::{
        Diagnostics::ToolHelp::{
            CreateToolhelp32Snapshot, Process32First, Process32Next, PROCESSENTRY32,
            TH32CS_SNAPPROCESS,
        },
        ProcessStatus::{
            GetProcessMemoryInfo, PROCESS_MEMORY_COUNTERS, PROCESS_MEMORY_COUNTERS_EX,
        },
        SystemInformation::{GetSystemInfo, SYSTEM_INFO},
        Threading::{
            OpenProcess, TerminateProcess, PROCESS_QUERY_INFORMATION, PROCESS_SET_QUOTA,
            PROCESS_TERMINATE, PROCESS_VM_READ,
        },
    },
};

unsafe fn get_page_size() -> usize {
    let mut s: MaybeUninit<SYSTEM_INFO> = MaybeUninit::uninit();
    GetSystemInfo(s.as_mut_ptr());
    let s = s.assume_init();
    s.dwPageSize as usize
}

unsafe fn get_processes(
    page_size: usize,
    total_cleaned: usize,
) -> Result<ProcessList, String> {
    let mut list = Vec::new();
    let mut index = 0;
    let mut thread_total: u32 = 0;
    let mut working_set_sizes_kb_total: usize = 0;

    let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if snapshot.is_null() || snapshot == -1isize as HANDLE {
        return Err("Erro ao criar snapshot".into());
    }

    let mut entry: PROCESSENTRY32 = zeroed();
    entry.dwSize = size_of::<PROCESSENTRY32>() as u32;

    if Process32First(snapshot, &mut entry) == 0 {
        CloseHandle(snapshot);
        return Err("Falha ao obter primeiro processo".into());
    }

    loop {
        let name = CStr::from_ptr(entry.szExeFile.as_ptr() as *const c_char)
            .to_string_lossy()
            .into_owned();

        let pid = entry.th32ProcessID;

        let h = OpenProcess(
            PROCESS_QUERY_INFORMATION | PROCESS_VM_READ | PROCESS_SET_QUOTA,
            0,
            pid,
        );

        if !h.is_null() {
            let mut mem: PROCESS_MEMORY_COUNTERS_EX = zeroed();
            if GetProcessMemoryInfo(
                h,
                &mut mem as *mut _ as *mut PROCESS_MEMORY_COUNTERS,
                size_of::<PROCESS_MEMORY_COUNTERS_EX>() as u32,
            ) != 0
            {
                let working_set_size_kb = mem.WorkingSetSize / 1024;
                list.push(ProcessInfo {
                    pid,
                    index,
                    name,
                    working_set_size: working_set_size_kb,
                    private_usage: mem.PrivateUsage / 1024,
                    peak_working_set_size: mem.PeakWorkingSetSize / 1024,
                    pages: mem.WorkingSetSize as usize / page_size,
                    page_fault_count: mem.PageFaultCount,
                    page_file_usage: mem.PagefileUsage / 1024,
                    thread_count: entry.cntThreads,
                });

                thread_total += entry.cntThreads;
                working_set_sizes_kb_total += working_set_size_kb;
                index += 1;
            }
            CloseHandle(h);
        }

        if Process32Next(snapshot, &mut entry) == 0 {
            break;
        }
    }
    CloseHandle(snapshot);

    let working_set_sizes_gb_total = working_set_sizes_kb_total as f64 / (1024.0 * 1024.0);

    Ok(ProcessList {
        total: list.len(),
        processes: list,
        thread_total,
        working_set_sizes_kb_total,
        working_set_sizes_gb_total,
        total_cleaned: total_cleaned / 1024,
    })
}

pub unsafe fn terminate_process(pid: u32) -> Result<(), String> {
    let h = OpenProcess(PROCESS_TERMINATE, 0, pid);

    if h.is_null() {
        return Err(format!(
            "Falha ao abrir processo {}: {}",
            pid,
            std::io::Error::last_os_error()
        ));
    }

    let ok = TerminateProcess(h, 1);
    CloseHandle(h);

    if ok == 0 {
        return Err(format!(
            "Falha ao terminar processo {}: {}",
            pid,
            std::io::Error::last_os_error()
        ));
    }

    Ok(())
}

pub fn collect_process_json(total_cleaned: usize) -> Result<String, String> {
    unsafe {
        let page = get_page_size();
        let list = get_processes(page, total_cleaned)?;
        serde_json::to_string(&list).map_err(|e| e.to_string())
    }
}
