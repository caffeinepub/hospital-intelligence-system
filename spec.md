# Hospital Intelligence System

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Patient Management: add/edit/view patients with name, age, gender, contact, disease, treatment, history
- Doctor Management: add/edit doctors with name, specialization, availability; assign patients to doctors
- Appointment System: book, view, track, cancel, reschedule appointments
- Data Analysis: most common diseases, patient count per day/month, doctor workload analysis
- Dashboard: charts for patient statistics, disease distribution, hospital performance

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: Stable storage for patients, doctors, appointments with full CRUD
2. Backend: Query functions for analytics (disease frequency, daily/monthly counts, doctor workload)
3. Frontend: Sidebar navigation with 5 sections: Dashboard, Patients, Doctors, Appointments, Analytics
4. Frontend: Patient list with add/edit modal, search and filter
5. Frontend: Doctor list with add/edit modal, patient assignment
6. Frontend: Appointment booking form, calendar-like list view, status management (booked/cancelled/completed)
7. Frontend: Dashboard with bar/pie charts using Recharts for disease distribution, patient stats, doctor workload
8. Frontend: Analytics page with detailed breakdowns and trend charts
