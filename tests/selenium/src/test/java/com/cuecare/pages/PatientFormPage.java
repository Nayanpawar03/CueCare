package com.cuecare.pages;

import com.cuecare.util.TestPatient;
import com.cuecare.util.TestData;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

public class PatientFormPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    public PatientFormPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    public void fillValidPatient(TestPatient patient, String phone) {
        wait.until(d -> d.findElement(By.name("firstName")).isDisplayed());
        driver.findElement(By.name("firstName")).sendKeys(patient.firstName());
        driver.findElement(By.name("lastName")).sendKeys(patient.lastName());
        driver.findElement(By.name("email")).sendKeys(patient.email());
        driver.findElement(By.name("phone")).sendKeys(phone);
        WebElement dateOfBirth = driver.findElement(By.name("dateOfBirth"));
        ((JavascriptExecutor) driver).executeScript(
                "const input=arguments[0];"
                        + "const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;"
                        + "setter.call(input,arguments[1]);"
                        + "input.dispatchEvent(new Event('input',{bubbles:true}));"
                        + "input.dispatchEvent(new Event('change',{bubbles:true}));",
                dateOfBirth, TestData.dateOfBirth());
        new Select(driver.findElement(By.name("gender"))).selectByVisibleText("Other");
        driver.findElement(By.name("address")).sendKeys("Selenium test data");
    }

    public void submit() {
        WebElement button = driver.findElement(By.cssSelector("button[type='submit']"));
        wait.until(d -> button.isEnabled());
        button.click();
    }
}
