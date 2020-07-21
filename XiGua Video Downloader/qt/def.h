#ifndef DEF_H
#define DEF_H
#include<QString>
#include <QtDebug>

struct DownLoadInfo{
    QString title;
    int bitrate;
    QString url;
    QString backup_url;
    /*
    bool operator<(const DownLoadInfo& s)
    {
        return this->bitrate>s.bitrate;
    }*/
};
Q_DECLARE_METATYPE(DownLoadInfo);
//qRegisterMetaType<DownLoadInfo>(); //注册  跨线程使用信号槽
inline QDebug operator<< (QDebug debug, const DownLoadInfo& t)
{
    debug.nospace()<< "DownLoadInfo("<< t.url << ")";
    return debug.space();
}

#endif // DEF_H
