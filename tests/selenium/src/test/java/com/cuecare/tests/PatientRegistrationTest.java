package com.cuecare.tests;

import com.cuecare.base.BaseTest;
import com.cuecare.pages.PatientFormPage;
import com.cuecare.util.TestData;
import com.cuecare.util.TestPatient;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PatientRegistrationTest extends BaseTest {
    @Test
    void registersPatientAndShowsItInPatientList() {
        TestPatient patient = TestData.newPatient();
        open("/patients/new");

        new PatientFormPage(driver, wait).fillValidPatient(patient, TestData.validPhone());
        new PatientFormPage(driver, wait).submit();

        wait.until(ExpectedConditions.urlContains("/patients"));
        String listText = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("table tbody"))).getText();
        assertTrue(listText.contains(patient.fullName()), "Registered patient should appear in the patient list.");
        assertTrue(listText.contains(patient.email()), "Registered patient email should appear in the patient list.");
    }
}
