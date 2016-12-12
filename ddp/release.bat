setlocal

set APKDIR=C:\ddp\ddp\platforms\android\build\outputs\apk



REM --- Generates a new key: 
REM 	keytool -genkey -v -keystore ClearWhale.keystore -alias ClearWhale -keyalg RSA -keysize 2048 -validity 100000

REM --- build
call cordova build android --release --keystore="%APKDIR%\ClearWhale.keystore"

REM ---	sign the apk.

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore %APKDIR%\ClearWhale.keystore %APKDIR%\android-release-unsigned.apk ClearWhale


REM --- zipalign it

zipalign -f -v 4 %APKDIR%\android-release-unsigned.apk %APKDIR%\android-release.apk


REM --- Display the sig hash

keytool -exportcert -alias ClearWhale -keystore %APKDIR%\ClearWhale.keystore | openssl sha1 -binary | openssl base64


REM --- Show the APK dir

dir %APKDIR%


REM --- deploy

call adb uninstall com.clearwhale.ddp
call adb install -r %APKDIR%/android-release.apk

endlocal