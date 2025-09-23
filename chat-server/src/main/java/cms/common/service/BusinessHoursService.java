package cms.common.service;

import cms.calendar.repository.HolidayOverrideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.Optional;

@Service
public class BusinessHoursService {
    private final Optional<HolidayOverrideRepository> holidayRepo;

    // Configurable hours (could be moved to application.yml)
    private final LocalTime start = LocalTime.of(9, 0);
    private final LocalTime end = LocalTime.of(18, 0);
    private final EnumSet<DayOfWeek> workdays = EnumSet.of(
            DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY, DayOfWeek.FRIDAY);

    public BusinessHoursService(@Autowired(required = false) HolidayOverrideRepository holidayRepo) {
        this.holidayRepo = Optional.ofNullable(holidayRepo);
    }

    public boolean isOpen(LocalDateTime when) {
        LocalDate d = when.toLocalDate();
        DayOfWeek dow = d.getDayOfWeek();
        if (!workdays.contains(dow)) return false;
        
        // Holiday overrides (only if repository is available)
        if (holidayRepo.isPresent()) {
            try {
                boolean overriddenClosed = holidayRepo.get().findByHolidayDate(d).stream()
                        .anyMatch(h -> "Y".equalsIgnoreCase(h.getClosedYn()));
                if (overriddenClosed) return false;
            } catch (Exception e) {
                // If holiday table doesn't exist or any DB error, just ignore holiday checks
                System.err.println("Warning: Holiday override check failed, ignoring: " + e.getMessage());
            }
        }
        
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


