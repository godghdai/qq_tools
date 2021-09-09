#include "dialogconfigparams.h"
#include "ui_dialogconfigparams.h"

DialogConfigParams::DialogConfigParams(
        Config *config,
        QString &title,
        QList<DownLoadInfo> &video_list,
        QList<DownLoadInfo> &audio_list,
        QWidget *parent) :
    QDialog(parent),
    ui(new Ui::DialogConfigParams),
    video_list(video_list),
    audio_list(audio_list),
    config(config)
{
    ui->setupUi(this);
    for(auto video:video_list){
        ui->comboBox_video_list->addItem(video.title,video.url);
    }
    for(auto audio:audio_list){
        ui->comboBox_audio_list->addItem(audio.title,audio.url);
    }

    ui->buttonBox->button(QDialogButtonBox::Ok)->setText("确定");
    ui->buttonBox->button(QDialogButtonBox::Cancel)->setText("取消");
    ui->comboBox_file_types->addItems(QString("mp4,mkv,flv").split(","));
    if (config!=nullptr){
        ui->lineEdit_save_dir->setText(config->Get("config","dir_path").toString());
    }
    ui->lineEdit_save_filename->setText(title);
}

DialogConfigParams::~DialogConfigParams()
{
    delete ui;
}


void DialogConfigParams::on_buttonBox_accepted()
{
     emit returnResult(
                ui->comboBox_video_list->currentData().toString(),
                ui->comboBox_audio_list->currentData().toString(),
                ui->lineEdit_save_dir->text(),
                ui->lineEdit_save_filename->text(),
                ui->comboBox_file_types->currentText()
                );
}

void DialogConfigParams::on_DialogConfigParams_rejected()
{

}



void DialogConfigParams::on_pushButton_select_dir_clicked()
{
    QString dir_path="/home";
    if (config!=nullptr){
        dir_path=config->Get("config","dir_path").toString();
    }
    QString select_dir = QFileDialog::getExistingDirectory(this, tr("Open Directory"),
                                                           dir_path ,
                                                           QFileDialog::ShowDirsOnly
                                                           | QFileDialog::DontResolveSymlinks);
    if (select_dir!=""){
        ui->lineEdit_save_dir->setText(select_dir);
        config->Set("config","dir_path",select_dir);
    }
}
