const emailJsConfig = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

export async function sendAppointmentEmail({ appointment, patient, notificationType }) {
    const { serviceId, templateId, publicKey } = emailJsConfig;
    if (!serviceId || !templateId || !publicKey) {
        return { sent: false, reason: 'not-configured' };
    }

    const patientName = `${patient.first_name} ${patient.last_name}`.trim();
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
                to_email: patient.email,
                to_name: patientName,
                notification_type: notificationType,
                appointment_id: appointment.id,
                appointment_status: appointment.status,
                doctor_name: appointment.doctor_name,
                specialty: appointment.specialty,
                appointment_date: new Date(`${appointment.appointment_date}T12:00:00`)
                    .toLocaleDateString('en-IN'),
                start_time: appointment.start_time,
                end_time: appointment.end_time,
                reason: appointment.reason || 'Not provided',
            },
        }),
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || 'EmailJS could not send the appointment email.');
    }

    return { sent: true };
}
