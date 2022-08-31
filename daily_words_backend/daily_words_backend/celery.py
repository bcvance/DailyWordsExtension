import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "daily_words_backend.settings")
app = Celery("daily_words_backend")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# sends 5 most recent translations every 30 seconds
app.conf.beat_schedule = {
    'send-daily-words': {
        'task':'send_daily_words_task',
        'schedule': 30.0
    }
}