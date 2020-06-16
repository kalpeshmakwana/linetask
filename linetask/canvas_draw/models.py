from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField
# Create your models here.

class DrawLines(models.Model):
    '''For Store all lines'''
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    points=JSONField(null=True,blank=True)

    def __str__(self):
        return str(self.id)+' '+self.user.username