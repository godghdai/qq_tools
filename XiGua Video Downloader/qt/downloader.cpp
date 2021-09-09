#include "downloader.h"

Downloader::Downloader()
{
    manager = new QNetworkAccessManager(this);
    file = new QFile(this);
}

void Downloader::start(QString url,QString savefilename){

    file->setFileName(savefilename);
    bool ret = file->open(QIODevice::WriteOnly|QIODevice::Truncate);
    if(!ret)
    {
        emit onError(savefilename+"文件打开失败");
        return;
    }


    QNetworkRequest request;

    QSslConfiguration conf = request.sslConfiguration();
    conf.setPeerVerifyMode(QSslSocket::VerifyNone);
    conf.setProtocol(QSsl::TlsV1SslV3);
    request.setSslConfiguration(conf);
    request.setRawHeader("Referer","https://www.ixigua.com");
    request.setRawHeader("User-Agent","Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36");

    request.setUrl(QUrl(url));
    reply = manager->get(request);
    connect(reply,&QNetworkReply::readyRead,this,&Downloader::doProcessReadyRead);
    connect(reply,&QNetworkReply::finished,this,&Downloader::doProcessFinished);
    connect(reply,&QNetworkReply::downloadProgress,this,&Downloader::doProcessDownloadProgress);
    connect(reply,QOverload<QNetworkReply::NetworkError>::of(&QNetworkReply::error),
            this,&Downloader::doProcessError);


}

void Downloader::doProcessReadyRead()
{

    while(!reply->atEnd())
    {
        QByteArray ba = reply->readAll();
        file->write(ba);
    }
}

void Downloader::doProcessFinished()
{
    file->close();
    emit onFinished();
}

void Downloader::doProcessDownloadProgress(qint64 recv_total, qint64 all_total)
{
    emit onProgress(recv_total,all_total);

}

void Downloader::doProcessError(QNetworkReply::NetworkError code)
{

    emit onError("下载失败！！");
}
