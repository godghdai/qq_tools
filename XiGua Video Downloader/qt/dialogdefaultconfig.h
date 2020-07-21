#ifndef DIALOGDEFAULTCONFIG_H
#define DIALOGDEFAULTCONFIG_H

#include <QDialog>
#include <QFileDialog>
#include <QDir>
#include <QStandardPaths>
#include "config.h"

namespace Ui {
class DialogDefaultConfig;
}

class DialogDefaultConfig : public QDialog
{
    Q_OBJECT

public:
    explicit DialogDefaultConfig(Config *config,QWidget *parent = nullptr);
    ~DialogDefaultConfig();

private slots:
    void on_pushButton_select_dir_clicked();

private:
    Ui::DialogDefaultConfig *ui;
    Config *config;

};

#endif // DIALOGDEFAULTCONFIG_H
