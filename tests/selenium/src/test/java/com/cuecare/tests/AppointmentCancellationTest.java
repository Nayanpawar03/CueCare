package com.cuecare.tests;

import com.cuecare.base.BaseTest;
import com.cuecare.pages.AppointmentPage;
import com.cuecare.util.TestPatient;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.assertTrue;

class AppointmentCancellationTest extends BaseTest {
    @Test
    void cancelsRequestedAppointmentAndShowsCancelledStatus() {
        TestPatient patient = registerPatientThroughUi();
        AppointmentPage appointments = new AppointmentPage(driver, wait);
        open("/appointments");
        appointments.choosePatient(patient);
        appointments.searchSeededDate();
        appointments.requestFirstAvailableSlot();
        wait.until(ExpectedConditions.textToBePresentInElement(appointments.statusBadge(), "REQUESTED"));

        appointments.cancelAppointment();

        wait.until(ExpectedConditions.textToBePresentInElement(appointments.statusBadge(), "CANCELLED"));
        assertTrue(driver.findElement(org.openqa.selenium.By.cssSelector("[role='status']"))
                .getText().contains("cancelled."));
    }
}
