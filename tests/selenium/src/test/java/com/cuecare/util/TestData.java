package com.cuecare.util;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicLong;

public final class TestData {
    private static final AtomicLong SEQUENCE = new AtomicLong(System.currentTimeMillis() % 1_000_000);

    private TestData() {}

    public static TestPatient newPatient() {
        String unique = Long.toString(SEQUENCE.incrementAndGet());
        return new TestPatient(
                "",
                "Selenium" + unique,
                "Patient",
                "selenium." + unique + "@example.test"
        );
    }

    public static String validPhone() {
        long suffix = Math.floorMod(SEQUENCE.incrementAndGet(), 1_000_000_000L);
        return String.format("6%09d", suffix);
    }

    public static String dateOfBirth() {
        return LocalDate.now().minusYears(30).toString();
    }

    public static LocalDate nextSeededDate() {
        LocalDate date = LocalDate.now().plusDays(1);
        if (date.getDayOfWeek() == java.time.DayOfWeek.SUNDAY) {
            date = date.plusDays(1);
        }
        return date;
    }
}
