export function validateMemory(memory: string): boolean | undefined {
  
    if (memory.trim().endsWith('m')) {
        let memValue = memory.trim().replace('m', '');
        if (parseInt(memValue) >= 6) {
          return true;
        }
      }
    if (memory.trim().endsWith('b')) {
        let memValue = memory.trim().replace('b', '');
        if (parseInt(memValue) >= 6000000) {
            return true;
        }
    }
    if (memory.trim().endsWith('k')) {
        let memValue = memory.trim().replace('k', '');
        if (parseInt(memValue) >= 6000) {
            return true;
        }
    }
    if (memory.trim().endsWith('g')) {
        let memValue = memory.trim().replace('g', '');
        if (parseInt(memValue) >= 0.006) {
            return true;
        }
    }
    return false;
}

export function validateMemoryReservation(memory: string, memoryReserve: string): boolean | undefined {
    if (memory.trim().endsWith('m') && memoryReserve.trim().endsWith('m')) {
        let memValue = memory.trim().replace('m', '');
        let memReserveValue = memoryReserve.trim().replace('m', '');
        if (parseInt(memValue) < parseInt(memReserveValue)) {
          return false;
        }
      }
    if (memory.trim().endsWith('b') && memoryReserve.trim().endsWith('b')) {
        let memValue = memory.trim().replace('b', '');
        let memReserveValue = memoryReserve.trim().replace('b', '');
        if (parseInt(memValue) < parseInt(memReserveValue)) {
          return false;
        }
      }
    if (memory.trim().endsWith('k') && memoryReserve.trim().endsWith('k')) {
        let memValue = memory.trim().replace('k', '');
        let memReserveValue = memoryReserve.trim().replace('k', '');
        if (parseInt(memValue) < parseInt(memReserveValue)) {
          return false;
        }
      }
    if (memory.trim().endsWith('g') && memoryReserve.trim().endsWith('g')) {
        let memValue = memory.trim().replace('g', '');
        let memReserveValue = memoryReserve.trim().replace('g', '');
        if (parseInt(memValue) < parseInt(memReserveValue)) {
          return false;
        }
      }
    return true;
}