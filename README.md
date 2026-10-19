Secure Mobile Document Management and Verification System.

  Project Overview

This is a project to create a secure mobile app which will enable citizens to store, manage and submit and track significant legal documents electronically. The system has organized and structured document certification and verification process with users and Police Station Officer and Administrator.

It's an academic prototype application to showcase how to manage and verify a document securely. There is no connection between this and the South African Police Service (SAPS) or any Government systems.

  Objectives

- Secure Storage and usage of Digital Document.
- Enable user to submit documents to be certified and/or verified.
- Organize a Police Station Officer certification simulation of documents.
- Enable administrators to approve/reject documents submitted.
- Track and record the status and history of documents.
- Certified Copy Support requests.

  Key Features

User Authentication: It involves registering and logging in users securely.
Document Upload: Upload of legal documents in support.
Document Certification: Police Station Officer simulated review and certification of documents.
Administrator Verification, Review, Approve or Deny Certified documents.
- Status Tracking: Monitor documents on-going.
Requests for Certified Copy of Official Document(s): Certified copies of official document(s).
- Different permissions for users and admin. - Role Based Access Control:
- Audit Logging: Log decision on verification, activities in the system.

  User Roles

 1. User
Sign-up and log-in.
Work with uploading and editing documents.
Provide documents to be checked.
- Track verification status.
- Request certified copies.

 2. Police Station Officer
- Review submitted documents.
Simulate Certification.
Read and approve and/or reject documents.
- Provide rejection reasons.

 3. Administrator
- Review police-certified documents.
- Notification of submissions acceptance/rejection.
- Manage registered users.
- Process certified-copy requests.
- View verification history.

  Document Verification Workflow

User registers and logs in:
2. Submission of legal document by the user.
3. The document goes through the "police certification".
The administrator will establish that the document which was signed by the hazardous waste generator is the certified document in item 4.
5. Admin reviews and accepts/disapprooves the document.
6. User is informed of the new condition.

 Supported Document Types

- Identity documents
- Driver's licences
- Birth certificates
- Matric certificates

 Proposed Technologies

These technologies are recommended for use in the system design:

Write a mobile application using React Native.Create a mobile application using React Native.
With the back end developed in node.js and express.The backend is written using node.js and express.
- Database: PostgreSQL
Gateway: Redis
File Storage: Cloud object storage which is encrypted.
Cloud Functions: (Firebase Cloud Functions / APNs)
The platform will be Docker and a managed cloud platform.

The following are proposed technologies in the system design; these rely on stage of the project.

 Security Considerations

- Role-based access control.
It doesn't support SSL 3.0.
- Document / credential security.
Restricted access to personal information.
Verifying activities – audit trails.
South Africa's Protection of Personal Information Act (POPIA) is taken into account.

 System Design

The project includes:

- Use case diagram
- User interface wireframes
- Client-server architecture design
- Entity-relationship diagram (ERD)
Functional requirements, Non-functional requirements

 Project Status

Status: This is an academic prototype / system design.

In this project you'll be designing and modelling a safe application that manages documents and verifies that they are in good order.

  Contributors

- Kgotsofalang Makgari
- Joy Motsoeneng
- Zuverya Saiyed
- Onthatile Mofokeng

  Disclaimer

This app is an Academic Prototype. Police verification is simulated and it is not linked to SAPS and government systems. Not a substitute for official certification/legal documents.
