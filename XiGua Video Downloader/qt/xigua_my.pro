QT       += core gui

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

CONFIG += c++11

# The following define makes your compiler emit warnings if you use
# any Qt feature that has been marked deprecated (the exact warnings
# depend on your compiler). Please consult the documentation of the
# deprecated API in order to know how to port your code away from it.
DEFINES += QT_DEPRECATED_WARNINGS

# You can also make your code fail to compile if it uses deprecated APIs.
# In order to do so, uncomment the following line.
# You can also select to disable deprecated APIs only up to a certain version of Qt.
#DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0

SOURCES += \
    config.cpp \
    def.cpp \
    dialogconfigparams.cpp \
    dialogdefaultconfig.cpp \
    downloader.cpp \
    httpbase.cpp \
    httpthread.cpp \
    main.cpp \
    mainwindow.cpp \
    tools.cpp \
    tools2.cpp \
    xiguajsonparser.cpp



win32 {
INCLUDEPATH += $$PWD/ffmpeg-4.0.2-win32-dev/include
LIBS += $$PWD/ffmpeg-4.0.2-win32-dev/lib/avformat.lib   \
        $$PWD/ffmpeg-4.0.2-win32-dev/lib/avcodec.lib    \
        $$PWD/ffmpeg-4.0.2-win32-dev/lib/avdevice.lib   \
        $$PWD/ffmpeg-4.0.2-win32-dev/lib/avfilter.lib   \
        $$PWD/ffmpeg-4.0.2-win32-dev/lib/avutil.lib     \
        $$PWD/ffmpeg-4.0.2-win32-dev/lib/postproc.lib   \
        $$PWD/ffmpeg-4.0.2-win32-dev/lib/swresample.lib \
        $$PWD/ffmpeg-4.0.2-win32-dev/lib/swscale.lib
}

HEADERS += \
    config.h \
    def.h \
    dialogconfigparams.h \
    dialogdefaultconfig.h \
    downloader.h \
    httpbase.h \
    httpthread.h \
    mainwindow.h \
    tools.h \
    tools2.h \
    xiguajsonparser.h

FORMS += \
    dialogconfigparams.ui \
    dialogdefaultconfig.ui \
    mainwindow.ui

# Default rules for deployment.
qnx: target.path = /tmp/$${TARGET}/bin
else: unix:!android: target.path = /opt/$${TARGET}/bin
!isEmpty(target.path): INSTALLS += target

QT += network

RC_ICONS =res/app2.ico

RESOURCES += \
    xigua_res.qrc

