#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QNetworkAccessManager>
#include <QDebug>
#include <QUrl>
#include "config.h"
#include "xiguajsonparser.h"
#include <QtNetwork>

QT_BEGIN_NAMESPACE
namespace Ui { class MainWindow; }
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();


private slots:
    void on_download_button_clicked();
    void select_result(
            QString video_url,
            QString audio_url,
            QString save_dir_path,
            QString save_filename,
            QString file_type);
    void show_dialog(QByteArray& qbyteArray);
    void on_action_about_triggered();
    void on_action_app_config_triggered();

private:
    Ui::MainWindow *ui;
    QUrl url;
    QNetworkAccessManager manager;
    QNetworkReply *reply;
    QString html_text;
    XiGuaJsonParser xigua_json_parser;
    QString title;

public:
    Config *config=nullptr;

};
#endif // MAINWINDOW_H
