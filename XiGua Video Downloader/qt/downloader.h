#ifndef DOWNLOADER_H
#define DOWNLOADER_H

#include <QtWidgets>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QFile>

class Downloader: public QObject
{
    Q_OBJECT

public:
    Downloader();

    QNetworkAccessManager *manager;
    QNetworkReply *reply;
    QFile *file;

    void doProcessReadyRead();
    void doProcessFinished();
    void doProcessDownloadProgress(qint64,qint64);
    void doProcessError(QNetworkReply::NetworkError code);
    void start(QString,QString);

signals:
    void onFinished();
    void onProgress(qint64,qint64);
    void onError(QString message);

};

#endif // DOWNLOADER_H
