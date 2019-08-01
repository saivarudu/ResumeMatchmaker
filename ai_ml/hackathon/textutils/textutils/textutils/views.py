# this file created by Ashutosh
from django.http import HttpResponse
from django.shortcuts import render
import re


def about(request):
    return HttpResponse("About page!!!")


def textContent(request):
    with open('D:/codeWithHarry/codeWithHarry/LICENSE.txt') as f:
        data = f.read()

    return HttpResponse(data)


def index(request):
    return render(request, 'index.html')


def analyze(request):
    # get the text
    djtext = request.POST.get('text', 'default')

    # check checkbox values
    removepunc = request.POST.get('removepunc', 'off')
    fullcaps = request.POST.get('fullcaps', 'off')
    newlineremover = request.POST.get('newlineremover', 'off')
    extraspaceremover = request.POST.get('extraspaceremover', 'off')
    charcount = request.POST.get('charcount', 'off')

    # print(removepunc)
    # print(djtext)
    if(removepunc == "on"):
        #analyzed = djtext
        punctuations = '''!()-[]{};:'"\,<>./?@#$%^&*_~'''
        print(djtext)
        analyzed = ""
        for char in djtext:
            if char not in punctuations:
                analyzed = analyzed + char
        params = {'purpose': 'remove punctuations', 'analyzed_text': analyzed}
        print(analyzed)
        return render(request, 'analyze.html', params)

    if(newlineremover == "on"):
        print(djtext)
        analyzed = ""
        for char in djtext:
            if char != '\n' and char != '\r':
                analyzed += char
        params = {'purpose': 'Remove New lines', 'analyzed_text': analyzed}
        print(analyzed)
        return render(request, 'analyze.html', params)

    if(fullcaps == "on"):
        print(djtext)
        analyzed = djtext.upper()
        params = {'purpose': 'Convert to upper case', 'analyzed_text': analyzed}
        print(analyzed)
        return render(request, 'analyze.html', params)

    if(extraspaceremover == "on"):
        print(djtext)
        analyzed = djtext
        analyzed = re.sub("\s+", " ", analyzed)
        params = {'purpose': 'To remove spaces', 'analyzed_text': analyzed}
        print(analyzed)
        return render(request, 'analyze.html', params)

    if(charcount == "on"):
        print(djtext)
        analyzed = djtext
        count = 0
        for char in analyzed:
            count += 1
        params = {'purpose': 'To count character', 'analyzed_text': count}
        print(analyzed)
        return render(request, 'analyze.html', params)

    else:
        return HttpResponse("ERROR")

    # Analyze the text


#
# def capfirst(request):
#     return HttpResponse("capitalize first")
#
#
# def newlineremove(request):
#     return HttpResponse("newline remove first")
#
#
# def spaceremove(request):
#     return HttpResponse("space remover back")
#
#
# def charcount(request):
#     return HttpResponse("charcount ")
