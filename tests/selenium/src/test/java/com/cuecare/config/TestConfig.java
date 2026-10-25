package com.cuecare.config;

public final class TestConfig {
    private TestConfig() {}

    public static String baseUrl() {
        return System.getProperty("app.baseUrl", "http://127.0.0.1:5174").replaceAll("/$", "");
    }

    public static boolean headless() {
        return Boolean.parseBoolean(System.getProperty("app.headless", "true"));
    }
}
