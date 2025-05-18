# StatusCopeWebsite0

A web application for managing patient-doctor communication and health monitoring.

## Features

- User Authentication (Admin, Doctor, Patient)
- Real-time Chat between Doctors and Patients
- Heart Auscultation Monitoring for Patients
- Admin Dashboard for User Management

## Setup

1. Clone the repository
2. Create a Firebase project
3. Copy `firebase-config.example.js` to `firebase-config.js` and update with your Firebase configuration
4. Deploy to your preferred hosting service

## Default Admin Account

- Email: admin@statuscope.com
- Password: admin123

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Firebase (Authentication, Firestore)
- Font Awesome Icons

## Project Structure

```
StatusCope/
├── assets/
│   ├── css/
│   │   ├── styles.css
│   │   └── dashboard.css
│   ├── js/
│   │   ├── app.js
│   │   ├── admin-dashboard.js
│   │   ├── doctor-dashboard.js
│   │   ├── patient-dashboard.js
│   │   ├── chat.js
│   │   └── firebase-config.js
│   └── img/
├── pages/
│   ├── chat.html
├── index.html
├── admin-dashboard.html
├── doctor-dashboard.html
├── patient-dashboard.html
├── firebase-config.example.js
├── LICENSE
└── README.md
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
