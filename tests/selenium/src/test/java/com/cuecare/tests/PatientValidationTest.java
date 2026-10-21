package com.cuecare.tests;

import com.cuecare.base.BaseTest;
import com.cuecare.pages.PatientFormPage;
import com.cuecare.util.TestData;
import com.cuecare.util.TestPatient;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PatientValidationTest extends BaseTest {
    @Test
    void rejectsInvalidPhoneAndKeepsFormOpen() {
        TestPatient patient = TestData.newPatient();
        open("/patients/new");

        PatientFormPage form = new PatientFormPage(driver, wait);
        form.fillValidPatient(patient, "123");
        form.submit();

        String phoneError = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("input[name='phone'] + .invalid-feedback"))).getText();
        assertEquals("Enter a valid 10-digit Indian mobile number", phoneError);
        assertTrue(driver.getCurrentUrl().endsWith("/patients/new"), "Invalid data must not navigate away from the form.");
        assertTrue(driver.findElement(By.name("phone")).getAttribute("class").contains("is-invalid"));
    }
}
