#ifndef DIALOGCONFIGPARAMS_H
#define DIALOGCONFIGPARAMS_H

#include <QDialog>
#include <QMessageBox>
#include <def.h>
#include <config.h>
#include <QPushButton>
#include <QFileDialog>
namespace Ui {
class DialogConfigParams;
}

class DialogConfigParams : public QDialog
{
    Q_OBJECT

public:
    explicit DialogConfigParams(QWidget *parent = nullptr);
    explicit DialogConfigParams(
            Config *config,
            QString &title,
            QList<DownLoadInfo> &video_list,
            QList<DownLoadInfo> &audio_list,
            QWidget *parent = nullptr);
    ~DialogConfigParams();

signals:
    void returnResult(
            QString video_url,
            QString audio_url,
            QString save_dir_path,
            QString save_filename,
            QString file_type);

private slots:
    void on_buttonBox_accepted();
    void on_DialogConfigParams_rejected();
    void on_pushButton_select_dir_clicked();

private:
    Ui::DialogConfigParams *ui;
    QList<DownLoadInfo> &video_list;
    QList<DownLoadInfo> &audio_list;
    Config *config;
};

#endif // DIALOGCONFIGPARAMS_H
