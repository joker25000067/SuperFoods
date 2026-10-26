/**
 * Helper to generate and download Windows double-click desktop launcher files
 */

export function getAppUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.href.split('#')[0].split('?')[0];
  }
  return 'https://ais-dev-fjj7tkpcsfpeprnuylzdf7-220829424935.asia-southeast1.run.app';
}

/**
 * Downloads a Windows .bat batch file that launches the app in standalone desktop window mode
 */
export function downloadWindowsBat(factoryName: string = 'Factory Record System') {
  const url = getAppUrl();
  const safeTitle = factoryName.replace(/[^a-zA-Z0-9 -]/g, '').trim() || 'Factory System';

  const batContent = `@echo off
:: =====================================================================
:: ${safeTitle} - Desktop Double Click Launcher
:: Double-click this icon on your Windows PC to run the Factory App
:: =====================================================================
title ${safeTitle}
echo Starting ${safeTitle}...
echo.

:: Try Microsoft Edge Standalone App Window (Default on Windows 10/11)
start msedge --app="${url}"
if %ERRORLEVEL% EQU 0 goto :done

:: Try Google Chrome Standalone App Window
start chrome --app="${url}"
if %ERRORLEVEL% EQU 0 goto :done

:: Fallback to default browser
start "" "${url}"

:done
exit
`;

  triggerDownload('Factory_Record_System.bat', batContent, 'application/x-bat');
}

/**
 * Downloads a Windows Desktop Internet Shortcut (.url)
 */
export function downloadWindowsUrl(factoryName: string = 'Factory Record System') {
  const url = getAppUrl();
  const safeTitle = factoryName.replace(/[^a-zA-Z0-9 -]/g, '').trim() || 'Factory_Record_System';
  const iconUrl = `${url.replace(/\/$/, '')}/favicon.png`;

  const urlContent = `[InternetShortcut]
URL=${url}
IconIndex=0
IconFile=${iconUrl}
`;

  triggerDownload(`${safeTitle.replace(/\s+/g, '_')}.url`, urlContent, 'application/internet-shortcut');
}

/**
 * Downloads a Silent VBScript runner (launches standalone app window without any black CMD console box)
 */
export function downloadWindowsVbs(factoryName: string = 'Factory Record System') {
  const url = getAppUrl();
  const safeTitle = factoryName.replace(/[^a-zA-Z0-9 -]/g, '').trim() || 'Factory System';

  const vbsContent = `' ${safeTitle} Silent Double-Click Desktop Launcher
Set WshShell = CreateObject("WScript.Shell")
On Error Resume Next
' Launch Microsoft Edge in standalone app window
res = WshShell.Run("msedge.exe --app=""" & "${url}" & """", 1, False)
If res <> 0 Then
    ' Fallback to Google Chrome
    res = WshShell.Run("chrome.exe --app=""" & "${url}" & """", 1, False)
End If
If res <> 0 Then
    WshShell.Run """" & "${url}" & """", 1, False
End If
Set WshShell = Nothing
`;

  triggerDownload('Launch_Factory_System.vbs', vbsContent, 'text/vbscript');
}

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
