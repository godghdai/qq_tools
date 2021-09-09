#ifndef TOOLS_H
#define TOOLS_H

#include<QString>
#include<QStringList>
#include <QtMath>
#include <memory>
#include <QFile>
#include <QTextCodec>
#include <QFileInfo>

QString GetFileSize(qint64 size);
void MergeToOne(char * in_audio_filename,char *in_video_filename,char *out_filename);
void RemoveFile(QString fileName);
#endif // TOOLS_H
