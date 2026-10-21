package com.cuecare.base;

import com.cuecare.config.TestConfig;
import com.cuecare.pages.PatientFormPage;
import com.cuecare.util.TestData;
import com.cuecare.util.TestPatient;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@ExtendWith(ScreenshotOnFailureExtension.class)
public abstract class BaseTest {
    protected WebDriver driver;
    protected WebDriverWait wait;

    @BeforeEach
    void startBrowser() {
        ChromeOptions options = new ChromeOptions();
        options.setBinary("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe");
        options.addArguments("--window-size=1440,1000", "--disable-gpu");
        if (TestConfig.headless()) {
            options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
        }
        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ZERO);
        wait = new WebDriverWait(driver, Duration.ofSeconds(12));
    }

    @AfterEach
    void closeBrowser() {
        if (driver != null) {
            driver.quit();
            driver = null;
        }
    }

    protected void open(String path) {
        driver.get(TestConfig.baseUrl() + path);
    }

    protected TestPatient registerPatientThroughUi() {
        TestPatient patient = TestData.newPatient();
        open("/patients/new");
        PatientFormPage form = new PatientFormPage(driver, wait);
        form.fillValidPatient(patient, TestData.validPhone());
        form.submit();
        wait.until(ExpectedConditions.urlContains("/patients"));
        wait.until(ExpectedConditions.textToBePresentInElementLocated(
                By.cssSelector("table tbody"), patient.fullName()));
        return patient;
    }

    void captureFailureScreenshot(String testName) {
        if (driver == null) return;
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String filename = getClass().getSimpleName() + "_" + testName + "_" + timestamp + ".png";
        Path directory = Path.of("target", "screenshots");
        Path screenshot = directory.resolve(filename);
        try {
            Files.createDirectories(directory);
            Files.copy(((org.openqa.selenium.TakesScreenshot) driver)
                    .getScreenshotAs(org.openqa.selenium.OutputType.FILE).toPath(), screenshot);
            System.err.println("Failure screenshot: " + screenshot.toAbsolutePath());
        } catch (IOException | RuntimeException e) {
            System.err.println("Could not save failure screenshot: " + e.getMessage());
        }
    }
}
