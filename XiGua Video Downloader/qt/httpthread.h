#ifndef HTTPTHREAD_H
#define HTTPTHREAD_H
#include <QThread>

class HttpThread : public QThread
{
    Q_OBJECT
protected:
    void run();
public:
    HttpThread();
};

#endif // HTTPTHREAD_H
