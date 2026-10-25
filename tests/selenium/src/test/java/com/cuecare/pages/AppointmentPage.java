package com.cuecare.pages;

import com.cuecare.util.TestData;
import com.cuecare.util.TestPatient;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.List;

public class AppointmentPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    public AppointmentPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    public void choosePatient(TestPatient patient) {
        WebElement patientSelect = wait.until(ExpectedConditions.elementToBeClickable(By.id("booking-patient")));
        new Select(patientSelect).selectByVisibleText(patient.fullName());
    }

    public void searchSeededDate() {
        WebElement dateInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("appointment-date")));
        String date = TestData.nextSeededDate().toString();
        ((JavascriptExecutor) driver).executeScript(
                "const input=arguments[0];"
                        + "const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;"
                        + "setter.call(input,arguments[1]);"
                        + "input.dispatchEvent(new Event('input',{bubbles:true}));"
                        + "input.dispatchEvent(new Event('change',{bubbles:true}));",
                dateInput, date);
        driver.findElement(By.cssSelector("form button[type='submit']")).click();
        wait.until(d -> !d.findElements(By.cssSelector(".available-slot-list button")).isEmpty());
    }

    public void requestFirstAvailableSlot() {
        List<WebElement> requestButtons = wait.until(
                ExpectedConditions.presenceOfAllElementsLocatedBy(
                        By.xpath("//button[normalize-space()='Request appointment']")));
        requestButtons.get(0).click();
    }

    public String requestConfirmationMessage() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[role='status']")))
                .getText();
    }

    public WebElement statusBadge() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".appointment-status-item .badge")));
    }

    public void confirmAppointment() {
        WebElement card = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".appointment-status-item")));
        card.findElement(By.xpath(".//button[normalize-space()='Confirm']")).click();
    }

    public void cancelAppointment() {
        WebElement card = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".appointment-status-item")));
        card.findElement(By.xpath(".//button[normalize-space()='Cancel']")).click();
    }
}
