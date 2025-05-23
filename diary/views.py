from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import DiaryEntry
from .serializers import DiaryEntrySerializer
from django.shortcuts import render, get_object_or_404

# Create your views here.
@api_view(['GET', 'POST'])
# @permission_classes([IsAuthenticated])
def diary_list(request):
    if request.method == 'GET':
        entries = DiaryEntry.objects.filter(user=request.user)
        serializer = DiaryEntrySerializer(entries, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = DiaryEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
# @permission_classes([IsAuthenticated])
def diary_detail(request, entry_pk):
    entry = get_object_or_404(DiaryEntry, pk=entry_pk, user=request.user)

    if request.method == 'GET':
        serializer = DiaryEntrySerializer(entry)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = DiaryEntrySerializer(entry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)