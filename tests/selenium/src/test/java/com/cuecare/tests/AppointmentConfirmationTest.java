package com.cuecare.tests;

import com.cuecare.base.BaseTest;
import com.cuecare.pages.AppointmentPage;
import com.cuecare.util.TestPatient;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.assertTrue;

class AppointmentConfirmationTest extends BaseTest {
    @Test
    void confirmsRequestedAppointment() {
        TestPatient patient = registerPatientThroughUi();
        AppointmentPage appointments = new AppointmentPage(driver, wait);
        open("/appointments");
        appointments.choosePatient(patient);
        appointments.searchSeededDate();
        appointments.requestFirstAvailableSlot();
        wait.until(ExpectedConditions.textToBePresentInElement(appointments.statusBadge(), "REQUESTED"));

        appointments.confirmAppointment();

        wait.until(ExpectedConditions.textToBePresentInElement(appointments.statusBadge(), "CONFIRMED"));
        assertTrue(driver.findElement(org.openqa.selenium.By.cssSelector("[role='status']"))
                .getText().contains("confirmed."));
    }
}
