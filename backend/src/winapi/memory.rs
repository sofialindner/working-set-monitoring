use std::mem::{size_of, zeroed};
use windows_sys::Win32::{
    Foundation::{CloseHandle, HANDLE},
    System::{
        ProcessStatus::{
            GetProcessMemoryInfo, PROCESS_MEMORY_COUNTERS, PROCESS_MEMORY_COUNTERS_EX,
        },
        Threading::{OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_SET_QUOTA},
    },
};

// FFI
#[link(name = "kernel32")]
extern "system" {
    fn SetProcessWorkingSetSize(
        hProcess: HANDLE,
        dwMinimumWorkingSetSize: usize,
        dwMaximumWorkingSetSize: usize,
    ) -> i32;
}

pub fn clear_working_set(pid: u32) -> Result<(String, usize), String> {
    unsafe {
        let h = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_SET_QUOTA, 0, pid);
        if h.is_null() {
            return Err(format!("Falha ao abrir processo {}", pid));
        }

        let mut before: PROCESS_MEMORY_COUNTERS_EX = zeroed();
        GetProcessMemoryInfo(
            h,
            &mut before as *mut _ as *mut PROCESS_MEMORY_COUNTERS,
            size_of::<PROCESS_MEMORY_COUNTERS_EX>() as u32,
        );

        let ok = SetProcessWorkingSetSize(h, usize::MAX, usize::MAX) != 0;

        let mut after: PROCESS_MEMORY_COUNTERS_EX = zeroed();
        GetProcessMemoryInfo(
            h,
            &mut after as *mut _ as *mut PROCESS_MEMORY_COUNTERS,
            size_of::<PROCESS_MEMORY_COUNTERS_EX>() as u32,
        );

        CloseHandle(h);

        if ok {
            return Ok((format!("Antes: {} KB | Depois: {} KB", before.WorkingSetSize / 1024, after.WorkingSetSize / 1024),
                before.WorkingSetSize / 1024,
            ))
        }

        Err(format!("[PID {}]: Não foi possível limpar a working set.", pid))
    }
}

