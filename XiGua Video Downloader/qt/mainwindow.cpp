#include "mainwindow.h"
#include "ui_mainwindow.h"
#include "dialogconfigparams.h"
#include "dialogdefaultconfig.h"
#include "downloader.h"
#include <QTime>
#include <tools.h>
#include <tools2.h>
#include "httpbase.h"


MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    reply=Q_NULLPTR;
    setWindowIcon(QIcon(":/res/app.ico"));
    config=new Config();
}

MainWindow::~MainWindow()
{
    delete ui;
    delete config;
}



void MainWindow::show_dialog(QByteArray& qbyteArray) {
    QRegExp reg_json("<script[^<]*>window\\._SSR_HYDRATED_DATA=(.*)</script>");
    reg_json.setMinimal(true);
    QTextCodec *codec = QTextCodec::codecForHtml(qbyteArray);
    QString codeContent = codec->toUnicode(qbyteArray);
    int pos = reg_json.indexIn(codeContent);
    if(pos==-1){
        if (QMessageBox::warning(this, tr("SSL Errors"),
                                 tr("One or more SSL errors has occurred:\n%1").arg("errorString"),
                                 QMessageBox::Ignore | QMessageBox::Abort) == QMessageBox::Ignore)
            return;
    }
    //QMessageBox::information(NULL, "Title",ssd, QMessageBox::Yes | QMessageBox::No, QMessageBox::Yes);
    QList<DownLoadInfo> video_infos;
    QList<DownLoadInfo> audio_infos;
    xigua_json_parser.getUrls(reg_json.cap(1).toUtf8(),title,video_infos,audio_infos);

    DialogConfigParams *pDialog = new DialogConfigParams(config,title,video_infos,audio_infos,this);
    pDialog->setWindowTitle(QStringLiteral("选择"));
    connect(pDialog,&DialogConfigParams::returnResult,this,&MainWindow::select_result);
    pDialog->exec();
    delete pDialog;

}


void MainWindow::select_result(
        QString video_url,
        QString audio_url,
        QString save_dir_path,
        QString save_filename,
        QString file_type){

    QDir dir(save_dir_path);

    qDebug()<<video_url;
    qDebug()<<audio_url;
    //D://Documents/QtDocument/build-xigua_my-Desktop_Qt_5_14_2_MinGW_32_bit-Release/release/%1.mp4
    QString in_audio_filename =dir.absoluteFilePath(QString("%1_audio.m4v").arg(save_filename));
    QString in_video_filename =dir.absoluteFilePath(QString("%1_video.m4v").arg(save_filename));
    QString out_filename =dir.absoluteFilePath(QString("%1.%2").arg(save_filename).arg(file_type));

    if(ui->checkBox_only_audio->checkState()==Qt::Checked){
        out_filename =dir.absoluteFilePath(QString("%1.mp3").arg(save_filename));
        Downloader* dl2= new Downloader();
        QObject::connect(dl2,&Downloader::onFinished,this,[=](){

            ConverToMp3(in_audio_filename.toLocal8Bit().data(),out_filename.toLocal8Bit().data());
            RemoveFile(in_audio_filename);
        });

        QObject::connect(dl2,&Downloader::onProgress,this,[=](qint64 recv_total, qint64 all_total){
            ui->progressBar->setMaximum(all_total);
            ui->progressBar->setValue(recv_total);
        });

        dl2->start(audio_url,in_audio_filename);
    }else{
        Downloader* dl= new Downloader();
        QObject::connect(dl,&Downloader::onFinished,this,[=](){
            Downloader* dl2= new Downloader();
            QObject::connect(dl2,&Downloader::onFinished,this,[=](){

                MergeToOne(in_audio_filename.toLocal8Bit().data(),in_video_filename.toLocal8Bit().data(),out_filename.toLocal8Bit().data());
                RemoveFile(in_audio_filename);
                RemoveFile(in_video_filename);
            });

            QObject::connect(dl2,&Downloader::onProgress,this,[=](qint64 recv_total, qint64 all_total){
                ui->progressBar->setMaximum(all_total);
                ui->progressBar->setValue(recv_total);
            });

            dl2->start(audio_url,in_audio_filename);

        });

        QObject::connect(dl,&Downloader::onProgress,this,[=](qint64 recv_total, qint64 all_total){
            ui->progressBar->setMaximum(all_total);
            ui->progressBar->setValue(recv_total);
        });

        dl->start(video_url,in_video_filename);

    }


}

void MainWindow::on_download_button_clicked()
{

    HttpBase *http=new HttpBase();
    http->get(ui->lineEdit_url->text());
    connect(http,&HttpBase::onFinishedSignal,this,&MainWindow::show_dialog);

}


void MainWindow::on_action_about_triggered()
{
    QMessageBox::about(this,"关于","E-mail:<font color='red'>godghdai@gmail.com</font><br/><a href='https://github.com/godghdai/tools'>https://github.com/godghdai/tools</a>");
}

void MainWindow::on_action_app_config_triggered()
{
    DialogDefaultConfig *pDialog = new DialogDefaultConfig(config,this);
    pDialog->setWindowTitle(QStringLiteral("默认配置"));
    //connect(pDialog,&DialogConfigParams::returnResult,this,&MainWindow::select_result);
    pDialog->exec();
    delete pDialog;
}
