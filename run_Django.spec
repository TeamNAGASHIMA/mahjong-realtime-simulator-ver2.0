# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['mahjong_realtime_simulator\\manage.py'],
    pathex=[],
    binaries=[
        ('C:/mrsv2/env/Lib/site-packages/onnxruntime/capi/onnxruntime_providers_cuda.dll','onnxruntime/capi'),
        ('C:/mrsv2/env/Lib/site-packages/onnxruntime/capi/onnxruntime_providers_shared.dll','onnxruntime/capi'),
        # --- CUDA ---
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/cudart64_12.dll','.'),
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/cublas64_12.dll','.'),
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/cublasLt64_12.dll','.'),
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/cusolver64_11.dll','.'),
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/cusparse64_12.dll','.'),
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/cufft64_11.dll','.'),
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/curand64_10.dll','.'),
        # --- cuDNN 9 ---
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/cudnn64_9.dll','.'),
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/cudnn_engines_runtime_compiled64_9.dll','.'),
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/cudnn_engines_precompiled64_9.dll','.'),
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/cudnn_graph64_9.dll','.'),
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/cudnn_ops64_9.dll','.'),
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/cudnn_cnn64_9.dll', '.'),
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/cudnn_adv64_9.dll', '.'),
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/cudnn_heuristic64_9.dll', '.'),
        # --- zlib ---
        ('C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.6/bin/zlibwapi.dll','.'),
    ],
    datas=[
        ('mahjong_realtime_simulator/pt', 'pt'), 
        ('mahjong_realtime_simulator/frontend/build/static', 'static'), 
        ('mahjong_realtime_simulator/app/templates', 'templates'),
        ('.env', '.')
        ],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True, 
    name='run_django',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='run_django', 
)