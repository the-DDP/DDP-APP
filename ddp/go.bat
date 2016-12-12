call cordova build android
call adb uninstall com.clearwhale.ddp
call adb install -r C:/ddp/ddp/platforms/android/build/outputs/apk/android-debug.apk