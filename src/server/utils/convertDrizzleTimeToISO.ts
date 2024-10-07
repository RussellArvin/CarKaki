export function convertDrizzleTimeToISO(drizzleTime: string): string {
    // Parse the time components
    const [hours, minutes, seconds] = drizzleTime.split(':').map(Number);
  
    // Create a new Date object (note: date is arbitrary, we only care about time)
    const date = new Date(2000, 0, 1, hours, minutes, seconds);
  
    // Return the time part of the ISO string
    return date.toISOString().substr(11, 8);
  }