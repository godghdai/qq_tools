#include "tools.h"
extern "C"
{
    #include <libavformat/avformat.h>
}


QString GetFileSize(qint64 size){
    if (!size) {
        return "0 Bytes";
    }
    static QStringList SizeNames;
    if(SizeNames.empty()){
        SizeNames << " Bytes" << " KB" << " MB"
                  << " GB" << " TB" << " PB" << " EB" << " ZB" << " YB";
    }
    int i = qFloor(qLn(size) / qLn(1024));
    return QString::number(size*1.0/qPow(1024, qFloor(i)),
                           'f', (i > 1) ? 2 : 0 ) + SizeNames.at(i);
}

void RemoveFile(QString fileName)
{

    QFileInfo fileInfo(fileName);
    if (fileInfo.exists())
    {
        QFile::remove(fileName);
    }
}


std::unique_ptr<QFile> openFileForWrite(const QString &fileName)
{
    std::unique_ptr<QFile> file(new QFile(fileName));
    if (!file->open(QIODevice::WriteOnly)) {
        return nullptr;
    }
    return file;
}


const int AUDIO_STREAM_INDEX = 0;
const int VIDEO_STREAM_INDEX = 1;

int init_fmt_ctx(AVFormatContext **ctx, char *filename) {
    if (avformat_open_input(ctx, filename, 0, 0) < 0) {
        fprintf(stderr, "Could not open input file '%s'", filename);
        return -1;
    }
    if (avformat_find_stream_info(*ctx, 0) < 0) {
        fprintf(stderr, "Failed to retrieve input stream information");
        return -1;
    }

    av_dump_format(*ctx, 0, filename, 0);
    return 1;
}

int copy_avcodec_parameters(AVFormatContext *out_fmt_ctx, AVFormatContext *in_fmt_ctx, int index) {
    AVStream *in_stream = in_fmt_ctx->streams[0];
    AVStream *out_stream = avformat_new_stream(out_fmt_ctx, NULL);
    if (!out_stream) {
        fprintf(stderr, "Failed allocating output stream\n");
        return -1;
    }
    out_stream->index = index;
    if (avcodec_parameters_copy(out_stream->codecpar, in_stream->codecpar) < 0) {
        fprintf(stderr, "Failed to copy codec parameters\n");
        return -1;
    }
    out_stream->codecpar->codec_tag = 0;
    return 1;
}


