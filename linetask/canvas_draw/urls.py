from django.urls import path
from . import views

urlpatterns=[
    path('',views.Index.as_view(),name='index'),
    path('save',views.SaveData.as_view(),name='save'),
    path('clear',views.ClearData.as_view(),name='clear'),
    path('load',views.LoadData.as_view(),name='load'),
]