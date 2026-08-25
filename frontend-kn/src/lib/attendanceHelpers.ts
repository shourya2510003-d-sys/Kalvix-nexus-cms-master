import { ref, get, update } from 'firebase/database';

/**
 * Automatically marks all Sundays in the given month (YYYY-MM) as 'S' for all employees,
 * if they are not already marked. It stops at today's date if it's the current month,
 * or processes all days if it's a past month.
 */
export async function autoMarkSundays(db: any, yearMonth: string) {
  try {
    const [yearStr, monthStr] = yearMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1; // 0-indexed for Date

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const maxDate = isCurrentMonth ? today.getDate() : new Date(year, month + 1, 0).getDate();

    // Get all employees
    const usersRef = ref(db, 'employees');
    const usersSnap = await get(usersRef);
    if (!usersSnap.exists()) return;
    const users = usersSnap.val();
    
    // Only process employees
    const employeeIds = Object.keys(users);
    
    const updates: Record<string, any> = {};

    for (let d = 1; d <= maxDate; d++) {
      const dateObj = new Date(year, month, d);
      if (dateObj.getDay() === 0) { // 0 is Sunday
        const dayStr = String(d).padStart(2, '0');
        
        for (const empId of employeeIds) {
          const path = `attendance/${empId}/${yearMonth}/${dayStr}`;
          
          // Check if already exists
          const existingSnap = await get(ref(db, path));
          if (!existingSnap.exists()) {
            updates[path] = {
              status: 'S',
              note: 'Automatic Sunday Mark',
              timestamp: Date.now()
            };
          }
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
      console.log(`Automatically marked ${Object.keys(updates).length} Sunday records.`);
    }

  } catch (error) {
    console.error("Error auto-marking Sundays:", error);
  }
}

/**
 * Automatically marks all days before 'today' in the given month (YYYY-MM) as 'Absent' (A)
 * if they haven't been marked yet and they are not Sundays.
 */
export async function autoMarkAbsents(db: any, yearMonth: string) {
  try {
    const [yearStr, monthStr] = yearMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1; // 0-indexed for Date

    const today = new Date();
    
    // If it's a future month, do nothing
    if (year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth())) {
      return;
    }

    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    // We only mark up to yesterday for current month. If past month, maxDate is total days in that month.
    const maxDate = isCurrentMonth ? today.getDate() - 1 : new Date(year, month + 1, 0).getDate();

    if (maxDate < 1) return;

    // Get all employees
    const usersRef = ref(db, 'employees');
    const usersSnap = await get(usersRef);
    if (!usersSnap.exists()) return;
    const users = usersSnap.val();
    
    const employeeIds = Object.keys(users);
    const updates: Record<string, any> = {};

    for (let d = 1; d <= maxDate; d++) {
      const dateObj = new Date(year, month, d);
      // Skip Sundays, let autoMarkSundays handle it
      if (dateObj.getDay() !== 0) {
        const dayStr = String(d).padStart(2, '0');
        
        for (const empId of employeeIds) {
          const path = `attendance/${empId}/${yearMonth}/${dayStr}`;
          
          // Check if already exists
          const existingSnap = await get(ref(db, path));
          if (!existingSnap.exists()) {
            updates[path] = {
              status: 'A',
              note: 'Auto-marked Absent',
              timestamp: Date.now()
            };
          }
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
      console.log(`Automatically marked ${Object.keys(updates).length} Absent records.`);
    }

  } catch (error) {
    console.error("Error auto-marking absents:", error);
  }
}
