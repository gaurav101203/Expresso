import smtplib
from email.message import EmailMessage

def email_alert(subject, body, to):
    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["To"] = to

    user = "yadavgaurav101203@gmail.com"
    msg["From"] = user
    password = "jrnnksnkgrkgkmnm"  # Use App Password here

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(user, password)
    server.send_message(msg)
    server.quit()
