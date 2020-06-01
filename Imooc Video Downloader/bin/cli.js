#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const Imooc = require("../imooc");
const imooc = Imooc({ maxOccurs: 4 });
const { api, downloader } = imooc;
const remuxer = require("../core/common/remuxer");
const cookies = require("../core/common/cookies");

const VIDEO_QUALITY_HIGTH = 0;
const VIDEO_QUALITY_MEDIUM = 1;
const VIDEO_QUALITY_LOW = 2;

var ProgressBar = require('../imooc/progress_bar');
var pb = new ProgressBar('下载进度', 30);

const reg_learn_list = /https:\/\/coding\.imooc\.com\/learn\/list\/(?<cid>\d+)\.html/;
const reg_lesson = /https:\/\/coding\.imooc\.com\/lesson\/(?<cid>\d+)\.html#mid=(?<mid>\d+)/;

program
  .version('0.1.0')
  .usage('<url> [options]')
  .option('-q, --quality <quality>', '视频质量（h=好,m=中,l=差)', "m")
  .option('-o, --download_dir <path>', '下载后保存的文件夹', "")
  .option('-f, --filter <regex>', '设置过滤条件', "")
  .option('-nd, --no_download', '显示过滤结果,不下载', false)
  .option('-c, --cookie_text <text>', '设置cookie', "");

program.parse(process.argv);
var { download_dir, filter, no_download, quality, cookie_text, args } = program;

var filter_reg = /.*/;
var video_quality = VIDEO_QUALITY_MEDIUM;
switch (quality) {
  case "h":
    video_quality = VIDEO_QUALITY_HIGTH;
    break;
  case "m":
    video_quality = VIDEO_QUALITY_MEDIUM;
    break;
  case "l":
    video_quality = VIDEO_QUALITY_LOW;
    break;
  default:
    console.log("视频质量参数有误！！")
}

if (cookies.get() == "") {

  console.log("请先设置cookie");
  return;
}

if (cookie_text != "") {
  cookies.save(cookie_text);
  console.log("cookies saved")
}

if (filter != "") {
  filter_reg = new RegExp(filter);
}

if (args.length > 1) {
  console.log("目前只支持一个下载地址");
  return;
}
if (args.length == 0) {
  console.log("下载地址不能为空");
  return;
}

var download_url = args[0];

if (download_dir == "") {
  download_dir = process.cwd();
}

if (reg_learn_list.test(download_url)) {
  var { cid } = download_url.match(reg_learn_list).groups;
  //console.log(cid);
  if (no_download) {
    showfilterResult(cid, filter_reg);
  } else
    downloadMultipleMedia(cid, download_dir, filter_reg, video_quality);
  return;
}
if (reg_lesson.test(download_url)) {
  var { cid, mid } = download_url.match(reg_lesson).groups;
  //console.log(cid, mid);
  downloadOneMedia(cid, mid, download_dir, video_quality);
  return;
}
console.log("下载地址不合法");


function getDownloaderPromise(downloadDir, key, links) {
  return new Promise((resolve, reject) => {
    fs.ensureDirSync(downloadDir);
    downloader.setParam({
      "key": key,
      "links": links,
      "downloadDir": downloadDir
    }
    ).start({
      "onComplete": function (err) {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }
        resolve(true);

      }, "onProgress": function (num, total) {
        pb.render({ completed: num, total: total });
      }
    })
  });
}

async function downloadOneMedia(cid, mid, baseDownloadDir, video_quality) {
  var { relativeDirPath, mp4FileName } = await api.getMediaInfo(cid, mid);
  var { key, links } = await api.getM3u8Info(cid, mid, video_quality);
  var downloadDir = path.resolve(baseDownloadDir, relativeDirPath);
  await getDownloaderPromise(downloadDir, key, links);
  console.log("");
  // finished");
  remuxer(downloadDir, path.join(path.resolve(downloadDir, "../"), mp4FileName));
  //console.log("remuxer finished");
  fs.removeSync(downloadDir);
}

async function showfilterResult(cid, filter_reg) {

  var detail = await api.get_detail_cache(cid);
  var medias = api.filterMediaInfo(detail, item => filter_reg.test(item.spath));
  if (medias.length == 0) {
    console.log("medias length must be >0");
    return;
  }
  var strs = medias.map(media => media.title).join("\n");
  console.log(strs);
  return;
}

async function downloadMultipleMedia(cid, baseDownloadDir, filter_reg, video_quality) {


  var detail = await api.get_detail_cache(cid);
  var medias = api.filterMediaInfo(detail, item => filter_reg.test(item.spath));

  if (medias.length == 0) {
    console.log("medias length must be >0");
    return;
  }

  for (let i = 0; i < medias.length; i++) {
    const { cid, mid, spath } = medias[i];

    console.log(`【${spath}】 下载中......`);
    await downloadOneMedia(cid, mid, baseDownloadDir, video_quality);
    console.log(`【${spath}】 下载完成` + "\n");
  }
  console.log("all download finished");

}
