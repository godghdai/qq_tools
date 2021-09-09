#include "httpbase.h"

HttpBase::HttpBase()
{
    manager = new QNetworkAccessManager(this);
    httpRequestAborted=false;
    qDebug() << manager->supportedSchemes();
}
HttpBase::~HttpBase(){
    disconnect(reply,&QNetworkReply::readyRead,this,&HttpBase::onReadyRead);
    disconnect(reply,&QNetworkReply::finished,this,&HttpBase::onFinished);
    disconnect(reply,&QNetworkReply::downloadProgress,this,&HttpBase::onProgress);
    disconnect(reply,QOverload<QNetworkReply::NetworkError>::of(&QNetworkReply::error),
            this,&HttpBase::onError);
}

void HttpBase::requestInit(QNetworkRequest &request){
    QSslConfiguration conf = request.sslConfiguration();
    conf.setPeerVerifyMode(QSslSocket::VerifyNone);
    conf.setProtocol(QSsl::TlsV1SslV3);
    request.setSslConfiguration(conf);
    request.setRawHeader("Referer","https://www.ixigua.com");
    request.setRawHeader("User-Agent","Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36");
}

void HttpBase::get(const QString &url){
    QNetworkRequest request;
    requestInit(request);
    request.setUrl(QUrl(url));
    reply = manager->get(request);
    connect(reply,&QNetworkReply::readyRead,this,&HttpBase::onReadyRead);
    connect(reply,&QNetworkReply::finished,this,&HttpBase::onFinished);
    connect(reply,&QNetworkReply::downloadProgress,this,&HttpBase::onProgress);
    connect(reply,QOverload<QNetworkReply::NetworkError>::of(&QNetworkReply::error),this,&HttpBase::onError);
}


void HttpBase::cancel()
{
    httpRequestAborted = true;
    reply->abort();
}


void HttpBase::onReadyRead()
{

}

void HttpBase::onFinished()
{
    reply->deleteLater();
    if (httpRequestAborted) {
        reply->deleteLater();
        reply = nullptr;
        return;
    }

    QVariant statusCode = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute);
    if(statusCode.isValid()){
        qDebug() << "status code=" << statusCode.toInt();
    }

    QVariant reason = reply->attribute(QNetworkRequest::HttpReasonPhraseAttribute).toString();
    if(reason.isValid()){
        qDebug() << "reason=" << reason.toString();
    }

    QNetworkReply::NetworkError err = reply->error();
    if(err != QNetworkReply::NoError) {
        qDebug() << "Failed: " << reply->errorString();
        return;
    }
    QByteArray qbyteArray=reply->readAll();
    emit onFinishedSignal(qbyteArray);

}

void HttpBase::onProgress(qint64 recv_total, qint64 all_total)
{

}

void HttpBase::onError(QNetworkReply::NetworkError code)
{
    emit onErrorSignal("error");
}
