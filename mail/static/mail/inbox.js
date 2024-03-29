document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Handles sending an email
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  load_mailbox('inbox');
});

function email_to_read(emailId) {
  fetch(`emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify({ read: true })
  })
  .catch(error => {
    console.error('Error setting email to read:', error);
  });
}

async function set_archive(emailId, isArchived) {
  try {
    await fetch(`emails/${emailId}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: !isArchived
      })
    });
  } catch (error) {
    console.error('Error setting email archive:', error);
  }
}

async function get_mail(mail) {
  try {
    const response = await fetch(`emails/${mail}`);
    return await response.json();
  } catch (error) {
    console.error('Error getting mail:', error);
    throw error;
  }
}

async function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  // Get mailbox content and view mailbox
  const mails = await get_mail(mailbox);
  view_mailbox(mails);

}

function view_email(content) {
  // Hide all existing children of #emails-view
  document.querySelectorAll('#emails-view > *').forEach(child => {
    child.style.display = 'none';
  });

  const parentDiv = document.querySelector('#emails-view');
  
  // Reply button
  const replyButton = createElementClassWithContent('button', 'btn btn-sm btn-outline-success mr-1 mb-3');
  replyButton.innerText = 'Reply';

  replyButton.addEventListener('click', () => reply_email(content));
  parentDiv.appendChild(replyButton);
  
  if (document.querySelector('#emails-view > h3').innerHTML != 'Sent') {
    const archiveButton = createElementClassWithContent('button', 'btn btn-sm mb-3');

    archiveButton.classList.add(content.archived ? 'btn-outline-secondary' : 'btn-outline-danger');
    archiveButton.innerText = content.archived ? 'Unarchive' : 'Archive';

    archiveButton.addEventListener('click', async () => {
      await set_archive(content.id, content.archived);
      load_mailbox('inbox');
    });
    parentDiv.appendChild(archiveButton);
  }

  const ul = createElementClassWithContent('ul', 'list-group');
  const header = createElementClassWithContent('li', 'list-group-item');
  const body = createElementClassWithContent('li', 'list-group-item');
  appendChildren(ul, header, body);
  parentDiv.appendChild(ul);

  let emailBody = content.body;
  const pattern = /On (\w+ \d{2} \d{4}, \d{2}:\d{2} (?:AM|PM)), (\w+@[\w.]+) wrote:/g;
  const matches = emailBody.match(pattern);
  if (matches) {
    matches.forEach(match => {
      const preEmail = `<span class="text-primary">${match}</span>`;
      emailBody = emailBody.replace(match, preEmail);
    })    
  }

  // Populate the email header with the corresponding details
  header.innerHTML = `
    <strong>From</strong>: ${content.sender}<br>
    <strong>To</strong>: ${content.recipients.join(', ')}<br>
    <strong>Time</strong>: ${content.timestamp}<br>
    <strong>Subject</strong>: ${content.subject}<br>
  `;

  // Populate the email body
  body.innerHTML = `
    <br>
    ${emailBody.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')}
  `;

  // Set the email to read
  if (!content.read) {
    email_to_read(content.id);
  }
  
}

function reply_email(email) {
  compose_email()
  
  document.querySelector('#compose-recipients').value = email.sender;

  const subject = document.querySelector('#compose-subject');
  subject.value = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`;

  const body = document.querySelector('#compose-body');
  body.value = `\n\nOn ${email.timestamp}, ${email.sender} wrote:\n${email.body}`;

  body.focus();
  body.setSelectionRange(0, 0);
  body.scrollTop = 0;

}

function view_mailbox(mailContents) {
  const emailDiv = createElementClassWithContent('div', 'list-group');
  document.querySelector('#emails-view').appendChild(emailDiv);

  mailContents.forEach(email => {
    const emailLink = createElementClassWithContent('a', 'list-group-item list-group-item-action');

    const subDiv = createElementClassWithContent('div', 'd-flex w-100 justify-content-between');
    appendChildren(emailLink, subDiv);

    appendChildren(subDiv,
      createElementClassWithContent('h5', 'mb-1', email.sender),
      createElementClassWithContent('small', 'mb-1', timeAgo(email.timestamp))
    );

    appendChildren(emailLink,
      createElementClassWithContent('p', 'mb-1', email.subject),
      createElementClassWithContent('p', 'truncate-text mb-1', truncateString(email.body, 140))
    );

    // Apply styling to the body element
    emailLink.lastElementChild.style.cssText = `
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 100%;
    `;

    if (email.read) {
      emailLink.classList.add('list-group-item-secondary');
      emailLink.style.borderBottom = '1px solid white';
    }

    emailDiv.appendChild(emailLink);
    emailLink.addEventListener('click', () => view_email(email));
  });
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  setValueToEmpty(['compose-recipients', 'compose-subject', 'compose-body']);
}

function send_email(event) {
  event.preventDefault();

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: getValue('compose-recipients'),
        subject: getValue('compose-subject'),
        body: getValue('compose-body')
    })
  })
  .then(response => response.json())
  .then(result => { 
    if (!result.error) {
      setValueToEmpty(['compose-recipients', 'compose-subject', 'compose-body']);
      load_mailbox('sent');
    } else {
      // Using bootstrap toast to show error message.
      const toastBody = document.querySelector('.toast-body');
      toastBody.textContent = `${result.error}, please try again.`;        
      const toast = document.getElementById('liveToast');
      const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
      toastBootstrap.show();
    }
  })
  .catch(error => {
    console.error('Error sending email:', error);
  });
}

function createElementClassWithContent(elementType, className, content) {
  const element = document.createElement(elementType);
  element.className = className;
  element.textContent = content;
  return element;
}

function setValueToEmpty(ids) {
  ids.forEach(id => {
    document.querySelector(`#${id}`).value = '';
  });
}

function getValue(id) {
  return document.querySelector(`#${id}`).value;
}

function appendChildren(parent, ...children) {
  children.forEach(child => parent.appendChild(child));
}

function timeAgo(timestamp) {
  const currentDate = new Date();
  const timestampDate = new Date(timestamp);

  const timeDifferenceInSeconds = Math.floor((currentDate - timestampDate) / 1000);

  if (timeDifferenceInSeconds < 60) {
      return `${timeDifferenceInSeconds} seconds ago`;
  } else if (timeDifferenceInSeconds < 3600) {
      const minutes = Math.floor(timeDifferenceInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else {
      return timestamp;
  }
}

function truncateString(str, maxLength) {
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}
