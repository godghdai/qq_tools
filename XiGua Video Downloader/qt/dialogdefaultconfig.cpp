#include "dialogdefaultconfig.h"
#include "ui_dialogdefaultconfig.h"

DialogDefaultConfig::DialogDefaultConfig(Config *config,QWidget *parent) :
    QDialog(parent),
    ui(new Ui::DialogDefaultConfig),
    config(config)
{
    ui->setupUi(this);
    //QDir::currentPath()
    if (config!=nullptr){
        ui->lineEdit_dir_path->setText(config->Get("config","dir_path").toString());
    }else{
        QString desktop_path = QStandardPaths::writableLocation(QStandardPaths::DocumentsLocation);
        ui->lineEdit_dir_path->setText(desktop_path);
        config->Set("config","dir_path",desktop_path);
    }

}

DialogDefaultConfig::~DialogDefaultConfig()
{
    delete ui;
}

void DialogDefaultConfig::on_pushButton_select_dir_clicked()
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
        ui->lineEdit_dir_path->setText(select_dir);
        config->Set("config","dir_path",select_dir);
    }

}
