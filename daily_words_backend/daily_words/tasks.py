import os
from time import sleep
from .models import Word, User
from twilio.rest import Client
from celery import shared_task

account_sid = os.environ['TWILIO_ACCOUNT_SID']
auth_token = os.environ['TWILIO_AUTH_TOKEN']
client = Client(account_sid, auth_token)

# sends 5 most recent translations to user's phone
@shared_task(name = "send_daily_words_task")
def send_daily_words_task():
    print('send_daily_words executed')
    users = User.objects.all()
    # send texts to all users that want translations by text
    for user in users:
        if user.send_to_phone:
            body_list = []
            # get n oldest words, with n being specified by user in options
            entries = Word.objects.filter(user=user).order_by('saved_date')[:user.num_words]
            # convert translations into string to be sent
            for entry in entries:
                body_list.append(f'{entry.original}: {entry.translation}\n')
                # updates the saved_date value in the word objects
                entry.save()
            body_string = ''.join(body_list)
            # print(body_string)
            message = client.messages.create(
                    body=body_string,
                    from_='+18106311913',
                    to=user.phone_number
                )


# @shared_task(name = "print_msg_main")
# def print_message(message, *args, **kwargs):
#     print(f"Celery is working!! Message is {message}")