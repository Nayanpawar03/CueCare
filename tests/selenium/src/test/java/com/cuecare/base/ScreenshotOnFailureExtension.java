package com.cuecare.base;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestExecutionExceptionHandler;

public class ScreenshotOnFailureExtension implements TestExecutionExceptionHandler {
    @Override
    public void handleTestExecutionException(ExtensionContext context, Throwable cause) throws Throwable {
        Object instance = context.getRequiredTestInstance();
        if (instance instanceof BaseTest test) {
            test.captureFailureScreenshot(context.getRequiredTestMethod().getName());
        }
        throw cause;
    }
}
