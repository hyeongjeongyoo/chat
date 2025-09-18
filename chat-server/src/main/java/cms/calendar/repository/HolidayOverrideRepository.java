package cms.calendar.repository;

import cms.calendar.domain.HolidayOverride;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface HolidayOverrideRepository extends JpaRepository<HolidayOverride, Long> {
    List<HolidayOverride> findByHolidayDate(LocalDate date);
}


