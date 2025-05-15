from django.shortcuts import render
import json

def cra_page_view(request):
    initial_data = {
        'user_name': request.user.username if request.user.is_authenticated else 'Guest',
        'app_version': '1.0-cra',
        'features_enabled': ['featureA', 'featureB']
    }
    # json_scriptタグ用に辞書をそのまま渡す
    return render(request, 'app/cra_page.html', {'initial_react_data': initial_data})

def cra_page_loader_view(request):
    # Reactに渡したいデータをPythonの辞書として定義します
    initial_data = {
        'user_name': request.user.username if request.user.is_authenticated else 'Guest',
        'app_version': '1.0-cra-dynamic',
        'features_enabled': ['featureX', 'featureY'],
        'some_other_data': 'これはDjangoからのデータです'
    }
    # テンプレート名は実際のファイル名に合わせてください
    return render(request, 'app/cra_page_loader.html', {'initial_react_data': initial_data})