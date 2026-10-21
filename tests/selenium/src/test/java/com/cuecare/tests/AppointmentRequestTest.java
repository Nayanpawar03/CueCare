package com.cuecare.tests;

import com.cuecare.base.BaseTest;
import com.cuecare.pages.AppointmentPage;
import com.cuecare.util.TestPatient;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.assertTrue;

class AppointmentRequestTest extends BaseTest {
    @Test
    void submitsRequestForAvailableSlotAndDisplaysRequestedStatus() {
        TestPatient patient = registerPatientThroughUi();
        AppointmentPage appointments = new AppointmentPage(driver, wait);
        open("/appointments");
        appointments.choosePatient(patient);
        appointments.searchSeededDate();
        appointments.requestFirstAvailableSlot();

        assertTrue(appointments.requestConfirmationMessage().contains("Current status: REQUESTED"));
        wait.until(ExpectedConditions.textToBePresentInElement(appointments.statusBadge(), "REQUESTED"));
    }
}
