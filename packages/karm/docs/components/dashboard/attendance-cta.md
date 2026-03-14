# AttendanceCTA

- Import: @devalok/shilp-sutra-karm/dashboard
- Server-safe: No
- Category: dashboard

## Props
    userName: string (REQUIRED)
    attendance: AttendanceData | null (REQUIRED)
    canMarkAttendance: boolean (REQUIRED)
    onMarkAttendance: () => void
    isSubmitting: boolean (default: false)
    formatTime: (timeStr: string) => string (default: IST toLocaleTimeString)
    className: string

## Related Types
    AttendanceData: { attendance: { id: string; status: string; timeIn: string | null; timeOut: string | null }; breakReason: string | null }

## Defaults
    isSubmitting=false, formatTime=defaultFormatTime (IST, 12-hour)

## Example
```jsx
<AttendanceCTA
  userName="Mudit Sharma"
  attendance={attendanceData}
  canMarkAttendance={true}
  onMarkAttendance={() => markAttendance()}
  isSubmitting={isMarking}
/>
```

## Gotchas
- Renders four different states based on attendance data:
  1. **Unmarked + canMark**: Large greeting card with gradient background and "Mark Attendance" button
  2. **Marked (PRESENT)**: Compact strip showing check-in time in a success badge
  3. **On Break (BREAK)**: Compact strip with warning badge showing break reason
  4. **Unmarked + cannot mark**: Compact strip with "Attendance window closed" message
- Greeting is time-based: "Good morning" (before 12), "Good afternoon" (12-17), "Good evening" (after 17)
- Only the first name (split on space) is displayed in the greeting
- Date is formatted in en-IN locale with IST timezone
- The default formatTime uses en-IN locale with IST timezone and 12-hour format
- Extends React.HTMLAttributes<HTMLDivElement>

## Changes
### v0.18.0
- **Added** Initial release
