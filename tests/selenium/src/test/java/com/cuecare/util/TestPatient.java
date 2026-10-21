package com.cuecare.util;

public record TestPatient(String id, String firstName, String lastName, String email) {
    public String fullName() {
        return firstName + " " + lastName;
    }
}
