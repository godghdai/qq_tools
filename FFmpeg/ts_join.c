#include <libavutil/timestamp.h>
#include <libavformat/avformat.h>
#include <io.h>

void log_packet(const AVFormatContext *fmt_ctx, const AVPacket *pkt, const char *tag);


int copy_parameters(AVFormatContext *in_fmt_ctx, AVFormatContext *out_fmt_ctx) {
    AVStream *in_stream, *out_stream;
    for (int i = 0; i < in_fmt_ctx->nb_streams; i++) {

        in_stream = in_fmt_ctx->streams[i];
        AVCodecParameters *in_codecpar = in_stream->codecpar;

        out_stream = avformat_new_stream(out_fmt_ctx, NULL);
        if (!out_stream) {
            fprintf(stderr, "Failed allocating output stream\n");
            return -1;
        }

        int ret = avcodec_parameters_copy(out_stream->codecpar, in_codecpar);
        if (ret < 0) {
            fprintf(stderr, "Failed to copy codec parameters\n");
            return -1;
        }
        out_stream->codecpar->codec_tag = 0;
    }
}



int write_frame(AVFormatContext *in_fmt_ctx, AVFormatContext *out_fmt_ctx) {
    AVPacket pkt;
    AVStream *in_stream, *out_stream;
    int ret;

    while (1) {
        ret = av_read_frame(in_fmt_ctx, &pkt);
        if (ret < 0) {
            break;
        }

        in_stream = in_fmt_ctx->streams[pkt.stream_index];
        out_stream = out_fmt_ctx->streams[pkt.stream_index];

        /* copy packet */
        pkt.pts = av_rescale_q_rnd(pkt.pts, in_stream->time_base, out_stream->time_base,AV_ROUND_NEAR_INF | AV_ROUND_PASS_MINMAX) ;
        pkt.dts = av_rescale_q_rnd(pkt.dts, in_stream->time_base, out_stream->time_base,AV_ROUND_NEAR_INF | AV_ROUND_PASS_MINMAX);
        pkt.duration = av_rescale_q(pkt.duration, in_stream->time_base, out_stream->time_base);
        pkt.pos = -1;
       // if(pkt.stream_index==0){
       //     log_packet(in_fmt_ctx, &pkt, "in");
      //  }

        ret = av_interleaved_write_frame(out_fmt_ctx, &pkt);
        if (ret < 0) {
            fprintf(stderr, "Error muxing packet\n");
            break;
        }
        av_packet_unref(&pkt);
    }
    return 1;
}


int main(int argc, char **argv) {

    /*
    char *ts_files[] = {
            "D://Users/yzd/CLionProjects/testc/output000.ts",
            "D://Users/yzd/CLionProjects/testc/output001.ts",
            "D://Users/yzd/CLionProjects/testc/output002.ts",
            "D://Users/yzd/CLionProjects/testc/output003.ts",
            "D://Users/yzd/CLionProjects/testc/output004.ts",
            "D://Users/yzd/CLionProjects/testc/output005.ts"
    };
    */

    int files_count=216;

    char ts_files[files_count][60];

    for (int i = 0; i < 216; ++i) {
        sprintf(ts_files[i],"F://puppeteer/tencentTools/new/龙岭迷窟/15/%d.ts",i+1);
    }
//https://blog.csdn.net/y601500359/article/details/97648359?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-4.nonecase&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-4.nonecase
   //https://blog.csdn.net/qq_32609385/article/details/52798275

    int ret;
    char *in_filename = NULL;
    char *out_filename = "F://puppeteer/tencentTools/new/龙岭迷窟/15/yzd2.mp4";
    AVOutputFormat *out_fmt = NULL;

    AVFormatContext *out_fmt_ctx = NULL;
    avformat_alloc_output_context2(&out_fmt_ctx, NULL, NULL, out_filename);
    if (!out_fmt_ctx) {
        fprintf(stderr, "Could not create output context\n");
        goto end;
    }
    out_fmt = out_fmt_ctx->oformat;
    if (!(out_fmt->flags & AVFMT_NOFILE)) {
        ret = avio_open(&out_fmt_ctx->pb, out_filename, AVIO_FLAG_WRITE);
        if (ret < 0) {
            fprintf(stderr, "Could not open output file '%s'", out_filename);
            goto end;
        }
    }


    in_filename = ts_files[0];
    AVFormatContext *in_fmt_ctx = NULL;
    if ((ret = avformat_open_input(&in_fmt_ctx, in_filename, 0, 0)) < 0) {
        fprintf(stderr, "Could not open input file '%s'", in_filename);
        goto end;
    }

    if ((ret = avformat_find_stream_info(in_fmt_ctx, 0)) < 0) {
        fprintf(stderr, "Failed to retrieve input stream information");
        goto end;
    }

    /*
     * https://blog.csdn.net/romantic_energy/article/details/50508332
    AnnexB和AVCC区别有两点：一个是参数集(SPS, PPS)组织格式；一个是分隔。

    - Annex-B：使用start code分隔NAL(start code为三字节或四字节，0x000001或0x00000001，一般是四字节)；SPS和PPS按流的方式写在头部。

    - AVCC：使用NALU长度（固定字节，通常为4字节）分隔NAL；在头部包含extradata(或sequence header)的结构体。extradata包含分隔的字节数、SPS和PPS
    */
    ret = copy_parameters(in_fmt_ctx, out_fmt_ctx);
    if (ret < 0)
        goto end;
    avformat_close_input(&in_fmt_ctx);


    ret = avformat_write_header(out_fmt_ctx, NULL);
    if (ret < 0) {
        fprintf(stderr, "Error occurred when opening output file\n");
        goto end;
    }


    for (int file_index = 0; file_index < files_count; file_index++) {
        in_filename = ts_files[file_index];

        if ((ret = avformat_open_input(&in_fmt_ctx, in_filename, 0, 0)) < 0) {
            fprintf(stderr, "Could not open input file '%s'", in_filename);
            goto end;
        }

        if ((ret = avformat_find_stream_info(in_fmt_ctx, 0)) < 0) {
            fprintf(stderr, "Failed to retrieve input stream information");
            goto end;
        }

        write_frame(in_fmt_ctx, out_fmt_ctx);
        avformat_close_input(&in_fmt_ctx);
       // printf("%s\n", ts_files[file_index]);
    }


    av_write_trailer(out_fmt_ctx);


    /* close output */
    if (out_fmt_ctx && !(out_fmt->flags & AVFMT_NOFILE))
        avio_closep(&out_fmt_ctx->pb);

    end:
    avformat_free_context(out_fmt_ctx);

}


void log_packet(const AVFormatContext *fmt_ctx, const AVPacket *pkt, const char *tag) {
    AVRational *time_base = &fmt_ctx->streams[pkt->stream_index]->time_base;
    /*
    printf("%s: pts:%s pts_time:%s dts:%s dts_time:%s duration:%s duration_time:%s stream_index:%d\n",
           tag,
           av_ts2str(pkt->pts), av_ts2timestr(pkt->pts, time_base),
           av_ts2str(pkt->dts), av_ts2timestr(pkt->dts, time_base),
           av_ts2str(pkt->duration), av_ts2timestr(pkt->duration, time_base),
           pkt->stream_index);
*/
   // if(pkt->dts>pkt->pts){
        printf("%s: pts_time:%s   dts_time:%s   duration_time:%s  %d\n",
               tag,
               av_ts2timestr(pkt->pts, time_base),
               av_ts2timestr(pkt->dts, time_base),
               av_ts2timestr(pkt->duration, time_base),pkt->stream_index);
   // }

}
