from django.shortcuts import render
from django.views.generic import TemplateView,View
from canvas_draw.models import DrawLines
from django.http import JsonResponse
# Create your views here.

class Index(TemplateView):
    """HomePage Display"""
    template_name='index.html'

class SaveData(View):
    """ Save Coordinates in db """
    def get(self,request,*args, **kwargs):
        if request.is_ajax():
            draw,created = DrawLines.objects.update_or_create(user=request.user)
            if created or not draw.points:
                draw.points={'points':[eval(request.GET.get('points'))]}
                draw.save()
            else:
                draw.points['points'].append(eval(request.GET.get('points')))
                draw.save()
        return JsonResponse({'data':'Saved Data'},status=200)

class ClearData(View):
    """Clear All Cordinates from databse"""
    def get(self,request,*args,**kwargs):
        if request.is_ajax():
            draw=DrawLines.objects.get(user=request.user)
            draw.points=None
            draw.save()
        return JsonResponse({'data':'CLeared All Data'},status=200)

class LoadData(View):
    """Showing Last Line"""
    def get(self,request,*args,**kwargs):
        if request.is_ajax():
            draw=DrawLines.objects.get(user=request.user)
            if(request.GET.get('loaddata')=='load'):    
                return JsonResponse({'points':draw.points['points'][-1]},status=200)
            else:
                return JsonResponse({'points':draw.points['points']},status=200)

