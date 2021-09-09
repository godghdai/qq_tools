#ifndef XIGUAJSONPARSER_H
#define XIGUAJSONPARSER_H

#include <QObject>
#include <QFile>
#include <QDir>
#include<QJsonDocument>
#include<QJsonObject>
#include<QJsonArray>
#include <QDebug>
#include <memory>
#include <algorithm>
#include <iostream>

#include <QMetaType>
#include <def.h>






class XiGuaJsonParser       
{

public:
    XiGuaJsonParser();
    std::unique_ptr<QFile> openFileForWrite(const QString &fileName);
    void writeJson();
    void writeFile(QString data);
    void getUrls(const QByteArray &data,QString &title,QList<DownLoadInfo> &video_list,QList<DownLoadInfo> &audio_list);
};





#endif // XIGUAJSONPARSER_H


