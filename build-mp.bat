@echo off
REM ============================================================
REM  漫思茶前端构建脚本（小程序 + H5）
REM  说明：
REM   1. 本工程原为 HBuilderX 布局（源码在根目录），uni-app CLI 默认找 src/，
REM      故用 UNI_INPUT_DIR 指向工程根目录，避免移动文件破坏 HBuilderX 工程。
REM   2. 构建产物 project.config.json 里的 AppID 是原作者的（wx2b46...），
REM      当前账号不是该小程序开发者，开发者工具会反复弹「更改 AppID 失败」。
REM      构建后统一改写为 touristappid（游客模式）供本地预览。
REM ============================================================
setlocal
set W=%~dp0
set UNI_INPUT_DIR=%W:~0,-1%

echo [1/3] 构建小程序 (mp-weixin) ...
call npx uni build -p mp-weixin
if errorlevel 1 ( echo 构建失败 & pause & exit /b 1 )

echo [2/3] 同步产物到开发者工具监视目录 ...
xcopy "%W%dist\build\mp-weixin\*" "%W%unpackage\dist\dev\mp-weixin\" /E /Y /I /Q >nul

echo [3/3] 改写 AppID 为 touristappid（游客模式）...
powershell -NoProfile -Command "$f='%W%unpackage\dist\dev\mp-weixin\project.config.json'; $c=Get-Content $f -Raw -Encoding utf8; $c=$c -replace '\"appid\"\s*:\s*\"wx2b46ab27ed3e679a\"','\"appid\": \"touristappid\"'; [System.IO.File]::WriteAllText($f,$c,[System.Text.UTF8Encoding]::new($false)); Write-Host ('  appid -> ' + (Get-Content $f -Raw | ConvertFrom-Json).appid)"

echo.
echo 完成。开发者工具会自动重新编译。
echo   H5 构建: npm run build:h5  （需先解决 App.vue 的 .wxss 引入）
pause
