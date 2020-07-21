#include "xiguajsonparser.h"
#include "tools.h"

XiGuaJsonParser::XiGuaJsonParser()
{

}



bool subDevListSort(const DownLoadInfo &info1, const DownLoadInfo &info2)
{

    return info1.bitrate >info2.bitrate;

}



void XiGuaJsonParser::getUrls(const QByteArray &data,QString &title, QList<DownLoadInfo> &video_infos, QList<DownLoadInfo> &audio_infos){

    QJsonParseError parseJsonErr;
    QJsonDocument document = QJsonDocument::fromJson(data,&parseJsonErr);
    if(!(parseJsonErr.error == QJsonParseError::NoError))
    {
        qDebug()<<"解析json文件错误！";
        return;
    }

    QJsonObject jsonObject = document.object();


    QJsonObject anyVideo= jsonObject.value("anyVideo").toObject();
    QJsonObject gidInformation= anyVideo.value("gidInformation").toObject();
    QJsonObject packerData= gidInformation.value("packerData").toObject();
    QJsonObject video= packerData.value("video").toObject();
    qDebug()<<video.value("title").toString();
    title=video.value("title").toString();
    qDebug()<<"video_like_count:"<<video.value("video_like_count").toInt();
    QJsonObject videoResource= video.value("videoResource").toObject();
    QJsonObject dash=videoResource.value("dash").toObject();
    QJsonObject dynamic_video=dash.value("dynamic_video").toObject();
    QJsonArray  dynamic_video_list=dynamic_video.value("dynamic_video_list").toArray();
    QJsonArray  dynamic_audio_list=dynamic_video.value("dynamic_audio_list").toArray();

    //std::sort(dynamic_video_list.begin(), dynamic_video_list.end());
    QList<DownLoadInfo> video_download_infos;
    QList<DownLoadInfo> audio_download_infos;

    QRegExp rxlen("^(\\d+).*");
    for(int idx = 0; idx < dynamic_video_list.size(); idx++)
    {
        //qDebug()<<typeid(video).name();
        QJsonObject icon= dynamic_video_list[idx].toObject();
        QString title=icon.value("definition").toString();
        int pos = rxlen.indexIn(title);
        if(pos==-1){
            continue;
        }

        video_infos.append(DownLoadInfo{
                                        title,
                                        rxlen.cap(1).toInt(),
                                        QByteArray::fromBase64(icon.value("main_url").toString().toUtf8()),
                                        QByteArray::fromBase64(icon.value("backup_url_1").toString().toUtf8())
                                    });

    }
    std::sort(video_infos.begin(), video_infos.end(), subDevListSort);


    for(int idx = 0; idx < dynamic_audio_list.size(); idx++)
    {
        QJsonObject icon= dynamic_audio_list[idx].toObject();
        audio_infos.append(DownLoadInfo{
                                        GetFileSize(icon.value("bitrate").toInt()),
                                        icon.value("bitrate").toInt(),
                                        QByteArray::fromBase64(icon.value("main_url").toString().toUtf8()),
                                        QByteArray::fromBase64(icon.value("backup_url_1").toString().toUtf8())
                                    });


    }
    std::sort(audio_infos.begin(), audio_infos.end(), subDevListSort);


}

void XiGuaJsonParser::writeFile(QString data){
    QFile file("readddd.json");
    file.open(QIODevice::WriteOnly);
    file.write(data.toUtf8());
    file.close();
}

void XiGuaJsonParser::writeJson(){


    /*
    QFile file("D:\\Documents\\QtDocument\\readddd.json");
    file.open(QIODevice::ReadOnly);
    QByteArray data=file.readAll();
    file.close();
*/

    QJsonObject obj;
    QJsonObject sub;
    sub.insert("ip",QJsonValue("192.168.0.1"));
    sub.insert("port",QJsonValue("8080"));
    obj.insert("server",QJsonValue(sub));

    //内存中的数据写到文件
    QJsonDocument doc(obj);
    //将json对象转换成字符串
    QByteArray data=doc.toJson();
    QFile file("temo.json");
    file.open(QIODevice::WriteOnly);
    file.write(data);
    file.close();
}



