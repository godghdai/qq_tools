#ifndef HTTPBASE_H
#define HTTPBASE_H

#include <QtWidgets>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QNetworkRequest>

class HttpBase:public QObject
{
    Q_OBJECT

signals:
    void onFinishedSignal(QByteArray &bytes);
    void onErrorSignal(const QString &message);

public:
    HttpBase();
    ~HttpBase();
    QNetworkAccessManager *manager;
    QNetworkReply *reply=nullptr;

    virtual void onReadyRead();
    virtual void onFinished();
    virtual void onProgress(qint64,qint64);
    virtual void onError(QNetworkReply::NetworkError code);
    void cancel();
    void get(const QString &url);

    void setHeads(QMap<QString, QString> &heads);
private:
    QMap<QString, QString> _heads;
    bool httpRequestAborted;
    void requestInit(QNetworkRequest &request);

};

#endif // HTTPBASE_H