void MergeToOne(char *in_audio_filename, char *in_video_filename, char *out_filename) {

    AVFormatContext *in_audio_fmt_ctx = NULL;
    AVFormatContext *in_video_fmt_ctx = NULL;
    AVFormatContext *out_fmt_ctx = NULL;
    int frame_index = 0;
    int stream_index = 0;
    int64_t cur_pts_v = 0, cur_pts_a = 0;
    AVPacket pkt;


    if (init_fmt_ctx(&in_audio_fmt_ctx, in_audio_filename) < 0) goto end;
    if (init_fmt_ctx(&in_video_fmt_ctx, in_video_filename) < 0) goto end;

    avformat_alloc_output_context2(&out_fmt_ctx, NULL, NULL, out_filename);
    if (!out_fmt_ctx) {
        fprintf(stderr, "Could not create output context\n");
        goto end;
    }

    if (copy_avcodec_parameters(out_fmt_ctx, in_audio_fmt_ctx, AUDIO_STREAM_INDEX) < 0) goto end;
    if (copy_avcodec_parameters(out_fmt_ctx, in_video_fmt_ctx, VIDEO_STREAM_INDEX) < 0) goto end;

    av_dump_format(out_fmt_ctx, 0, out_filename, 1);

    if (!(out_fmt_ctx->flags & AVFMT_NOFILE)) {
        if (avio_open(&out_fmt_ctx->pb, out_filename, AVIO_FLAG_WRITE) < 0) {
            fprintf(stderr, "Could not open output file '%s'", out_filename);
            goto end;
        }
    }

    if (avformat_write_header(out_fmt_ctx, NULL) < 0) {
        fprintf(stderr, "Error occurred when opening output file\n");
        goto end;
    }



    while (1) {

        AVStream *in_stream, *out_stream;

        if (av_compare_ts(cur_pts_v, in_video_fmt_ctx->streams[0]->time_base, cur_pts_a,
                          in_audio_fmt_ctx->streams[0]->time_base) <= 0) {
            stream_index=VIDEO_STREAM_INDEX;
            if (av_read_frame(in_video_fmt_ctx, &pkt) >= 0) {
                do {
                    in_stream = in_video_fmt_ctx->streams[pkt.stream_index];
                    out_stream = out_fmt_ctx->streams[VIDEO_STREAM_INDEX];
                    if (pkt.pts == AV_NOPTS_VALUE) {
                        //Write PTS
                        AVRational time_base1 = in_stream->time_base;
                        //Duration between 2 frames (us)
                        int64_t calc_duration = (double) AV_TIME_BASE / av_q2d(in_stream->r_frame_rate);
                        //Parameters
                        pkt.pts = (double) (frame_index * calc_duration) / (double) (av_q2d(time_base1) * AV_TIME_BASE);
                        pkt.dts = pkt.pts;
                        pkt.duration = (double) calc_duration / (double) (av_q2d(time_base1) * AV_TIME_BASE);
                        frame_index++;
                    }

                    cur_pts_v = pkt.pts;
                    break;

                } while (av_read_frame(in_video_fmt_ctx, &pkt) >= 0);
            } else {
                break;
            }
        } else {
            stream_index=AUDIO_STREAM_INDEX;
            if (av_read_frame(in_audio_fmt_ctx, &pkt) >= 0) {
                do {
                    in_stream = in_audio_fmt_ctx->streams[pkt.stream_index];
                    out_stream = out_fmt_ctx->streams[AUDIO_STREAM_INDEX];

                    if (pkt.pts == AV_NOPTS_VALUE) {
                        //Write PTS
                        AVRational time_base1 = in_stream->time_base;
                        //Duration between 2 frames (us)
                        int64_t calc_duration = (double) AV_TIME_BASE / av_q2d(in_stream->r_frame_rate);
                        //Parameters
                        pkt.pts = (double) (frame_index * calc_duration) /
                                  (double) (av_q2d(time_base1) * AV_TIME_BASE);
                        pkt.dts = pkt.pts;
                        pkt.duration = (double) calc_duration / (double) (av_q2d(time_base1) * AV_TIME_BASE);
                        frame_index++;
                    }
                    cur_pts_a = pkt.pts;

                    break;

                } while (av_read_frame(in_audio_fmt_ctx, &pkt) >= 0);
            } else {
                break;
            }

        }

        //Convert PTS/DTS
        pkt.pts = av_rescale_q_rnd(pkt.pts, in_stream->time_base, out_stream->time_base,
                                   (enum AVRounding)(AV_ROUND_NEAR_INF | AV_ROUND_PASS_MINMAX));
        pkt.dts = av_rescale_q_rnd(pkt.dts, in_stream->time_base, out_stream->time_base,
                                    (enum AVRounding)(AV_ROUND_NEAR_INF | AV_ROUND_PASS_MINMAX));

        pkt.duration = av_rescale_q(pkt.duration, in_stream->time_base, out_stream->time_base);
        pkt.pos = -1;
        pkt.stream_index = stream_index;
        //printf("Write 1 Packet. size:%5d\tpts:%lld\n", pkt.size, pkt.pts);
        if (av_interleaved_write_frame(out_fmt_ctx, &pkt) < 0) {
            printf("Error muxing packet\n");
            break;
        }
        av_packet_unref(&pkt);

    }

    av_write_trailer(out_fmt_ctx);

    end:
    avformat_close_input(&in_audio_fmt_ctx);
    avformat_close_input(&in_video_fmt_ctx);

    if (out_fmt_ctx && !(out_fmt_ctx->flags & AVFMT_NOFILE))
        avio_closep(&out_fmt_ctx->pb);

    avformat_free_context(out_fmt_ctx);
}

















