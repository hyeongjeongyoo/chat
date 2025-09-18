package cms.common.service;

import cms.calendar.repository.HolidayOverrideRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumSet;

@Service
public class BusinessHoursService {
    private final HolidayOverrideRepository holidayRepo;

    // Configurable hours (could be moved to application.yml)
    private final LocalTime start = LocalTime.of(9, 0);
    private final LocalTime end = LocalTime.of(18, 0);
    private final EnumSet<DayOfWeek> workdays = EnumSet.of(
            DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY, DayOfWeek.FRIDAY);

    public BusinessHoursService(HolidayOverrideRepository holidayRepo) {
        this.holidayRepo = holidayRepo;
    }

    public boolean isOpen(LocalDateTime when) {
        LocalDate d = when.toLocalDate();
        DayOfWeek dow = d.getDayOfWeek();
        if (!workdays.contains(dow)) return false;
        // Holiday overrides
        boolean overriddenClosed = holidayRepo.findByHolidayDate(d).stream()
                .anyMatch(h -> "Y".equalsIgnoreCase(h.getClosedYn()));
        if (overriddenClosed) return false;
        LocalTime t = when.toLocalTime();
        return !t.isBefore(start) && t.isBefore(end);
    }

    public static class Status {
        private final boolean open;
        private final String message;
        public Status(boolean open, String message) { this.open = open; this.message = message; }
        public boolean isOpen() { return open; }
        public String getMessage() { return message; }
    }

    public Status currentStatus() {
        boolean openNow = isOpen(LocalDateTime.now());
        String msg = openNow ? "영업시간입니다." : "현재 운영시간(평일 09:00~18:00)이 아닙니다. 접수되었으며 운영시간에 답변드리겠습니다.";
        return new Status(openNow, msg);
    }
}


