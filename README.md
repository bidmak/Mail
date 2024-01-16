# Mail: Single-page app 

## Overview

This project involves building a single-page web application for an email client using JavaScript, HTML, and CSS. The application interacts with a Django backend through a set of API routes to handle email-related functionalities.

## Features

- **Send Mail**

  - Users can compose and send emails using the email composition form.
  - A POST request to `/emails` sends the email, and the user's sent mailbox is loaded upon successful sending.

- **Mailbox**

  - Users can view their Inbox, Sent, and Archive mailboxes.
  - The application makes GET requests to `/emails/<mailbox>` to fetch and display emails for the selected mailbox.
  - Emails are rendered in individual boxes, displaying sender, subject, and timestamp.
  - Unread emails have a white background, while read emails have a gray background.

- **View Email**

  - Clicking on an email takes the user to a view displaying the email's content.
  - A GET request to `/emails/<email_id>` fetches the email information.
  - The email's sender, recipients, subject, timestamp, and body are displayed.
  - The email is marked as read after being viewed.

- **Archive and Unarchive**

  - Users can archive and unarchive received emails.
  - Archive button appears in Inbox emails, and Unarchive button appears in Archive emails.
  - PUT requests to `/emails/<email_id>` are used to mark an email as archived or unarchived.
  - After archiving or unarchiving, the user's inbox is reloaded.

- **Reply**
  - Users can reply to emails.
  - Clicking the "Reply" button on an email takes the user to the email composition form.
  - The form is pre-filled with the recipient set to the original sender, a subject starting with "Re:", and the original email's content included.

## How to Run

1. Ensure you have Django installed. If not, install it using `pip install django`.
2. Navigate to the `project3` directory.
3. Run migrations with `python manage.py migrate`.
4. Start the Django development server with `python manage.py runserver`.
5. Open the web browser and visit `http://127.0.0.1:8000` to access the email client.

## API Routes

- **GET /emails/<str:mailbox>**: Retrieve emails in the specified mailbox.
- **GET /emails/<int:email_id>**: Retrieve information for a specific email.
- **POST /emails**: Send a new email.
- **PUT /emails/<int:email_id>**: Update the status of an email (e.g., mark as read, archive).

## Notes

- The provided Django backend handles backend logic and provides the necessary API routes.
- JavaScript in `inbox.js` is responsible for managing the frontend, interacting with the API, and updating the UI based on user actions.

## Acknowledgments

This project is part of the CS50 Web Programming with Python and JavaScript course. The distribution code and backend logic were provided by the course instructors.
