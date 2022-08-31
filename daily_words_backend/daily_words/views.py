from django.shortcuts import render
import json
from django.http import JsonResponse, HttpResponse
from .models import Word, User
from rest_framework import status
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
import os

# Create your views here.

# deletes words from database
# TODO: authenticate token for security
@csrf_exempt
@api_view(('POST',))
@renderer_classes((TemplateHTMLRenderer, JSONRenderer))
def delete_word(request):
    data = json.loads(request.body)
    print(data)
    word = data['word']
    user_info = data['userInfo']
    google_id = user_info['sub']
    Word.objects.get(original = word, user=User.objects.get(google_id=google_id)).delete()
    return HttpResponse(status=204)


# saves words to database
# TODO: authenticate token for security
@csrf_exempt
@api_view(('POST',))
@renderer_classes((TemplateHTMLRenderer, JSONRenderer))
def save_word(request):
    print('saveWord called')
    data = json.loads(request.body)
    print(data)
    word = data['word']
    translation = data['translation']
    user_info = data['userInfo']
    google_id = user_info['sub']
    user_email = user_info['email']
    if not User.objects.filter(google_id=google_id):
        User.objects.create(google_id=google_id, user_email=user_email)
    Word.objects.create(original=word, translation=translation, user=User.objects.get(google_id=google_id))
    return HttpResponse(status=204)

# sends words to user's phone
# @csrf_exempt
# @api_view(('POST',))
# @renderer_classes((TemplateHTMLRenderer, JSONRenderer))
# def send(request):
#     last_five = Word.objects.all().order_by('-id')[:5]
#     body_list = [f'{entry.original}: {entry.translation}\n' for entry in last_five]
#     body_string = ''.join(body_list)
#     # print(body_string)
#     message = client.messages.create(
#             body=body_string,
#             from_='+18106311913',
#             to='+18157939677'
#         )

#     # print(message.sid)
#     return HttpResponse(status=204)


# save updated user settings to database
@csrf_exempt
@api_view(('POST',))
@renderer_classes((TemplateHTMLRenderer, JSONRenderer))
def update(request):
    data = json.loads(request.body)
    user_info = data['userInfo']
    user = User.objects.get(google_id=user_info['sub'])
    user.send_to_phone = data['sendToPhone']
    user.send_to_email = data['sendToEmail']
    user.phone_number = data['phoneNumber']
    user.num_words = data['numWords']
    user.save()
    return JsonResponse({'message':'successfully updated user settings'},status=204)
